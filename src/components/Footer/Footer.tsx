export function Footer() {
  return (
    <footer className="mt-6 flex flex-col justify-between bg-forest-green p-4 text-white md:flex-row">
      <section className="flex-1">
        <h4 className="my-2 font-montserrat text-[15px] text-ivory">
          Bella Tavola
        </h4>
        <p className="my-1 text-[10px] font-bold text-light-gray">
          Good food. Good company.
        </p>
      </section>

      <div className="flex flex-[2] justify-around gap-[0.675em]">
        <section>
          <h5 className="my-2 font-montserrat text-sm text-ivory">
            Opening Hours
          </h5>
          <p className="my-1 text-[10px] font-bold text-light-gray">
            Monday - Friday: 11:00 - 22:00
          </p>
          <p className="my-1 text-[10px] font-bold text-light-gray">
            Saturday: 12:00 - 23:00
          </p>
          <p className="my-1 text-[10px] font-bold text-light-gray">
            Sunday: Closed
          </p>
        </section>

        <section>
          <h5 className="my-2 font-montserrat text-sm text-ivory">Location</h5>
          <p className="my-1 text-[10px] font-bold text-light-gray">
            Main Street 25
          </p>
          <p className="my-1 text-[10px] font-bold text-light-gray">
            Banja Luka
          </p>
          <p className="my-1 text-[10px] font-bold text-light-gray">
            Bosnia and Herzegovina
          </p>
        </section>
      </div>
    </footer>
  );
}
