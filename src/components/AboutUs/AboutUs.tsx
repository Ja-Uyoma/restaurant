import "./about-us.css";

type AboutUsData = {
  id: string;
};

export function AboutUs(props: Readonly<AboutUsData>) {
  return (
    <aside id={props.id} className="about-us">
      <figure className="about-us__figure">
        <img
          src="./src/assets/images/about-us.webp"
          alt="Customers enjoying a meal in the restaurant"
          loading="lazy"
          className="about-us__image"
        />
      </figure>

      <section className="about-us__details">
        <h2 className="about-us__title">About Us</h2>
        <p className="about-us__description">
          Bella Tavola is a family-owned restaurant serving traditional Italian
          food made with fresh, local ingredients. Our goal is to bring
          authentic Italian flavours to every table.
        </p>
      </section>
    </aside>
  );
}
