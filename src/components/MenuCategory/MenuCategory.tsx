import { MenuItem } from "../MenuItem/MenuItem";

type MenuCategoryProps = {
  title: string;
};

export function MenuCategory(props: MenuCategoryProps) {
  return (
    <section className="menu-category">
      <h3 className="menu-category__title">{props.title}</h3>

      <div className="menu-category__items">
        <MenuItem
          imgUrl=""
          imgAlt=""
          itemName=""
          itemDescription=""
          itemPrice={0}
        />
        <MenuItem
          imgUrl=""
          imgAlt=""
          itemName=""
          itemDescription=""
          itemPrice={0}
        />
        <MenuItem
          imgUrl=""
          imgAlt=""
          itemName=""
          itemDescription=""
          itemPrice={0}
        />
      </div>
    </section>
  );
}
