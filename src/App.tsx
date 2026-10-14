import "./style.css";
import { MenuPage } from "./components/MenuPage/MenuPage";

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

      <MenuPage title="Our Menu" />

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
