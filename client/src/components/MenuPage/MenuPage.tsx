import { useEffect, useState } from "react";
import { MenuCategory } from "../MenuCategory/MenuCategory";
import { apiUrl } from "../../lib/api";

interface MenuCategoryData {
  title: string;
  items: {
    id: string;
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
    <main id="menu" className="bg-base-100 px-5 py-20 sm:py-24">
      <div className="section-wrap">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow mb-3">Made fresh, served with love</p>
          <h2 className="section-title">{props.title}</h2>
          <p className="mt-4 text-base leading-7 text-base-content/70">
            From a little something to start to one last sweet bite, find your
            new favourite at Bella Tavola.
          </p>
        </header>

        {isLoading && (
          <output className="block rounded-box bg-base-200 p-6 text-center text-base-content/70">
            Preparing the menu…
          </output>
        )}
        {error && (
          <p
            className="rounded-field bg-error px-4 py-3 text-error-content"
            role="alert"
          >
            {error}
          </p>
        )}
        {!isLoading && !error && (
          <div className="flex flex-col gap-12">
            {menu.map((category) => (
              <MenuCategory
                key={category.title}
                title={category.title}
                items={category.items}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
