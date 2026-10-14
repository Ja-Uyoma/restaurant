import "./menu-item.css";

type MenuItemProps = {
  imgUrl: string;
  imgAlt: string;
  itemName: string;
  itemDescription: string;
  itemPrice: number;
};

export function MenuItem(props: MenuItemProps) {
  return (
    <>
      <article className="menu-item">
        <figure className="menu-item__figure">
          <img
            src={props.imgUrl}
            alt={props.imgAlt}
            className="menu-item__image"
          />
        </figure>
        <div className="menu-item__details">
          <p className="menu-item__name">{props.itemName}</p>
          <p className="menu-item__description">{props.itemDescription}</p>
        </div>
        <p className="menu-item__price">${props.itemPrice}</p>
      </article>
    </>
  );
}
