export function Footer() {
  return (
    <footer className="bg-neutral px-5 py-12 text-neutral-content">
      <div className="section-wrap grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
        <section>
          <h2 className="m-0 font-montserrat text-2xl font-bold text-white">
            Bella <span className="text-secondary">Tavola</span>
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-6 text-neutral-content/80">
            Good food. Good company. A little taste of Italy, right at your
            table.
          </p>
        </section>

        <section>
          <h3 className="mt-0 mb-4 font-montserrat text-sm font-bold tracking-wider text-secondary uppercase">
            Opening hours
          </h3>
          <p className="my-2 text-sm text-neutral-content/85">
            Monday – Friday <span className="text-white">11:00 – 22:00</span>
          </p>
          <p className="my-2 text-sm text-neutral-content/85">
            Saturday <span className="text-white">12:00 – 23:00</span>
          </p>
          <p className="my-2 text-sm text-neutral-content/85">
            Sunday <span className="text-white">Closed</span>
          </p>
        </section>

        <section>
          <h3 className="mt-0 mb-4 font-montserrat text-sm font-bold tracking-wider text-secondary uppercase">
            Find us
          </h3>
          <p className="my-2 text-sm leading-6 text-neutral-content/85">
            Main Street 25
            <br />
            Banja Luka
            <br />
            Bosnia and Herzegovina
          </p>
        </section>
      </div>
    </footer>
  );
}
