import "./style.css";
import { MenuPage } from "./components/MenuPage/MenuPage";
import { Hero } from "./components/Hero/Hero";
import { AboutUs } from "./components/AboutUs/AboutUs";
import { Reservation } from "./components/Reservation/Reservation";

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
                <a href="#about-us">About</a>
              </li>
              <li>
                <a href="#reservation">Reservation</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <Hero
        id="home"
        name="Bella Tavola"
        description="Authentic Italian Cuisine"
        cta="Reserve a Table"
      />

      <MenuPage title="Our Menu" />

      <AboutUs id="about-us" />

      <Reservation id="reservation" />

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
