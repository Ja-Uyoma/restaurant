import { MenuPage } from "./components/MenuPage/MenuPage";
import { Hero } from "./components/Hero/Hero";
import { AboutUs } from "./components/AboutUs/AboutUs";
import { Reservation } from "./components/Reservation/Reservation";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { AccountAccess } from "./components/AccountAccess/AccountAccess";
import { StaffMenuPage } from "./components/StaffMenuPage/StaffMenuPage";
import { useEffect, useState } from "react";

function App() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    function updatePathname() {
      setPathname(window.location.pathname);
    }

    window.addEventListener("popstate", updatePathname);
    return () => window.removeEventListener("popstate", updatePathname);
  }, []);

  return (
    <>
      <Header />

      {pathname === "/staff" ? (
        <StaffMenuPage />
      ) : (
        <>
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
        </>
      )}

      <Footer />
    </>
  );
}

export default App;
