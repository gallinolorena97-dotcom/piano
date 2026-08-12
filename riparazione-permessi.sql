-- Piano & Dispensa — riparazione dei permessi di scrittura
-- Da incollare nel SQL Editor di Supabase e premere RUN.
-- Non cancella niente: rimette solo i permessi al loro posto.
--
-- IL PROBLEMA CHE RISOLVE
-- Su alcune tabelle il database accettava le MODIFICHE ma rifiutava le
-- AGGIUNTE. Nell'app si vedeva cosi': "Ho cucinato questo" scalava le
-- quantita' e poi si bloccava quando provava a salvare la ricetta.
-- L'errore era: new row violates row-level security policy.
--
-- Questo file rimette su OGNI tabella dell'app una sola regola che
-- consente tutto: leggere, aggiungere, modificare, cancellare.

-- 1) Via tutte le vecchie regole, comunque si chiamino

do $$
declare
  p record;
begin
  for p in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('plan_days','inventory_items','recipes','settings',
                        'shopping_list','meals_log','profiles','recipe_votes')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- 2) Permessi tecnici: senza questi la regola non basta

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.plan_days, public.inventory_items, public.recipes, public.settings,
  public.shopping_list, public.meals_log, public.profiles
  to anon, authenticated;

-- recipe_votes potrebbe non esistere ancora: la tratto a parte
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='recipe_votes') then
    execute 'grant select, insert, update, delete on public.recipe_votes to anon, authenticated';
  end if;
end $$;

-- 3) Una regola sola per tabella, che consente tutto.
--    Il pezzo che mancava e' "with check (true)": senza quello il
--    database accetta le modifiche ma rifiuta le aggiunte.

do $$
declare
  t text;
begin
  foreach t in array array['plan_days','inventory_items','recipes','settings',
                           'shopping_list','meals_log','profiles','recipe_votes']
  loop
    if exists (select 1 from information_schema.tables
               where table_schema='public' and table_name=t) then
      execute format('alter table public.%I enable row level security', t);
      execute format(
        'create policy "accesso libero" on public.%I for all to anon, authenticated using (true) with check (true)', t);
    end if;
  end loop;
end $$;

-- CONTROLLO FINALE
-- Ogni tabella deve avere UNA riga, regola "accesso libero",
-- con permessi_lettura = true e permessi_aggiunta = true.
-- Se in "permessi_aggiunta" trovi false o vuoto, dimmelo.

select
  tablename                                as tabella,
  policyname                               as regola,
  (qual = 'true')                          as permessi_lettura,
  (with_check = 'true')                    as permessi_aggiunta
from pg_policies
where schemaname = 'public'
order by tablename;
