import { MenuItem } from "../MenuItem/MenuItem";

interface MenuItemData {
  id: string;
  imgUrl: string;
  imgAlt: string;
  itemName: string;
  itemDescription: string;
  itemPrice: number;
}

interface MenuCategoryProps {
  title: string;
  items: MenuItemData[];
  orderingItemId: string | null;
  isCheckoutPending: boolean;
  onOrderNow: (menuItemId: string) => void;
}

export function MenuCategory(props: Readonly<MenuCategoryProps>) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="flex items-center gap-3 font-montserrat text-xl font-bold text-neutral">
        <span className="h-px flex-1 bg-base-300" />
        <span>{props.title}</span>
        <span className="h-px flex-1 bg-base-300" />
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {props.items.map((item) => (
          <MenuItem
            key={item.id}
            {...item}
            isOrdering={props.orderingItemId === item.id}
            isCheckoutPending={props.isCheckoutPending}
            onOrderNow={props.onOrderNow}
          />
        ))}
      </div>
    </section>
  );
}
