import { MenuCategory } from "../MenuCategory/MenuCategory";
import { menu } from "../../data/menu";

import "./menu-page.css";

type MenuPageData = {
  title: string;
};

export function MenuPage(props: MenuPageData) {
  return (
    <main id="menu" className="menu-page">
      <h2 className="menu-page__title">{props.title}</h2>

      <div className="menu-page__grid">
        {menu.map((category) => (
          <MenuCategory
            key={category.title}
            title={category.title}
            items={category.items}
          />
        ))}
      </div>
    </main>
  );
}
