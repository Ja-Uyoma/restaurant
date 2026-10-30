import { MenuPage } from "./components/MenuPage/MenuPage";
import { Hero } from "./components/Hero/Hero";
import { AboutUs } from "./components/AboutUs/AboutUs";
import { Reservation } from "./components/Reservation/Reservation";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { AccountAccess } from "./components/AccountAccess/AccountAccess";

function App() {
  return (
    <div data-theme="lemonade" className="min-h-screen bg-base-100">
      <Header />

      <Hero
        id="home"
        name="Bella Tavola"
        description="Authentic Italian Cuisine"
        cta="Reserve a Table"
      />

      <AccountAccess />

      <MenuPage title="Our Menu" />

      <AboutUs id="about-us" />

      <Reservation id="reservation" />

      <Footer />
    </div>
  );
}

export default App;
