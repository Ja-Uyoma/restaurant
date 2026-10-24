import { useEffect, useState } from "react";
import { apiUrl } from "../../lib/api";
import { authClient } from "../../lib/auth";

export function AccountAccess() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("sign-in");
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
          setError(sessionError.message || "Unable to load your account.");
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

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email").toString();
    const password = formData.get("password").toString();

    try {
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({
              name: formData.get("name").toString(),
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
      setError(submitError.message || "Unable to complete the request.");
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
      setError(signOutError.message || "Unable to sign out.");
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
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "The API rejected this session.");
      }

      setMessage(
        `Protected API verified for ${result.user.email || result.user.id}.`,
      );
    } catch (apiError) {
      setError(apiError.message || "Unable to verify the protected API.");
    }
  }

  return (
    <section
      id="account"
      aria-labelledby="account-heading"
      className="mx-5 my-6 rounded-md border border-[#dfc7b6] bg-clay p-4"
    >
      <h2
        id="account-heading"
        className="mb-3 font-montserrat text-xl text-olive"
      >
        Customer and Staff Accounts
      </h2>

      {isLoading ? (
        <p role="status">Checking account…</p>
      ) : user ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="m-0">Signed in as {user.email}.</p>
          <p className="m-0 break-all text-sm">
            Account ID (for staff access): {user.id}
          </p>
          <button
            className="cursor-pointer rounded border-0 bg-paprika px-3 py-2 text-white"
            type="button"
            onClick={handleApiCheck}
          >
            Verify protected API access
          </button>
          <button
            className="cursor-pointer rounded border border-espresso bg-transparent px-3 py-2 text-espresso"
            type="button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 flex gap-2">
            <button
              className="cursor-pointer border-0 bg-transparent px-2 py-1 font-semibold text-espresso underline"
              type="button"
              aria-pressed={mode === "sign-in"}
              onClick={() => setMode("sign-in")}
            >
              Sign in
            </button>
            <button
              className="cursor-pointer border-0 bg-transparent px-2 py-1 font-semibold text-espresso underline"
              type="button"
              aria-pressed={mode === "sign-up"}
              onClick={() => setMode("sign-up")}
            >
              Create account
            </button>
          </div>

          <form className="flex flex-col gap-3 md:max-w-xl" onSubmit={handleSubmit}>
            {mode === "sign-up" && (
              <label className="flex flex-col gap-1">
                Name
                <input
                  autoComplete="name"
                  className="rounded border border-[#cbb9a8] bg-parchment px-3 py-2 text-ink"
                  name="name"
                  required
                />
              </label>
            )}
            <label className="flex flex-col gap-1">
              Email
              <input
                autoComplete="email"
                className="rounded border border-[#cbb9a8] bg-parchment px-3 py-2 text-ink"
                name="email"
                type="email"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              Password
              <input
                autoComplete={
                  mode === "sign-up" ? "new-password" : "current-password"
                }
                className="rounded border border-[#cbb9a8] bg-parchment px-3 py-2 text-ink"
                minLength="8"
                name="password"
                type="password"
                required
              />
            </label>
            <button
              className="cursor-pointer rounded border-0 bg-paprika px-3 py-2 text-white disabled:cursor-wait disabled:opacity-60"
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

      {message && <p role="status">{message}</p>}
      {error && (
        <p className="text-paprika" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
