export function Reservation(props) {
  return (
    <section className="px-5" id={props.id}>
      <h2 className="my-5 text-left font-montserrat text-2xl text-espresso md:text-center">
        Make a Reservation
      </h2>

      <form action="/" method="post" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 md:flex-row">
          <label className="sr-only" htmlFor="name">
            Name
          </label>
          <input
            className="min-h-11 min-w-0 w-full flex-1 rounded border border-[#cbb9a8] bg-parchment px-3 py-1 text-base text-ink transition-colors placeholder:text-[#766b62] focus-visible:border-paprika focus-visible:outline-3 focus-visible:outline-[rgb(184_73_53/20%)] focus-visible:outline-offset-1"
            type="text"
            name="name"
            id="name"
            placeholder="Name"
          />

          <label className="sr-only" htmlFor="email">
            Email
          </label>
          <input
            className="min-h-11 min-w-0 w-full flex-1 rounded border border-[#cbb9a8] bg-parchment px-3 py-1 text-base text-ink transition-colors placeholder:text-[#766b62] focus-visible:border-paprika focus-visible:outline-3 focus-visible:outline-[rgb(184_73_53/20%)] focus-visible:outline-offset-1"
            type="email"
            name="email"
            id="email"
            placeholder="Email"
          />

          <label className="sr-only" htmlFor="date">
            Date
          </label>
          <input
            className="min-h-11 min-w-0 w-full flex-1 rounded border border-[#cbb9a8] bg-parchment px-3 py-1 text-base text-ink transition-colors placeholder:text-[#766b62] focus-visible:border-paprika focus-visible:outline-3 focus-visible:outline-[rgb(184_73_53/20%)] focus-visible:outline-offset-1"
            type="date"
            name="date"
            id="date"
            placeholder="Date"
          />

          <label className="sr-only" htmlFor="guests">
            Guests
          </label>
          <input
            className="min-h-11 min-w-0 w-full flex-1 rounded border border-[#cbb9a8] bg-parchment px-3 py-1 text-base text-ink transition-colors placeholder:text-[#766b62] focus-visible:border-paprika focus-visible:outline-3 focus-visible:outline-[rgb(184_73_53/20%)] focus-visible:outline-offset-1"
            type="number"
            name="guests"
            id="guests"
            placeholder="Guests"
            min="1"
            max="15"
          />
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer rounded border-0 bg-paprika px-3 py-1 text-base text-white transition-colors hover:bg-[#a53c2b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
        >
          Reserve
        </button>
      </form>
    </section>
  );
}
