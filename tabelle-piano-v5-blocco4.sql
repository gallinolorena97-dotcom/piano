-- Piano & Dispensa — v5 Blocco 4: i pasti scritti a mano
-- Da incollare nel SQL Editor di Supabase e premere RUN.
-- Puoi rieseguirlo quante volte vuoi: non cancella niente.

-- PERCHE' SERVE
-- Dal Blocco 4 si puo' scrivere un pasto a mano, senza passare dal
-- generatore. Un pasto scritto a mano NON va rigenerato senza chiedere:
-- e' una decisione presa da una persona, non una bozza da rifare.
--
-- Per ricordarselo serve una colonna. Lo stato "confermato" da solo non
-- basterebbe: anche oggi e domani sono confermati per regola, e quelli
-- invece si possono rigenerare.

alter table public.plan_meals
  add column if not exists a_mano boolean not null default false;

comment on column public.plan_meals.a_mano is
  'true = il pasto lo ha scritto una persona, non il generatore. Non si rigenera senza chiedere.';

-- I pasti che c'erano prima di questa colonna vengono dal generatore:
-- il valore predefinito false e' gia' quello giusto, non serve toccarli.

-- CONTROLLO FINALE
-- Devi vedere la colonna a_mano in elenco, di tipo boolean.

select column_name, data_type, column_default
  from information_schema.columns
 where table_schema = 'public' and table_name = 'plan_meals'
 order by ordinal_position;
