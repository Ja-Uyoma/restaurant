import "./header.css";

import { useState } from "react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleMenu() {
    setIsOpen((prevState) => !prevState);
  }

  return (
    <>
      <header className="site-header">
        <section className="site-header__top">
          <h1 className="site-header__title">Bella Tavola</h1>

          <button
            className="site-header__menu-toggle"
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            aria-controls="main-menu"
            onClick={toggleMenu}
          >
            ☰
          </button>
        </section>

        <nav className={`site-header__navigation${isOpen ? " is-open" : ""}`}>
          <ul className="site-header__nav-list">
            <li className="site-header__nav-item">
              <a className="site-header__nav-link" href="#home">
                Home
              </a>
            </li>
            <li className="site-header__nav-item">
              <a className="site-header__nav-link" href="#menu">
                Menu
              </a>
            </li>
            <li className="site-header__nav-item">
              <a className="site-header__nav-link" href="#about-us">
                About
              </a>
            </li>
            <li className="site-header__nav-item">
              <a className="site-header__nav-link" href="#reservation">
                Reservation
              </a>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
