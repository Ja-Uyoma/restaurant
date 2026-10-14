import "./hero.css";

type HeroData = {
  id: string;
  name: string;
  description: string;
  cta: string;
};

export function Hero(props: HeroData) {
  return (
    <div className="hero" id={props.id}>
      <section className="hero__details">
        <h2 className="hero__name">{props.name}</h2>
        <p className="hero__description">{props.description}</p>
      </section>

      <button className="hero__button">{props.cta}</button>
    </div>
  );
}
