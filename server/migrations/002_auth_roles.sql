CREATE TABLE local_auth_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  display_name text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app_user_roles (
  auth_provider text NOT NULL CHECK (auth_provider IN ('local', 'neon')),
  auth_user_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'customer')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (auth_provider, auth_user_id)
);
