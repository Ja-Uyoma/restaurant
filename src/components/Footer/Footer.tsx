import "./footer.css";

export function Footer() {
  return (
    <footer className="site-footer">
      <section className="site-footer__brand">
        <h4 className="site-footer__name">Bella Tavola</h4>
        <p className="site-footer__tagline">Good food. Good company.</p>
      </section>

      <div className="site-footer__info">
        <section className="site-footer__hours">
          <h5 className="site-footer__heading">Opening Hours</h5>
          <p>Monday - Friday: 11:00 - 22:00</p>
          <p>Saturday: 12:00 - 23:00</p>
          <p>Sunday: Closed</p>
        </section>

        <section className="site-footer__location">
          <h5 className="site-footer__heading">Location</h5>
          <p>Main Street 25</p>
          <p>Banja Luka</p>
          <p>Bosnia and Herzegovina</p>
        </section>
      </div>
    </footer>
  );
}
