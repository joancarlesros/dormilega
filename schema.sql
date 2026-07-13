-- ══════════════════════════════════════════════════════════
-- Dormilega · Esquema per a Supabase
-- Enganxa aquest fitxer complet a: Supabase → SQL Editor → Run
-- (si ja tenies l'esquema anterior, també pots executar-lo
--  sencer: és idempotent excepte la línia final de realtime,
--  que pot avisar que la taula ja hi és — no passa res)
-- ══════════════════════════════════════════════════════════

-- Nadons
create table if not exists public.babies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  birthdate date not null,
  created_at timestamptz not null default now()
);

-- Registres de son
create table if not exists public.sleep_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz,                          -- null = dormint ara
  kind text not null check (kind in ('nap','night')),
  notes text,
  created_at timestamptz not null default now()
);

-- Preses (biberó o pit)
create table if not exists public.feedings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz,                          -- opcional
  amount_start numeric,                        -- quantitat inicial (ml), opcional
  amount_end numeric,                          -- quantitat final (ml), opcional
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_baby_start
  on public.sleep_sessions (baby_id, start_at desc);
create index if not exists idx_feedings_baby_start
  on public.feedings (baby_id, start_at desc);

-- Seguretat: cada usuari només veu les seves dades
alter table public.babies enable row level security;
alter table public.sleep_sessions enable row level security;
alter table public.feedings enable row level security;

drop policy if exists "own babies" on public.babies;
create policy "own babies" on public.babies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own sessions" on public.sleep_sessions;
create policy "own sessions" on public.sleep_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own feedings" on public.feedings;
create policy "own feedings" on public.feedings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Sincronització en temps real entre dispositius
alter publication supabase_realtime add table public.sleep_sessions;
alter publication supabase_realtime add table public.feedings;
