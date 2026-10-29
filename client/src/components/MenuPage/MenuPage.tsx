import { useEffect, useState } from "react";
import { MenuCategory } from "../MenuCategory/MenuCategory";
import { apiUrl } from "../../lib/api";

interface MenuCategoryData {
  title: string;
  items: {
    imgUrl: string;
    imgAlt: string;
    itemName: string;
    itemDescription: string;
    itemPrice: number;
  }[];
}

interface MenuPageProps {
  title: string;
}

export function MenuPage(props: Readonly<MenuPageProps>) {
  const [menu, setMenu] = useState<MenuCategoryData[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch(apiUrl("/api/menu"))
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load the menu.");
        }
        return (await response.json()) as MenuCategoryData[];
      })
      .then((categories) => {
        if (isMounted) {
          setMenu(categories);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(
            loadError instanceof Error && loadError.message
              ? loadError.message
              : "Unable to load the menu.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main id="menu" className="px-5">
      <h2 className="mt-6 mb-1 text-center font-montserrat text-2xl text-espresso">
        {props.title}
      </h2>

      {isLoading && <output>Loading menu…</output>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && (
        <div className="grid gap-x-4 gap-y-2 md:grid-cols-3 md:grid-rows-[repeat(4,auto)]">
          {menu.map((category) => (
            <MenuCategory
              key={category.title}
              title={category.title}
              items={category.items}
            />
          ))}
        </div>
      )}
    </main>
  );
}
