export type MenuItemData = {
  imgUrl: string;
  imgAlt: string;
  itemName: string;
  itemDescription: string;
  itemPrice: number;
};

export function MenuItem(props: Readonly<MenuItemData>) {
  return (
    <article className="flex items-baseline gap-2 rounded-md border border-[#dfc7b6] bg-clay p-1 md:transition-[transform,box-shadow] md:duration-200 md:hover:-translate-y-1 md:hover:shadow-md">
      <figure className="m-0 aspect-4/3 flex-[0_0_28%] self-center overflow-hidden rounded">
        <img
          src={props.imgUrl}
          alt={props.imgAlt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </figure>
      <div className="min-w-0 flex-[1_1_0] pb-2">
        <p className="mb-1 text-[13px] font-bold leading-[1.1] text-espresso">
          {props.itemName}
        </p>
        <p className="text-[11px] leading-[1.1]">{props.itemDescription}</p>
      </div>
      <p className="flex-none text-[13px] font-bold text-paprika">
        ${props.itemPrice.toFixed(2)}
      </p>
    </article>
  );
}
