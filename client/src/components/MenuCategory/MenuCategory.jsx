import { MenuItem } from "../MenuItem/MenuItem";

export function MenuCategory(props) {
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
