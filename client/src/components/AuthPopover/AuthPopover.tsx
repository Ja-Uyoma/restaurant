import { useEffect, useRef, useState, type FormEvent } from "react";
import { apiUrl } from "../../lib/api";
import { authClient, isLocalAuth } from "../../lib/auth";
import {
  localAuth,
  type AppRole,
  type LocalAuthUser,
} from "../../lib/localAuth";

interface AccountUser {
  id: string;
  email: string | null;
  username: string | null;
  name: string | null;
  role: AppRole | null;
}

interface ApiMeResponse {
  user?: {
    id: string;
    email: string | null;
    username: string | null;
    name: string | null;
    role: AppRole;
  };
  error?: string;
}

type AuthMode = "sign-in" | "sign-up";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getFormValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string") {
    throw new Error(`Missing ${name} field.`);
  }
  return value;
}

function getLocalAccount(user: LocalAuthUser | null): AccountUser | null {
  return user
    ? {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      }
    : null;
}

export function AuthPopover() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        if (isLocalAuth) {
          const localUser = await localAuth.getSession();
          if (isMounted) {
            setUser(getLocalAccount(localUser));
          }
        } else {
          if (!authClient) {
            throw new Error("Neon Auth is not configured.");
          }
          const { data, error: sessionError } = await authClient.getSession();
          if (sessionError) {
            throw new Error(sessionError.message);
          }
          if (isMounted) {
            setUser(
              data?.user
                ? {
                    id: data.user.id,
                    email: data.user.email,
                    username: null,
                    name: data.user.name,
                    role: null,
                  }
                : null,
            );
          }
        }
      } catch (sessionError: unknown) {
        if (isMounted) {
          setError(
            getErrorMessage(sessionError, "Unable to load your account."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isDialogOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isDialogOpen && dialog.open) {
      dialog.close();
    }
  }, [isDialogOpen]);

  useEffect(() => {
    function handleSignInRequired() {
      setIsPopoverOpen(true);
      setMode("sign-in");
      setError("");
      setMessage("");
      setIsDialogOpen(true);
    }

    window.addEventListener("restaurant:sign-in-required", handleSignInRequired);
    return () =>
      window.removeEventListener(
        "restaurant:sign-in-required",
        handleSignInRequired,
      );
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !popoverRef.current?.contains(event.target)
      ) {
        setIsPopoverOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !dialogRef.current?.open) {
        setIsPopoverOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function openDialog(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setIsDialogOpen(true);
  }

  function handleDialogClose() {
    setIsDialogOpen(false);
  }

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const usernameOrEmail = getFormValue(
        formData,
        isLocalAuth ? "username" : "email",
      );
      const password = getFormValue(formData, "password");
      if (isLocalAuth) {
        const account =
          mode === "sign-up"
            ? await localAuth.signUp(
                getFormValue(formData, "name"),
                usernameOrEmail,
                password,
              )
            : await localAuth.signIn(usernameOrEmail, password);
        setUser(getLocalAccount(account));
      } else {
        if (!authClient) {
          throw new Error("Neon Auth is not configured.");
        }
        const result =
          mode === "sign-up"
            ? await authClient.signUp.email({
                name: getFormValue(formData, "name"),
                email: usernameOrEmail,
                password,
              })
            : await authClient.signIn.email({
                email: usernameOrEmail,
                password,
              });

        if (result.error) {
          throw new Error(result.error.message);
        }
        const account = result.data?.user;
        setUser(
          account
            ? {
                id: account.id,
                email: account.email,
                username: null,
                name: account.name,
                role: null,
              }
            : null,
        );
      }
      if (mode === "sign-up") {
        setMessage(
          isLocalAuth
            ? "Local account created with the customer role."
            : "Account created. Check your email if verification is required.",
        );
      } else {
        setMessage("You are signed in.");
      }
      setIsDialogOpen(false);
    } catch (submitError: unknown) {
      setError(
        getErrorMessage(submitError, "Unable to complete the request."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setError("");
    setMessage("");
    setIsSigningOut(true);

    try {
      if (isLocalAuth) {
        await localAuth.signOut();
      } else {
        if (!authClient) {
          throw new Error("Neon Auth is not configured.");
        }
        const result = await authClient.signOut();
        if (result.error) {
          throw new Error(result.error.message);
        }
      }
      setUser(null);
      setMessage("You are signed out.");
    } catch (signOutError: unknown) {
      setError(getErrorMessage(signOutError, "Unable to sign out."));
    } finally {
      setIsSigningOut(false);
    }
  }

  async function handleApiCheck() {
    setError("");
    setMessage("");
    setIsCheckingAccess(true);

    try {
      const headers = new Headers();
      if (!isLocalAuth) {
        if (!authClient) {
          throw new Error("Neon Auth is not configured.");
        }
        const tokenResult = await authClient.token();
        if (tokenResult.error) {
          throw new Error(tokenResult.error.message);
        }
        if (!tokenResult.data?.token) {
          throw new Error("A sign-in token was not returned.");
        }
        headers.set("Authorization", `Bearer ${tokenResult.data.token}`);
      }

      const response = await fetch(apiUrl("/api/me"), {
        credentials: isLocalAuth ? "include" : "same-origin",
        headers,
      });
      const result = (await response.json()) as ApiMeResponse;

      if (!response.ok) {
        throw new Error(result.error || "The API rejected this session.");
      }
      if (!result.user) {
        throw new Error("The API returned an invalid response.");
      }

      const roleCheckResponse = await fetch(
        apiUrl(`/api/${result.user.role}/check`),
        {
          credentials: isLocalAuth ? "include" : "same-origin",
          headers,
        },
      );
      if (!roleCheckResponse.ok) {
        const roleCheckResult = (await roleCheckResponse.json()) as {
          error?: string;
        };
        throw new Error(
          roleCheckResult.error || "The API rejected this role.",
        );
      }

      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              ...result.user,
            }
          : currentUser,
      );
      setMessage(
        `${result.user.role} access verified for ${result.user.email || result.user.username || result.user.id}.`,
      );
    } catch (apiError: unknown) {
      setError(
        getErrorMessage(apiError, "Unable to verify the protected API."),
      );
    } finally {
      setIsCheckingAccess(false);
    }
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        ref={triggerRef}
        className="min-h-10 cursor-pointer rounded-full border border-base-300 bg-base-100 px-3 py-2 text-xs font-bold text-base-content transition-colors hover:bg-base-200 sm:min-h-11 sm:px-4 sm:text-sm"
        type="button"
        aria-expanded={isPopoverOpen}
        aria-controls="auth-popover-panel"
        aria-haspopup="dialog"
        aria-busy={isLoading}
        onClick={() => setIsPopoverOpen((isOpen) => !isOpen)}
      >
        {user ? "My account" : "Sign in"}
      </button>

      {isPopoverOpen && (
        <div
          id="auth-popover-panel"
          className="fixed inset-x-3 top-[4.75rem] z-50 w-auto rounded-box border border-base-300 bg-base-100 p-5 shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[min(22rem,calc(100vw-2.5rem))]"
          role="dialog"
          aria-modal="false"
          aria-label="Account"
        >
          {isLoading ? (
            <p className="m-0 text-sm text-base-content/70" role="status">
              Checking account…
            </p>
          ) : user ? (
            <div className="grid gap-3">
              <p className="m-0 text-sm leading-6 text-base-content">
                Signed in as{" "}
                <span className="font-bold">
                  {user.username || user.email || user.name || "your account"}
                </span>
                {user.role && (
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-base-content/60">
                    {user.role} account
                  </span>
                )}
              </p>
              <button
                className="min-h-11 cursor-pointer rounded-full border-0 bg-primary px-4 py-2 text-sm font-bold text-primary-content transition-colors hover:bg-secondary disabled:cursor-wait disabled:opacity-60"
                type="button"
                disabled={isCheckingAccess}
                onClick={handleApiCheck}
              >
                {isCheckingAccess ? "Checking access…" : "Verify access"}
              </button>
              <button
                className="min-h-11 cursor-pointer rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm font-bold text-base-content transition-colors hover:bg-base-200 disabled:cursor-wait disabled:opacity-60"
                type="button"
                disabled={isSigningOut}
                onClick={handleSignOut}
              >
                {isSigningOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              <p className="m-0 text-sm leading-6 text-base-content/70">
                Sign in to your account or create one to get started.
              </p>
              <button
                className="min-h-11 cursor-pointer rounded-full border-0 bg-primary px-4 py-2 text-sm font-bold text-primary-content transition-colors hover:bg-secondary"
                type="button"
                onClick={() => openDialog("sign-in")}
              >
                Sign in
              </button>
              <button
                className="min-h-11 cursor-pointer rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm font-bold text-base-content transition-colors hover:bg-base-200"
                type="button"
                onClick={() => openDialog("sign-up")}
              >
                Create account
              </button>
            </div>
          )}

          {message && (
            <p
              className="mt-4 rounded-field bg-success px-4 py-3 text-sm text-success-content"
              role="status"
            >
              {message}
            </p>
          )}
          {error && (
            <p
              className="mt-4 rounded-field bg-error px-4 py-3 text-sm text-error-content"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(30rem,calc(100vw-2.5rem))] rounded-box border border-base-300 bg-base-100 p-0 text-base-content shadow-2xl backdrop:bg-black/50"
        aria-labelledby="auth-dialog-title"
        onClose={handleDialogClose}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            setIsDialogOpen(false);
          }
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Bella Tavola</p>
              <h2
                id="auth-dialog-title"
                className="font-montserrat text-2xl font-bold tracking-tight"
              >
                {mode === "sign-up" ? "Create your account" : "Welcome back"}
              </h2>
            </div>
            <button
              className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-base-300 bg-base-100 text-xl text-base-content transition-colors hover:bg-base-200"
              type="button"
              aria-label="Close dialog"
              onClick={() => setIsDialogOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="mb-5 flex gap-2">
            <button
              className={`min-h-10 cursor-pointer whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition-colors sm:px-4 sm:text-sm ${mode === "sign-in" ? "bg-primary text-primary-content" : "bg-base-200 text-base-content hover:bg-base-300"}`}
              type="button"
              aria-pressed={mode === "sign-in"}
              disabled={isSubmitting}
              onClick={() => handleModeChange("sign-in")}
            >
              Sign in
            </button>
            <button
              className={`min-h-10 cursor-pointer whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition-colors sm:px-4 sm:text-sm ${mode === "sign-up" ? "bg-primary text-primary-content" : "bg-base-200 text-base-content hover:bg-base-300"}`}
              type="button"
              aria-pressed={mode === "sign-up"}
              disabled={isSubmitting}
              onClick={() => handleModeChange("sign-up")}
            >
              Create account
            </button>
          </div>

          <form className="grid gap-4" key={mode} onSubmit={handleSubmit}>
            {mode === "sign-up" && (
              <label className="flex flex-col gap-2 text-sm font-bold text-base-content">
                Name
                <input
                  autoComplete="name"
                  autoFocus
                  className="min-h-12 rounded-field border border-base-300 bg-base-100 px-4 font-normal"
                  name="name"
                  required
                />
              </label>
            )}
            <label className="flex flex-col gap-2 text-sm font-bold text-base-content">
              {isLocalAuth ? "Username" : "Email"}
              <input
                autoComplete={isLocalAuth ? "username" : "email"}
                autoFocus={mode === "sign-in"}
                className="min-h-12 rounded-field border border-base-300 bg-base-100 px-4 font-normal"
                maxLength={isLocalAuth ? 32 : undefined}
                minLength={isLocalAuth ? 3 : undefined}
                name={isLocalAuth ? "username" : "email"}
                type={isLocalAuth ? "text" : "email"}
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-bold text-base-content">
              Password
              <input
                autoComplete={
                  mode === "sign-up" ? "new-password" : "current-password"
                }
                className="min-h-12 rounded-field border border-base-300 bg-base-100 px-4 font-normal"
                minLength={8}
                name="password"
                type="password"
                required
              />
            </label>
            {error && (
              <p
                className="m-0 rounded-field bg-error px-4 py-3 text-sm text-error-content"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              className="mt-1 min-h-12 cursor-pointer rounded-full border-0 bg-primary px-5 py-3 font-bold text-primary-content transition-colors hover:bg-secondary disabled:cursor-wait disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? "Please wait…"
                : mode === "sign-up"
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
