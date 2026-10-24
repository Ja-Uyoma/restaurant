import { useState } from "react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleMenu() {
    setIsOpen((prevState) => !prevState);
  }

  return (
    <header className="flex flex-wrap items-center justify-between bg-espresso text-white">
      <section className="flex flex-[1_1_100%] items-center justify-between md:flex-none">
        <h1 className="my-[0.2em] bg-espresso px-[1em] py-[0.4em] font-montserrat text-[1.75rem] text-white md:p-[1em]">
          Bella Tavola
        </h1>

        <button
          className="block cursor-pointer border-0 bg-transparent px-[0.5em] py-[0.25em] text-[2rem] leading-none md:hidden"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          aria-controls="main-menu"
          onClick={toggleMenu}
        >
          ☰
        </button>
      </section>

      <nav className="flex-[1_1_100%] md:flex-[1_1_auto]">
        <ul
          className={`m-0 list-none divide-y divide-[#62514a] bg-espresso p-0 text-white md:flex md:divide-y-0 md:border-0 md:px-[1em] ${isOpen ? "block border border-[#62514a]" : "hidden"}`}
        >
          <li className="md:flex-1">
            <a
              className="block rounded px-[1em] py-[0.8em] font-medium text-white transition-colors duration-150 hover:bg-marigold hover:text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-parchment md:px-[0.75em] md:py-[0.45em] md:text-center"
              href="/#home"
            >
              Home
            </a>
          </li>
          <li className="md:flex-1">
            <a
              className="block rounded px-[1em] py-[0.8em] font-medium text-white transition-colors duration-150 hover:bg-marigold hover:text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-parchment md:px-[0.75em] md:py-[0.45em] md:text-center"
              href="/#menu"
            >
              Menu
            </a>
          </li>
          <li className="md:flex-1">
            <a
              className="block rounded px-[1em] py-[0.8em] font-medium text-white transition-colors duration-150 hover:bg-marigold hover:text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-parchment md:px-[0.75em] md:py-[0.45em] md:text-center"
              href="/#about-us"
            >
              About
            </a>
          </li>
          <li className="md:flex-1">
            <a
              className="block rounded px-[1em] py-[0.8em] font-medium text-white transition-colors duration-150 hover:bg-marigold hover:text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-parchment md:px-[0.75em] md:py-[0.45em] md:text-center"
              href="/#reservation"
            >
              Reservation
            </a>
          </li>
          <li className="md:flex-1">
            <a
              className="block rounded px-[1em] py-[0.8em] font-medium text-white transition-colors duration-150 hover:bg-marigold hover:text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-parchment md:px-[0.75em] md:py-[0.45em] md:text-center"
              href="/staff"
            >
              Staff
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
