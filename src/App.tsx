import "./style.css";

function App() {
  return (
    <>
      <div className="header">
        <div className="header-top">
          <header className="page-header">
            <h1>Bella Tavola</h1>
          </header>
          <button
            className="menu-toggle"
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded="false"
            aria-controls="main-menu"
          >
            ☰
          </button>
        </div>

        <nav className="menu" id="main-menu">
          <div className="menu-dropdown">
            <ul className="nav-menu">
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#menu">Menu</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#reservation">Reservation</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="cta" id="home">
        <div>
          <h2>Bella Tavola</h2>
          <p>Authentic Italian Cuisine</p>
        </div>
        <button>Reserve a Table</button>
      </div>

      <main id="menu">
        <h2>Our Menu</h2>

        <div className="menu-grid">
          <section>
            <h3>Starters</h3>

            <div className="menu">
              <div className="menu-item">
                <figure>
                  <img
                    src="./src/assets/images/garlic-and-herb-bruschetta.webp"
                    alt="Garlic and herb bruschetta"
                    className="menu-item-image"
                    loading="eager"
                  />
                </figure>
                <div className="menu-item-description">
                  <p>Garlic and Herb Brushcetta</p>
                  <p>
                    Toasted sourdough with tomato, basil, garlic, olive oil, and
                    balsamic glaze.
                  </p>
                </div>
                <p className="price">$7.50</p>
              </div>

              <div className="menu-item">
                <figure>
                  <img
                    src="./src/assets/images/crispy-calamari.webp"
                    alt="Crispy calamari"
                    className="menu-item-image"
                    loading="eager"
                  />
                </figure>
                <div className="menu-item-description">
                  <p>Crispy Calamari</p>
                  <p>
                    Lightly breaded calamari with lemon and creamy garlic dip.
                  </p>
                </div>
                <p className="price">$8.50</p>
              </div>

              <div className="menu-item">
                <figure>
                  <img
                    src="./src/assets/images/creamy-mushroom-soup.webp"
                    alt="Creamy mushroom soup"
                    className="menu-item-image"
                    loading="eager"
                  />
                </figure>
                <div className="menu-item-description">
                  <p>Creamy Mushroom Soup</p>
                  <p>
                    Creamy mushroom soup with garlic, thyme, and toasted bread.
                  </p>
                </div>
                <p className="price">$6.50</p>
              </div>
            </div>
          </section>

          <section>
            <h3>Main Courses</h3>

            <div className="menu">
              <div className="menu-item">
                <figure>
                  <img
                    src="./src/assets/images/grilled-herb-chicken.webp"
                    alt="Grilled herb chicken"
                    className="menu-item-image"
                    loading="eager"
                  />
                </figure>
                <div className="menu-item-description">
                  <p>Grilled Herb Chicken</p>
                  <p>
                    Rosemary-garlic grilled chicken with roasted potatoes and
                    seasonal vegetables.
                  </p>
                </div>
                <p className="price">$14.50</p>
              </div>

              <div className="menu-item">
                <figure>
                  <img
                    src="./src/assets/images/creamy-tuscan-pasta.webp"
                    alt="Creamy tuscan pasta"
                    className="menu-item-image"
                    loading="eager"
                  />
                </figure>
                <div className="menu-item-description">
                  <p>Creamy Tuscan Pasta</p>
                  <p>
                    Penne with creamy Parmesan, sun-dried tomatoes, spinach, and
                    grilled chicken.
                  </p>
                </div>
                <p className="price">$13.50</p>
              </div>

              <div className="menu-item">
                <figure>
                  <img
                    src="./src/assets/images/pan-seared-salmon.webp"
                    alt="Pan-seared salmon"
                    className="menu-item-image"
                    loading="eager"
                  />
                </figure>
                <div className="menu-item-description">
                  <p>Pan-Seared Salmon</p>
                  <p>
                    Salmon with lemon-butter sauce, mashed potatoes, and sautéed
                    greens.
                  </p>
                </div>
                <p className="price">$13.00</p>
              </div>
            </div>
          </section>

          <section>
            <h3>Desserts</h3>

            <div className="menu">
              <div className="menu-item">
                <figure>
                  <img
                    src="./src/assets/images/classic-chocolate-cake.webp"
                    alt="classic chocolate cake"
                    className="menu-item-image"
                    loading="lazy"
                  />
                </figure>
                <div className="menu-item-description">
                  <p>classic Chocolate Cake</p>
                  <p>
                    Chocolate sponge layered with ganache, served with vanilla
                    ice cream.
                  </p>
                </div>
                <p className="price">$6.50</p>
              </div>

              <div className="menu-item">
                <figure>
                  <img
                    src="./src/assets/images/new-york-cheesecake.webp"
                    alt="Ney York cheesecake"
                    className="menu-item-image"
                    loading="lazy"
                  />
                </figure>
                <div className="menu-item-description">
                  <p>New York Cheesecake</p>
                  <p>
                    Baked cheesecake on a buttery biscuit crust, topped with
                    fresh berries.
                  </p>
                </div>
                <p className="price">$15.50</p>
              </div>

              <div className="menu-item">
                <figure>
                  <img
                    src="./src/assets/images/mango-panna-cotta.webp"
                    alt="Mango panna cotta"
                    className="menu-item-image"
                    loading="lazy"
                  />
                </figure>
                <div className="menu-item-description">
                  <p>Mango Panna Cotta</p>
                  <p>
                    Vanilla panna cotta with mango coulis and tropical fruit.
                  </p>
                </div>
                <p className="price">$6.00</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <aside id="about">
        <img
          src="./src/assets/images/about-us.webp"
          alt="Customers enjoying a meal in the restaurant"
          loading="lazy"
        />
        <div>
          <h2>About Us</h2>
          <p>
            Bella Tavola is a family-owned restaurant serving traditional
            Italian food made with fresh, local ingredients. Our goal is to
            bring authentic Italian flavours to every table.
          </p>
        </div>
      </aside>

      <section className="reservation" id="reservation">
        <h2>Make a Reservation</h2>

        <form action="/" method="post">
          <div>
            <label htmlFor="name">Name</label>
            <input type="text" name="name" id="name" placeholder="Name" />

            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" placeholder="Email" />

            <label htmlFor="date">Date</label>
            <input type="date" name="date" id="date" placeholder="Date" />

            <label htmlFor="guests">Guests</label>
            <input
              type="number"
              name="guests"
              id="guests"
              placeholder="Guests"
              min="1"
              max="15"
            />
          </div>

          <button>Reserve</button>
        </form>
      </section>

      <footer>
        <section className="logo">
          <h4>Bella Tavola</h4>
          <p>Good food. Good company.</p>
        </section>

        <div className="info">
          <section className="working-hours">
            <h5>Opening Hours</h5>
            <p>Monday - Friday: 11:00 - 22:00</p>
            <p>Saturday: 12:00 - 23:00</p>
            <p>Sunday: Closed</p>
          </section>

          <section className="location">
            <h5>Location</h5>
            <p>Main Street 25</p>
            <p>Banja Luka</p>
            <p>Bosnia and Herzegovina</p>
          </section>
        </div>
      </footer>
    </>
  );
}

export default App;
