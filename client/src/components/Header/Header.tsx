import { useState } from "react";
import { AuthPopover } from "../AuthPopover/AuthPopover";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleMenu() {
    setIsOpen((prevState) => !prevState);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-base-300/70 bg-base-100/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex min-h-18 w-[calc(100%_-_1.5rem)] max-w-[76rem] flex-wrap items-center justify-between gap-x-2 md:w-[calc(100%_-_2.5rem)] md:gap-x-8">
        <a
          className="flex shrink-0 items-center gap-1.5 rounded-sm text-base-content no-underline sm:gap-3"
          href="#home"
        >
          <span className="grid size-9 place-items-center rounded-full bg-primary text-lg text-primary-content sm:size-10 sm:text-xl">
            B
          </span>
          <span className="font-montserrat text-base font-bold tracking-tight sm:text-xl">
            Bella <span className="text-primary">Tavola</span>
          </span>
        </a>

        <div className="order-2 ml-auto flex shrink-0 items-center gap-1 md:order-3 md:ml-0 sm:gap-2">
          <AuthPopover />
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
        </div>

        <nav className="order-3 flex-[1_1_100%] md:order-2 md:ml-auto md:flex-[0_1_auto]">
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
