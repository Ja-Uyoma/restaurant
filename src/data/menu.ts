import { type MenuCategoryData } from "../components/MenuCategory/MenuCategory";

export const menu: MenuCategoryData[] = [
  {
    title: "Starters",
    items: [
      {
        imgUrl: "./src/assets/images/garlic-and-herb-bruschetta.webp",
        imgAlt: "Garlic and herb bruschetta",
        itemName: "Garlic and Herb Brushcetta",
        itemDescription:
          "Toasted sourdough with tomato, basil, garlic, olive oil, and balsamic glaze.",
        itemPrice: 7.5,
      },
      {
        imgUrl: "./src/assets/images/crispy-calamari.webp",
        imgAlt: "Crispy calamari",
        itemName: "Crispy Calamari",
        itemDescription:
          "Lightly breaded calamari with lemon and creamy garlic dip.",
        itemPrice: 8.5,
      },
      {
        imgUrl: "./src/assets/images/creamy-mushroom-soup.webp",
        imgAlt: "Creamy mushroom soup",
        itemName: "Creamy Mushroom Soup",
        itemDescription:
          "Creamy mushroom soup with garlic, thyme, and toasted bread.",
        itemPrice: 6.5,
      },
    ],
  },
  {
    title: "Main Courses",
    items: [
      {
        imgUrl: "./src/assets/images/grilled-herb-chicken.webp",
        imgAlt: "Grilled herb chicken",
        itemName: "Grilled Herb Chicken",
        itemDescription:
          "Rosemary-garlic grilled chicken with roasted potatoes and seasonal vegetables.",
        itemPrice: 14.5,
      },
      {
        imgUrl: "./src/assets/images/creamy-tuscan-pasta.webp",
        imgAlt: "Creamy tuscan pasta",
        itemName: "Creamy Tuscan Pasta",
        itemDescription:
          "Penne with creamy Parmesan, sun-dried tomatoes, spinach, and grilled chicken.",
        itemPrice: 13.5,
      },
      {
        imgUrl: "./src/assets/images/pan-seared-salmon.webp",
        imgAlt: "Pan-seared salmon",
        itemName: "Pan-Seared Salmon",
        itemDescription:
          "Salmon with lemon-butter sauce, mashed potatoes, and sautéed greens.",
        itemPrice: 13,
      },
    ],
  },
  {
    title: "Desserts",
    items: [
      {
        imgUrl: "./src/assets/images/classic-chocolate-cake.webp",
        imgAlt: "classic chocolate cake",
        itemName: "classic Chocolate Cake",
        itemDescription:
          "Chocolate sponge layered with ganache, served with vanilla ice cream.",
        itemPrice: 6.5,
      },
      {
        imgUrl: "./src/assets/images/new-york-cheesecake.webp",
        imgAlt: "Ney York cheesecake",
        itemName: "New York Cheesecake",
        itemDescription:
          "Baked cheesecake on a buttery biscuit crust, topped with fresh berries.",
        itemPrice: 15.5,
      },
      {
        imgUrl: "./src/assets/images/mango-panna-cotta.webp",
        imgAlt: "Mango panna cotta",
        itemName: "Mango Panna Cotta",
        itemDescription:
          "Vanilla panna cotta with mango coulis and tropical fruit.",
        itemPrice: 6,
      },
    ],
  },
];