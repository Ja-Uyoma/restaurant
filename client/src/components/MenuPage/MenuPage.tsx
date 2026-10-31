import { useEffect, useState } from "react";
import { MenuCategory } from "../MenuCategory/MenuCategory";
import { apiUrl, authenticatedApiRequest } from "../../lib/api";

interface MenuCategoryData {
  title: string;
  items: {
    id: string;
    imgUrl: string;
    imgAlt: string;
    itemName: string;
    itemDescription: string;
    itemPrice: number;
  }[];
}

interface MenuPageProps {
  title: string;
}

export function MenuPage(props: Readonly<MenuPageProps>) {
  const [menu, setMenu] = useState<MenuCategoryData[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [orderingItemId, setOrderingItemId] = useState<string | null>(null);
  const [isCheckoutPending, setIsCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetch(apiUrl("/api/menu"))
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load the menu.");
        }
        return (await response.json()) as MenuCategoryData[];
      })
      .then((categories) => {
        if (isMounted) {
          setMenu(categories);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(
            loadError instanceof Error && loadError.message
              ? loadError.message
              : "Unable to load the menu.",
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

  async function handleOrderNow(menuItemId: string) {
    setOrderingItemId(menuItemId);
    setIsCheckoutPending(true);
    setCheckoutError("");

    try {
      const response = await authenticatedApiRequest("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ menuItemId, quantity: 1 }] }),
      });
      const result = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok) {
        if (response.status === 401) {
          window.dispatchEvent(new Event("restaurant:sign-in-required"));
          throw new Error("Sign in to your account before placing an order.");
        }
        throw new Error(result.error || "Unable to start checkout.");
      }
      if (!result.checkoutUrl) {
        throw new Error("The checkout service did not return a payment link.");
      }

      window.location.assign(result.checkoutUrl);
    } catch (checkoutRequestError) {
      setCheckoutError(
        checkoutRequestError instanceof Error
          ? checkoutRequestError.message
          : "Unable to start checkout.",
      );
      setIsCheckoutPending(false);
      setOrderingItemId(null);
    }
  }

  return (
    <main id="menu" className="bg-base-100 px-5 py-20 sm:py-24">
      <div className="section-wrap">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow mb-3">Made fresh, served with love</p>
          <h2 className="section-title">{props.title}</h2>
          <p className="mt-4 text-base leading-7 text-base-content/70">
            From a little something to start to one last sweet bite, find your
            new favourite at Bella Tavola.
          </p>
        </header>

        {isLoading && (
          <output className="block rounded-box bg-base-200 p-6 text-center text-base-content/70">
            Preparing the menu…
          </output>
        )}
        {error && (
          <p
            className="rounded-field bg-error px-4 py-3 text-error-content"
            role="alert"
          >
            {error}
          </p>
        )}
        {checkoutError && (
          <p className="mb-6 rounded-field bg-error px-4 py-3 text-error-content" role="alert">
            {checkoutError}
          </p>
        )}
        {!isLoading && !error && (
          <div className="flex flex-col gap-12">
            {menu.map((category) => (
              <MenuCategory
                key={category.title}
                title={category.title}
                items={category.items}
                orderingItemId={orderingItemId}
                isCheckoutPending={isCheckoutPending}
                onOrderNow={handleOrderNow}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
