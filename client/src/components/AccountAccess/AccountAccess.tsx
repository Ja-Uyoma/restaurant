import { useEffect, useState, type FormEvent } from "react";
import { apiUrl } from "../../lib/api";
import { authClient } from "../../lib/auth";

interface AccountUser {
  email: string | null;
}

interface ApiMeResponse {
  user?: {
    id: string;
    email: string | null;
  };
  error?: string;
}

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

export function AccountAccess() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    authClient
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (sessionError) {
          throw new Error(sessionError.message);
        }
        if (isMounted) {
          setUser(data?.user ?? null);
        }
      })
      .catch((sessionError) => {
        if (isMounted) {
          setError(
            getErrorMessage(sessionError, "Unable to load your account."),
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const email = getFormValue(formData, "email");
      const password = getFormValue(formData, "password");
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({
              name: getFormValue(formData, "name"),
              email,
              password,
            })
          : await authClient.signIn.email({ email, password });

      if (result.error) {
        throw new Error(result.error.message);
      }
      setUser(result.data?.user ?? null);
      if (mode === "sign-up") {
        setMessage(
          "Account created. Check your email if verification is required.",
        );
      }
    } catch (submitError) {
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

    try {
      const result = await authClient.signOut();
      if (result.error) {
        throw new Error(result.error.message);
      }
      setUser(null);
    } catch (signOutError) {
      setError(getErrorMessage(signOutError, "Unable to sign out."));
    }
  }

  async function handleApiCheck() {
    setError("");
    setMessage("");

    try {
      const tokenResult = await authClient.token();
      if (tokenResult.error) {
        throw new Error(tokenResult.error.message);
      }
      if (!tokenResult.data?.token) {
        throw new Error("A sign-in token was not returned.");
      }

      const response = await fetch(apiUrl("/api/me"), {
        headers: {
          Authorization: `Bearer ${tokenResult.data.token}`,
        },
      });
      const result = (await response.json()) as ApiMeResponse;

      if (!response.ok) {
        throw new Error(result.error || "The API rejected this session.");
      }
      if (!result.user) {
        throw new Error("The API returned an invalid response.");
      }

      setMessage(
        `Protected API verified for ${result.user.email || result.user.id}.`,
      );
    } catch (apiError) {
      setError(
        getErrorMessage(apiError, "Unable to verify the protected API."),
      );
    }
  }

  return (
    <section
      aria-labelledby="account-heading"
      className="border-y border-base-300 bg-secondary/35 px-5 py-10"
    >
      <div className="section-wrap grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div>
          <p className="eyebrow mb-3">Your table is waiting</p>
          <h2 id="account-heading" className="section-title text-3xl">
            Customer and staff accounts
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-base-content/70">
            Sign in to access your account and enjoy your Bella Tavola
            experience.
          </p>
        </div>

        <div className="rounded-box border border-base-300/80 bg-base-100 p-5 shadow-sm sm:p-7">
          {isLoading ? (
            <p className="m-0 text-sm text-base-content/70" role="status">
              Checking account…
            </p>
          ) : user ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="m-0 text-sm text-base-content">
                Signed in as <span className="font-bold">{user.email}</span>.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="min-h-11 cursor-pointer rounded-full border-0 bg-primary px-5 py-2 text-sm font-bold text-primary-content transition-colors hover:bg-secondary"
                  type="button"
                  onClick={handleApiCheck}
                >
                  Verify access
                </button>
                <button
                  className="min-h-11 cursor-pointer rounded-full border border-base-300 bg-base-100 px-5 py-2 text-sm font-bold text-base-content transition-colors hover:bg-base-200"
                  type="button"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-5 flex gap-2">
                <button
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition-colors ${mode === "sign-in" ? "bg-primary text-primary-content" : "bg-base-200 text-base-content hover:bg-base-300"}`}
                  type="button"
                  aria-pressed={mode === "sign-in"}
                  onClick={() => setMode("sign-in")}
                >
                  Sign in
                </button>
                <button
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition-colors ${mode === "sign-up" ? "bg-primary text-primary-content" : "bg-base-200 text-base-content hover:bg-base-300"}`}
                  type="button"
                  aria-pressed={mode === "sign-up"}
                  onClick={() => setMode("sign-up")}
                >
                  Create account
                </button>
              </div>

              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={handleSubmit}
              >
                {mode === "sign-up" && (
                  <label className="flex flex-col gap-2 text-sm font-bold text-base-content">
                    Name
                    <input
                      autoComplete="name"
                      className="min-h-12 rounded-field border border-base-300 bg-base-100 px-4 font-normal"
                      name="name"
                      required
                    />
                  </label>
                )}
                <label className="flex flex-col gap-2 text-sm font-bold text-base-content">
                  Email
                  <input
                    autoComplete="email"
                    className="min-h-12 rounded-field border border-base-300 bg-base-100 px-4 font-normal"
                    name="email"
                    type="email"
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
                <button
                  className="min-h-12 cursor-pointer self-end rounded-full border-0 bg-primary px-5 py-3 font-bold text-primary-content transition-colors hover:bg-secondary disabled:cursor-wait disabled:opacity-60 sm:col-span-2"
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
            </>
          )}

          {message && (
            <p className="mt-4 rounded-field bg-success px-4 py-3 text-sm text-success-content" role="status">
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
      </div>
    </section>
  );
}
