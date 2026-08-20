-- Ben435 product schema (Postgres / Supabase / PGLite compatible)

create table if not exists profiles (
  user_id text primary key,
  club_name text,
  role text,
  preferred_currency text not null default 'brl',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists terms_acceptances (
  id text primary key,
  user_id text not null,
  terms_version text not null,
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  source text not null default 'checkout'
);
create index if not exists terms_acceptances_user_idx on terms_acceptances (user_id, accepted_at desc);

create table if not exists entitlements (
  user_id text primary key,
  credits integer not null default 0,
  plan_id text,
  subscription_status text,
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  user_id text not null,
  plan_id text not null,
  currency text not null,
  amount integer not null,
  status text not null default 'pending',
  provider text not null default 'demo',
  stripe_session_id text,
  stripe_payment_intent text,
  terms_version text not null,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on orders (user_id, created_at desc);
create unique index if not exists orders_stripe_session_idx on orders (stripe_session_id) where stripe_session_id is not null;

create table if not exists analyses (
  id text primary key,
  user_id text not null,
  title text not null,
  contract_text text not null,
  contract_kind text not null default 'atleta',
  status text not null default 'queued',
  overall_risk text,
  score integer,
  result_json text,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists analyses_user_idx on analyses (user_id, created_at desc);
