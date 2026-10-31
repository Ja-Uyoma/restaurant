import { useEffect, useState } from "react";
import { authenticatedApiRequest } from "../../lib/api";

interface OrderDetails {
  id: string;
  status: "pending" | "paid" | "failed" | "canceled";
  currency: string;
  paidAt: string | null;
  total: string;
  items: {
    name: string;
    quantity: number;
    unit_price: string;
  }[];
}

interface CheckoutResultProps {
  sessionId: string | null;
  cancelled?: boolean;
}

const confirmationAttempts = 6;
const confirmationDelayMs = 1200;

function waitForRetry(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, confirmationDelayMs);
  });
}

function formatTotal(total: string, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(total));
}

export function CheckoutResult({
  sessionId,
  cancelled = false,
}: Readonly<CheckoutResultProps>) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [error, setError] = useState("");
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const [isChecking, setIsChecking] = useState(
    !cancelled && Boolean(sessionId),
  );
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (cancelled || !sessionId) {
      return;
    }

    const checkoutSessionId = sessionId;
    let isMounted = true;

    async function checkOrder() {
      setIsChecking(true);
      setError("");
      setRequiresSignIn(false);

      for (let attempt = 0; attempt < confirmationAttempts; attempt += 1) {
        try {
          const response = await authenticatedApiRequest(
            `/api/orders/by-session/${encodeURIComponent(checkoutSessionId)}`,
          );
          const result = (await response.json()) as {
            order?: OrderDetails;
            error?: string;
          };

          if (!response.ok) {
            if (response.status === 401) {
              setRequiresSignIn(true);
            }
            throw new Error(
              result.error ||
                (response.status === 401
                  ? "Sign in to the same account to check this order."
                  : "Unable to find this order."),
            );
          }
          if (!result.order) {
            throw new Error("The order service returned an invalid response.");
          }

          if (!isMounted) {
            return;
          }
          setOrder(result.order);
          if (result.order.status !== "pending") {
            setIsChecking(false);
            return;
          }
        } catch (lookupError) {
          if (isMounted) {
            setError(
              lookupError instanceof Error
                ? lookupError.message
                : "Unable to verify your order.",
            );
            setIsChecking(false);
          }
          return;
        }

        if (attempt < confirmationAttempts - 1) {
          await waitForRetry();
          if (!isMounted) {
            return;
          }
        }
      }

      if (isMounted) {
        setIsChecking(false);
      }
    }

    void checkOrder();
    return () => {
      isMounted = false;
    };
  }, [cancelled, retryCount, sessionId]);

  const isPaid = order?.status === "paid";
  const title = cancelled
    ? "Checkout cancelled"
    : isPaid
      ? "Payment confirmed"
      : order?.status === "failed" || order?.status === "canceled"
        ? "Payment not completed"
        : error
          ? "We couldn't verify your order"
          : "Confirming your payment";

  return (
    <main className="min-h-[65vh] px-5 py-20 sm:py-24">
      <section className="mx-auto max-w-2xl rounded-box border border-base-300 bg-base-100 p-6 shadow-sm sm:p-10">
        <p className="eyebrow mb-3">Bella Tavola</p>
        <h1 className="section-title">{title}</h1>

        {cancelled ? (
          <p className="mt-5 leading-7 text-base-content/75">
            Your payment was cancelled. No charge was made. You can return to
            the menu whenever you’re ready.
          </p>
        ) : !sessionId ? (
          <p className="mt-5 leading-7 text-error" role="alert">
            The checkout return link is missing its session ID. Please contact
            us if you completed a payment.
          </p>
        ) : error ? (
          <div className="mt-5 grid gap-4">
            <p className="m-0 leading-7 text-error" role="alert">
              {error}
            </p>
            {requiresSignIn && (
              <button
                className="min-h-11 cursor-pointer rounded-full border border-base-300 px-5 py-2 text-sm font-bold text-base-content hover:bg-base-200"
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("restaurant:sign-in-required"))
                }
              >
                Sign in to view your order
              </button>
            )}
            <button
              className="min-h-11 cursor-pointer rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-content hover:bg-secondary hover:text-secondary-content"
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <p className="mt-5 leading-7 text-base-content/75" role="status">
              {isPaid
                ? "Your order is paid and confirmed. Thank you for choosing Bella Tavola!"
                : order?.status === "failed" || order?.status === "canceled"
                  ? "This order has not been paid. You can return to the menu to try again."
                  : isChecking
                    ? "We’re checking with our payment service. This can take a few seconds."
                    : "Your payment is still being confirmed. The order will update as soon as the payment provider confirms it."}
            </p>

            {order && (
              <div className="mt-8 border-t border-base-300 pt-6">
                <h2 className="font-montserrat text-lg font-bold">
                  Order details
                </h2>
                <ul className="mt-4 grid list-none gap-3 p-0">
                  {order.items.map((item, index) => (
                    <li
                      className="flex justify-between gap-4 text-sm"
                      key={`${item.name}-${index}`}
                    >
                      <span>
                        {item.quantity} × {item.name}
                      </span>
                      <span className="font-semibold">
                        {formatTotal(
                          (Number(item.unit_price) * item.quantity).toFixed(2),
                          order.currency,
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 flex justify-between border-t border-base-300 pt-4 font-bold">
                  <span>Total</span>
                  <span>{formatTotal(order.total, order.currency)}</span>
                </p>
              </div>
            )}

            {!isPaid && !isChecking && order?.status === "pending" && (
              <button
                className="mt-4 min-h-11 cursor-pointer rounded-full border border-base-300 px-5 py-2 text-sm font-bold text-base-content hover:bg-base-200"
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Check payment status again
              </button>
            )}
          </>
        )}

        <a
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-content no-underline hover:bg-secondary hover:text-secondary-content"
          href="/#menu"
        >
          Return to menu
        </a>
      </section>
    </main>
  );
}
