interface HeroProps {
  id: string;
  name: string;
  description: string;
  cta: string;
}

export function Hero(props: Readonly<HeroProps>) {
  return (
    <section
      className="relative isolate flex min-h-[34rem] items-center overflow-hidden bg-neutral px-5 py-20 text-white sm:min-h-[38rem]"
      id={props.id}
    >
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover object-center"
        src="./images/call-to-action.webp"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(17,26,12,0.8)_0%,rgba(17,26,12,0.52)_48%,rgba(17,26,12,0.08)_100%)]"
      />
      <div className="section-wrap relative z-10">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.16em] text-white uppercase backdrop-blur-sm">
            <span className="size-2 rounded-full bg-secondary" />
            A little taste of Italy
          </p>
          <h2 className="m-0 font-montserrat text-5xl leading-[1.04] font-bold tracking-[-0.05em] text-white sm:text-6xl md:text-7xl">
            {props.name}
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/90 sm:text-xl">
            {props.description}. Fresh ingredients, recipes made with love, and
            a seat waiting just for you.
          </p>
          <a
            className="mt-5 inline-flex min-h-13 items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-content no-underline shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-secondary focus-visible:outline-white"
            href="#reservation"
          >
            {props.cta}
            <span aria-hidden="true" className="ml-3 text-lg">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
