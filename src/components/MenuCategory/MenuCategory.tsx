import { MenuItem, type MenuItemData } from "../MenuItem/MenuItem";

export type MenuCategoryData = {
  title: string;
  items: MenuItemData[];
};

export function MenuCategory(props: Readonly<MenuCategoryData>) {
  return (
    <section className="md:row-span-4 md:grid md:grid-rows-subgrid">
      <h3 className="font-montserrat text-xl">{props.title}</h3>

      <div className="flex flex-col gap-1 md:contents">
        {props.items.map((item) => (
          <MenuItem key={item.itemName} {...item} />
        ))}
      </div>
    </section>
  );
}
