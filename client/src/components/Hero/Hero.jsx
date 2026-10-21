export function Hero(props) {
  return (
    <div
      className="flex h-62.5 flex-col items-center justify-center gap-4 bg-[linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)),url('/images/call-to-action.webp')] bg-cover bg-center bg-no-repeat px-6 py-12 text-center text-white md:items-start md:text-left"
      id={props.id}
    >
      <section>
        <h2 className="m-0 font-montserrat text-2xl">{props.name}</h2>
        <p className="max-w-150 leading-[1.6]">{props.description}</p>
      </section>

      <button className="cursor-pointer rounded-[1.5em] border-0 bg-paprika px-[1.8rem] py-[0.9rem] text-base font-medium text-white">
        {props.cta}
      </button>
    </div>
  );
}
