import { MenuCategory } from "../MenuCategory/MenuCategory";
import { menu } from "../../data/menu";

type MenuPageData = {
  title: string;
};

export function MenuPage(props: Readonly<MenuPageData>) {
  return (
    <main id="menu" className="px-5">
      <h2 className="text-center font-montserrat text-2xl text-espresso">
        {props.title}
      </h2>

      <div className="grid gap-x-4 gap-y-2 md:grid-cols-3 md:grid-rows-[repeat(4,auto)]">
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
