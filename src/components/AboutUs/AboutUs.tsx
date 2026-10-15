type AboutUsData = {
  id: string;
};

export function AboutUs(props: Readonly<AboutUsData>) {
  return (
    <aside
      id={props.id}
      className="mt-6 bg-light-gray px-5 py-6 text-left md:flex md:items-center md:gap-8"
    >
      <figure className="m-0 md:flex-1">
        <img
          src="./images/about-us.webp"
          alt="Customers enjoying a meal in the restaurant"
          loading="lazy"
          className="hidden rounded md:block md:h-auto md:max-h-[250px] md:w-full md:object-cover md:object-center"
        />
      </figure>

      <section className="md:flex-1">
        <h2 className="font-montserrat text-2xl font-bold">About Us</h2>
        <p className="text-xs font-medium text-charcoal min-[786px]:w-[60%] min-[786px]:text-base">
          Bella Tavola is a family-owned restaurant serving traditional Italian
          food made with fresh, local ingredients. Our goal is to bring
          authentic Italian flavours to every table.
        </p>
      </section>
    </aside>
  );
}
