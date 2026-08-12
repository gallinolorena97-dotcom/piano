-- ============================================================
--  Piano & Dispensa — accesso libero: via del tutto il login
--
--  Da incollare nel SQL Editor di Supabase e premere RUN.
--  Puoi rieseguirlo quante volte vuoi: non fa danni.
--
--  COSA FA
--    1. cancella la tabella "allowed_writers" e la funzione
--       "is_writer" (l'elenco di chi poteva scrivere: non serve più)
--    2. toglie TUTTE le vecchie regole di accesso alle 4 tabelle
--    3. ne mette una sola per tabella: leggono e scrivono tutti
--
--  COSA NON TOCCA
--    Piano, inventario, ricette e impostazioni restano identici.
--    L'unica cosa cancellata è l'elenco degli indirizzi email
--    autorizzati, che l'app non usa più da nessuna parte.
--
--  ⚠️  Da qui in poi chiunque conosca l'indirizzo dell'app può
--      anche modificare i dati. È la scelta presa apposta.
-- ============================================================


-- ------------------------------------------------------------
-- PRIMA DI CANCELLARE: guarda cosa c'è dentro allowed_writers.
-- Esegui da solo questo pezzo se vuoi vedere le email prima di
-- buttarle. Se la tabella non esiste più, dà errore: è normale.
-- ------------------------------------------------------------
-- select * from public.allowed_writers;


-- ------------------------------------------------------------
-- 1) Via l'elenco degli autorizzati e la funzione che lo leggeva
-- ------------------------------------------------------------
drop function if exists public.is_writer();
drop table if exists public.allowed_writers;


-- ------------------------------------------------------------
-- 2) Via tutte le vecchie regole delle 4 tabelle, come si chiamino
-- ------------------------------------------------------------
do $$
declare
  p record;
begin
  for p in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('plan_days','inventory_items','recipes','settings')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;


-- ------------------------------------------------------------
-- 3) Permessi tecnici: leggere e scrivere per tutti i visitatori
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete
  on public.plan_days, public.inventory_items, public.recipes, public.settings
  to anon, authenticated;


-- ------------------------------------------------------------
-- 4) Una regola sola per tabella: accesso libero in lettura e
--    scrittura, sia per chi non è registrato (anon) sia per chi
--    lo fosse (authenticated).
--    RLS resta accesa: è la regola a dire "sì" a tutti.
-- ------------------------------------------------------------
alter table public.plan_days       enable row level security;
alter table public.inventory_items enable row level security;
alter table public.recipes         enable row level security;
alter table public.settings        enable row level security;

create policy "accesso libero" on public.plan_days
  for all to anon, authenticated using (true) with check (true);

create policy "accesso libero" on public.inventory_items
  for all to anon, authenticated using (true) with check (true);

create policy "accesso libero" on public.recipes
  for all to anon, authenticated using (true) with check (true);

create policy "accesso libero" on public.settings
  for all to anon, authenticated using (true) with check (true);


-- ------------------------------------------------------------
--  CONTROLLO FINALE
--  Devi vedere esattamente 4 righe, una per tabella, tutte con
--  la regola "accesso libero" e vale_per {anon,authenticated}.
-- ------------------------------------------------------------
select tablename as tabella, policyname as regola, roles as vale_per
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
