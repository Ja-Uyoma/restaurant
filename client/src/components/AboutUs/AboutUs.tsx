interface AboutUsProps {
  id: string;
}

export function AboutUs(props: Readonly<AboutUsProps>) {
  return (
    <section
      id={props.id}
      className="bg-base-200 px-5 py-20 sm:py-24"
    >
      <div className="section-wrap grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <figure className="relative m-0 overflow-hidden rounded-box shadow-xl">
          <img
            src="./images/about-us.webp"
            alt="Customers enjoying a meal in the restaurant"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover object-center"
          />
          <figcaption className="absolute right-4 bottom-4 rounded-full bg-base-100/95 px-4 py-2 text-xs font-bold tracking-wide text-neutral shadow">
            A seat at our table
          </figcaption>
        </figure>

        <div className="max-w-xl">
          <p className="eyebrow mb-3">A little about us</p>
          <h2 className="section-title">Good food brings us together.</h2>
          <p className="mt-5 text-base leading-8 text-base-content/80">
            Bella Tavola is a family-owned restaurant serving traditional
            Italian food made with fresh, local ingredients. Our goal is to
            bring authentic Italian flavours to every table.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-neutral">
            <span className="text-lg text-primary" aria-hidden="true">
              ✳
            </span>
            Fresh ingredients, recipes made with love
          </p>
        </div>
      </div>
    </section>
  );
}
