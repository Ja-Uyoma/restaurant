import { useState } from "react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleMenu() {
    setIsOpen((prevState) => !prevState);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-base-300/70 bg-base-100/95 shadow-sm backdrop-blur-md">
      <div className="section-wrap flex min-h-18 flex-wrap items-center justify-between gap-x-8">
        <a
          className="flex items-center gap-3 rounded-sm text-base-content no-underline"
          href="#home"
        >
          <span className="grid size-10 place-items-center rounded-full bg-primary text-xl text-primary-content">
            B
          </span>
          <span className="font-montserrat text-xl font-bold tracking-tight">
            Bella <span className="text-primary">Tavola</span>
          </span>
        </a>

        <button
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-base-300 bg-base-100 text-xl text-base-content transition-colors hover:bg-base-200 md:hidden"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          aria-controls="main-menu"
          onClick={toggleMenu}
        >
          ☰
        </button>

        <nav className="flex-[1_1_100%] md:flex-[0_1_auto]">
          <ul
            id="main-menu"
            className={`${isOpen ? "flex" : "hidden"} m-0 list-none flex-col gap-1 border-t border-base-300 py-3 md:flex md:flex-row md:items-center md:gap-2 md:border-0 md:py-0`}
          >
            {[
              ["Home", "#home"],
              ["Menu", "#menu"],
              ["About", "#about-us"],
              ["Reservation", "#reservation"],
            ].map(([label, href]) => (
              <li key={href}>
                <a
                  className="block rounded-full px-4 py-2 text-sm font-semibold text-base-content no-underline transition-colors hover:bg-secondary hover:text-secondary-content"
                  href={href}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
