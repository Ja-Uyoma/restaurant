interface MenuItemProps {
  imgUrl: string;
  imgAlt: string;
  itemName: string;
  itemDescription: string;
  itemPrice: number;
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
      <div className="flex min-h-36 flex-col p-5">
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
      </div>
    </article>
  );
}
