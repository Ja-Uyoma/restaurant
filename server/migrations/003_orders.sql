CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'canceled')),
  currency text NOT NULL DEFAULT 'usd'
    CHECK (currency = 'usd'),
  stripe_session_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

CREATE INDEX IF NOT EXISTS orders_customer_created_at_idx
  ON orders (customer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  menu_item_id bigint REFERENCES menu_items (id) ON DELETE SET NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0)
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);
