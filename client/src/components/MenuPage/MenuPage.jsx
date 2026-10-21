import { MenuCategory } from "../MenuCategory/MenuCategory";
import { menu } from "../../data/menu";

export function MenuPage(props) {
  return (
    <main id="menu" className="px-5">
      <h2 className="mt-6 mb-1 text-center font-montserrat text-2xl text-espresso">
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
