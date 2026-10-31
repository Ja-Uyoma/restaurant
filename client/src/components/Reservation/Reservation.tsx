interface ReservationProps {
  id: string;
}

export function Reservation(props: Readonly<ReservationProps>) {
  return (
    <section className="bg-base-100 px-5 py-20 sm:py-24" id={props.id}>
      <div className="section-wrap">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <p className="eyebrow mb-3">Make it a special evening</p>
          <h2 className="section-title">Make a reservation</h2>
          <p className="mt-4 text-base leading-7 text-base-content/70">
            Gather your favourite people. We’ll take care of the rest.
          </p>
        </div>

        <form
          action="/"
          method="post"
          className="mx-auto grid max-w-4xl justify-items-center gap-5 rounded-box border border-base-300/80 bg-base-200 p-6 text-center shadow-sm sm:grid-cols-2 sm:p-8 lg:grid-cols-4"
        >
          <label className="flex w-full max-w-md flex-col items-center gap-2 text-sm font-bold text-base-content">
            Name
            <input
              className="min-h-12 w-full rounded-field border border-base-300 bg-base-100 px-4 text-center text-base font-normal text-base-content placeholder:text-base-content/45"
              type="text"
              name="name"
              id="name"
              placeholder="Your name"
            />
          </label>

          <label className="flex w-full max-w-md flex-col items-center gap-2 text-sm font-bold text-base-content">
            Email
            <input
              className="min-h-12 w-full rounded-field border border-base-300 bg-base-100 px-4 text-center text-base font-normal text-base-content placeholder:text-base-content/45"
              type="email"
              name="email"
              id="email"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex w-full max-w-md flex-col items-center gap-2 text-sm font-bold text-base-content">
            Date
            <input
              className="min-h-12 w-full rounded-field border border-base-300 bg-base-100 px-4 text-center text-base font-normal text-base-content"
              type="date"
              name="date"
              id="date"
            />
          </label>

          <label className="flex w-full max-w-md flex-col items-center gap-2 text-sm font-bold text-base-content">
            Guests
            <input
              className="min-h-12 w-full rounded-field border border-base-300 bg-base-100 px-4 text-center text-base font-normal text-base-content placeholder:text-base-content/45"
              type="number"
              name="guests"
              id="guests"
              placeholder="2"
              min="1"
              max="15"
            />
          </label>

          <button
            type="submit"
            className="min-h-13 w-full max-w-md cursor-pointer rounded-full border-0 bg-primary px-6 py-3 font-bold text-primary-content transition-colors hover:bg-secondary sm:col-span-2 lg:col-span-4"
          >
            Reserve your table
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </button>
        </form>
      </div>
    </section>
  );
}
