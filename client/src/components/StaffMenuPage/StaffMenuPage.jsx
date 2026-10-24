import { useEffect, useState } from "react";
import { apiUrl } from "../../lib/api";
import { authClient } from "../../lib/auth";

export function StaffMenuPage() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStaffCategories() {
      try {
        const tokenResult = await authClient.token();
        if (tokenResult.error) {
          throw new Error(tokenResult.error.message);
        }
        if (!tokenResult.data?.token) {
          throw new Error("Sign in on the home page to access staff tools.");
        }

        const response = await fetch(apiUrl("/api/staff/menu/categories"), {
          headers: { Authorization: `Bearer ${tokenResult.data.token}` },
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Unable to verify staff access.");
        }

        if (isMounted) {
          setToken(tokenResult.data.token);
          setCategories(result);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load staff tools.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStaffCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const item = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(apiUrl("/api/staff/menu/items"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to add the menu item.");
      }

      form.reset();
      setMessage(`${result.item.name} was added to the menu.`);
    } catch (submitError) {
      setError(submitError.message || "Unable to add the menu item.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <h2 className="mb-4 font-montserrat text-2xl text-espresso">
        Staff menu tools
      </h2>
      <p className="mb-6">
        Add an item to an existing category. New items appear on the public menu.
      </p>

      {isLoading && <p role="status">Checking staff access…</p>}
      {error && (
        <div role="alert" className="mb-4 text-paprika">
          <p>{error}</p>
          <p>
            Sign in from the <a href="/#account">home page</a>. Staff access must
            be approved by the site administrator.
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <form
          className="flex flex-col gap-4 rounded-md border border-[#dfc7b6] bg-clay p-4"
          onSubmit={handleSubmit}
        >
          <label className="flex flex-col gap-1">
            Category
            <select
              className="rounded border border-[#cbb9a8] bg-parchment px-3 py-2 text-ink"
              name="category"
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Name
            <input
              className="rounded border border-[#cbb9a8] bg-parchment px-3 py-2 text-ink"
              maxLength="120"
              name="name"
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            Description
            <textarea
              className="rounded border border-[#cbb9a8] bg-parchment px-3 py-2 text-ink"
              maxLength="1000"
              name="description"
              required
              rows="3"
            />
          </label>
          <label className="flex flex-col gap-1">
            Price
            <input
              className="rounded border border-[#cbb9a8] bg-parchment px-3 py-2 text-ink"
              min="0"
              max="99999999.99"
              name="price"
              required
              step="0.01"
              type="number"
            />
          </label>
          <label className="flex flex-col gap-1">
            Image URL
            <input
              className="rounded border border-[#cbb9a8] bg-parchment px-3 py-2 text-ink"
              maxLength="2048"
              name="imageUrl"
              required
              type="url"
            />
          </label>
          <label className="flex flex-col gap-1">
            Image description
            <input
              className="rounded border border-[#cbb9a8] bg-parchment px-3 py-2 text-ink"
              maxLength="255"
              name="imageAlt"
              required
            />
          </label>
          <button
            className="cursor-pointer self-start rounded border-0 bg-paprika px-4 py-2 text-white disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Adding item…" : "Add menu item"}
          </button>
        </form>
      )}

      {message && <p role="status">{message}</p>}
      <p className="mt-6">
        <a href="/#menu">Back to the public menu</a>
      </p>
    </main>
  );
}
