import { MenuItem, type MenuItemData } from "../MenuItem/MenuItem";
import "./menu-category.css";

type MenuCategoryData = {
  title: string;
  items: MenuItemData[];
};

export function MenuCategory(props: MenuCategoryData) {
  return (
    <section className="menu-category">
      <h3 className="menu-category__title">{props.title}</h3>

      <div className="menu-category__items">
        {props.items.map((item) => (
          <MenuItem key={item.itemName} {...item} />
        ))}
      </div>
    </section>
  );
}
