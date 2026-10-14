import "./reservation.css";

type ReservationData = {
  id: string;
};

export function Reservation(props: Readonly<ReservationData>) {
  return (
    <section className="reservation" id={props.id}>
      <h2 className="reservation__title">Make a Reservation</h2>

      <form action="/" method="post" className="reservation__form">
        <div className="reservation__form-group">
          <label htmlFor="name">Name</label>
          <input type="text" name="name" id="name" placeholder="Name" />

          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" placeholder="Email" />

          <label htmlFor="date">Date</label>
          <input type="date" name="date" id="date" placeholder="Date" />

          <label htmlFor="guests">Guests</label>
          <input
            type="number"
            name="guests"
            id="guests"
            placeholder="Guests"
            min="1"
            max="15"
          />
        </div>

        <button type="submit" className="reservation__button">
          Reserve
        </button>
      </form>
    </section>
  );
}
