-- Piano & Dispensa — tabelle nuove per il generatore v4
-- Da incollare nel SQL Editor di Supabase e premere RUN.
-- Puoi rieseguirlo quante volte vuoi: non cancella niente.
--
-- Crea due tabelle:
--   shopping_list  la lista della spesa
--   meals_log      il registro di cosa hai mangiato

-- 1) LISTA DELLA SPESA

create table if not exists public.shopping_list (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  done       boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shopping_list_done_idx
  on public.shopping_list (done, created_at);

-- 2) REGISTRO DEI PASTI

create table if not exists public.meals_log (
  id         uuid primary key default gen_random_uuid(),
  day        date not null default current_date,
  pasto      text not null check (pasto in ('colazione','spuntino','pranzo','cena')),
  piatto     text not null,
  prot       integer,
  kcal       integer,
  chi        text check (chi in ('io','io_e_x','solo_x')),
  proteina   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meals_log_day_idx
  on public.meals_log (day desc);

-- 3) updated_at automatico, come sulle altre tabelle

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shopping_list_touch on public.shopping_list;
create trigger shopping_list_touch before update on public.shopping_list
  for each row execute function public.touch_updated_at();

drop trigger if exists meals_log_touch on public.meals_log;
create trigger meals_log_touch before update on public.meals_log
  for each row execute function public.touch_updated_at();

-- 4) Accesso libero, come tutte le altre tabelle dell'app

alter table public.shopping_list enable row level security;
alter table public.meals_log     enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete
  on public.shopping_list, public.meals_log
  to anon, authenticated;

drop policy if exists "accesso libero" on public.shopping_list;
create policy "accesso libero" on public.shopping_list
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "accesso libero" on public.meals_log;
create policy "accesso libero" on public.meals_log
  for all to anon, authenticated using (true) with check (true);

-- CONTROLLO FINALE
-- Devi vedere due righe, shopping_list e meals_log, con regola "accesso libero".

select tablename as tabella, policyname as regola
from pg_policies
where schemaname = 'public'
  and tablename in ('shopping_list','meals_log')
order by tablename;
