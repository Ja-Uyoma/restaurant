import { MenuItem } from "../MenuItem/MenuItem";

interface MenuItemData {
  imgUrl: string;
  imgAlt: string;
  itemName: string;
  itemDescription: string;
  itemPrice: number;
}

interface MenuCategoryProps {
  title: string;
  items: MenuItemData[];
}

export function MenuCategory(props: Readonly<MenuCategoryProps>) {
  return (
    <section className="md:row-span-4 md:grid md:grid-rows-subgrid">
      <h3 className="my-4 font-montserrat text-xl text-olive">{props.title}</h3>

      <div className="flex flex-col gap-1 md:contents">
        {props.items.map((item) => (
          <MenuItem key={item.itemName} {...item} />
        ))}
      </div>
    </section>
  );
}
