interface MenuItemProps {
  id: string;
  imgUrl: string;
  imgAlt: string;
  itemName: string;
  itemDescription: string;
  itemPrice: number;
  isOrdering: boolean;
  isCheckoutPending: boolean;
  onOrderNow: (menuItemId: string) => void;
}

export function MenuItem(props: Readonly<MenuItemProps>) {
  return (
    <article className="group overflow-hidden rounded-box border border-base-300/80 bg-base-100 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <figure className="m-0 aspect-[16/10] overflow-hidden bg-base-200">
        <img
          src={props.imgUrl}
          alt={props.imgAlt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </figure>
      <div className="flex min-h-52 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="m-0 font-montserrat text-lg leading-snug font-bold text-base-content">
            {props.itemName}
          </h4>
          <p className="m-0 flex-none rounded-full bg-secondary px-3 py-1 text-sm font-extrabold text-secondary-content">
            ${props.itemPrice.toFixed(2)}
          </p>
        </div>
        <p className="mt-2 mb-0 text-sm leading-6 text-base-content/75">
          {props.itemDescription}
        </p>
        <button
          className="mt-auto min-h-11 w-full cursor-pointer rounded-full border-0 bg-primary px-4 py-2 text-sm font-bold text-primary-content transition-colors hover:bg-secondary hover:text-secondary-content disabled:cursor-wait disabled:opacity-60"
          type="button"
          disabled={props.isCheckoutPending}
          onClick={() => props.onOrderNow(props.id)}
        >
          {props.isOrdering ? "Opening secure checkout…" : "Order Now"}
        </button>
      </div>
    </article>
  );
}
