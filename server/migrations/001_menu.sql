CREATE TABLE menu_categories (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL UNIQUE
);

CREATE TABLE menu_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id bigint NOT NULL REFERENCES menu_categories (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  image_url text NOT NULL,
  image_alt text NOT NULL,
  sort_order integer NOT NULL,
  available boolean NOT NULL DEFAULT true,
  UNIQUE (category_id, name),
  UNIQUE (category_id, sort_order)
);

INSERT INTO menu_categories (name, sort_order)
VALUES ('Starters', 1), ('Main Courses', 2), ('Desserts', 3);

INSERT INTO menu_items (
  category_id,
  name,
  description,
  price,
  image_url,
  image_alt,
  sort_order
)
SELECT category.id, item.name, item.description, item.price, item.image_url, item.image_alt, item.sort_order
FROM (
  VALUES
    ('Starters', 'Garlic and Herb Brushcetta', 'Toasted sourdough with tomato, basil, garlic, olive oil, and balsamic glaze.', 7.50, './images/garlic-and-herb-bruschetta.webp', 'Garlic and herb bruschetta', 1),
    ('Starters', 'Crispy Calamari', 'Lightly breaded calamari with lemon and creamy garlic dip.', 8.50, './images/crispy-calamari.webp', 'Crispy calamari', 2),
    ('Starters', 'Creamy Mushroom Soup', 'Creamy mushroom soup with garlic, thyme, and toasted bread.', 6.50, './images/creamy-mushroom-soup.webp', 'Creamy mushroom soup', 3),
    ('Main Courses', 'Grilled Herb Chicken', 'Rosemary-garlic grilled chicken with roasted potatoes and seasonal vegetables.', 14.50, './images/grilled-herb-chicken.webp', 'Grilled herb chicken', 1),
    ('Main Courses', 'Creamy Tuscan Pasta', 'Penne with creamy Parmesan, sun-dried tomatoes, spinach, and grilled chicken.', 13.50, './images/creamy-tuscan-pasta.webp', 'Creamy tuscan pasta', 2),
    ('Main Courses', 'Pan-Seared Salmon', 'Salmon with lemon-butter sauce, mashed potatoes, and sautéed greens.', 13.00, './images/pan-seared-salmon.webp', 'Pan-seared salmon', 3),
    ('Desserts', 'classic Chocolate Cake', 'Chocolate sponge layered with ganache, served with vanilla ice cream.', 6.50, './images/classic-chocolate-cake.webp', 'Classic chocolate cake', 1),
    ('Desserts', 'New York Cheesecake', 'Baked cheesecake on a buttery biscuit crust, topped with fresh berries.', 15.50, './images/new-york-cheesecake.webp', 'New York cheesecake', 2),
    ('Desserts', 'Mango Panna Cotta', 'Vanilla panna cotta with mango coulis and tropical fruit.', 6.00, './images/mango-panna-cotta.webp', 'Mango panna cotta', 3)
) AS item(category_name, name, description, price, image_url, image_alt, sort_order)
JOIN menu_categories AS category ON category.name = item.category_name;
