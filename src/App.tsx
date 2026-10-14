import "./style.css";
import { MenuPage } from "./components/MenuPage/MenuPage";
import { Hero } from "./components/Hero/Hero";
import { AboutUs } from "./components/AboutUs/AboutUs";
import { Reservation } from "./components/Reservation/Reservation";
import { Footer } from "./components/Footer/Footer";

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

      <Footer />
    </>
  );
}

export default App;
