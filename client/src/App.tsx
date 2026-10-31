import { MenuPage } from "./components/MenuPage/MenuPage";
import { Hero } from "./components/Hero/Hero";
import { AboutUs } from "./components/AboutUs/AboutUs";
import { Reservation } from "./components/Reservation/Reservation";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { CheckoutResult } from "./components/CheckoutResult/CheckoutResult";

function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const checkoutState = searchParams.get("checkout");
  if (checkoutState === "success" || checkoutState === "cancelled") {
    return (
      <div data-theme="lemonade" className="min-h-screen bg-base-100">
        <Header />
        <CheckoutResult
          sessionId={searchParams.get("session_id")}
          cancelled={checkoutState === "cancelled"}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div data-theme="lemonade" className="min-h-screen bg-base-100">
      <Header />

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
    </div>
  );
}

export default App;
