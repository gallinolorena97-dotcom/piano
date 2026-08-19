-- V8 BLOCCO 3 — LE FREQUENZE SETTIMANALI PER CATEGORIA
-- Da eseguire su Supabase: SQL Editor, incolla, Run.
-- ⚠️ Prima va eseguito tabelle-categorie-v8.sql: senza le categorie, le
--    frequenze non hanno niente su cui contare.
--
-- COSA FA
-- 1. Crea la tabella delle frequenze: per ogni categoria, quante volte a
--    settimana al minimo e al massimo.
-- 2. Ci mette dentro la griglia della nutrizionista, quella confermata il
--    19/08/2026.
-- 3. Aggiunge a ogni pasto del piano il campo "categoria_principale": di
--    che cosa e' fatto quel pasto, in una parola.
--
-- ⚠️ SI PUO' RIESEGUIRE, e NON sovrascrive quello che hai cambiato
--    dall'app: le righe si inseriscono solo se non ci sono gia'.

begin;

create table if not exists public.frequenze_categorie (
  categoria     text primary key,
  -- quante volte a settimana, al minimo e al massimo. Vuoti = nessun
  -- vincolo da quella parte. Vuoti tutti e due = categoria libera.
  min_sett      integer,
  max_sett      integer,
  -- quante volte lo STESSO TIPO dentro la categoria. Serve ai cereali:
  -- non c'e' un tetto alla quantita', c'e' un obbligo di varieta'.
  -- E' un vincolo diverso da min/max, per questo ha una colonna sua.
  rotazione_max integer,
  nota          text,
  updated_at    timestamptz not null default now()
);

alter table public.frequenze_categorie enable row level security;

drop policy if exists "accesso libero" on public.frequenze_categorie;
create policy "accesso libero" on public.frequenze_categorie
  for all to anon, authenticated using (true) with check (true);

-- Di che cosa e' fatto un pasto, in una parola: e' il campo con cui si
-- contano le frequenze. Lo scrive il generatore.
-- ⚠️ Non e' la stessa cosa di "proteina_principale", che dice il nome
--    dell'alimento (pollo, tonno): questo dice la CATEGORIA.
alter table public.plan_meals
  add column if not exists categoria_principale text;

-- LA GRIGLIA CONFERMATA IL 19/08/2026
-- ⚠️ I minimi e i massimi valgono sui PASTI CONTEGGIABILI, non su tutti:
--    contano solo i pasti condivisi e quelli di Lorena, mai quelli di solo
--    Ciprian, e restano fuori i pasti liberi e quelli fuori casa.
--    Le regole di conteggio stanno nel prompt della Edge Function.

insert into public.frequenze_categorie (categoria, min_sett, max_sett, rotazione_max, nota)
values
  ('pesce',                 3,    null, null, null),
  ('carne bianca',          2,    3,    null, null),
  ('carne rossa',           null, 1,    null, null),
  ('legumi',                2,    3,    null, 'come piatto'),
  ('uova',                  1,    1,    null, 'come piatto, esattamente una volta'),
  ('latticini',             null, 1,    null,
     'solo come PIATTO: yogurt, kefir e latte non contano'),
  ('salumi',                null, 1,    null, 'come piatto'),
  ('verdura',               7,    null, null,
     'PRESENTE ogni giorno, non piatto principale: basta che ci sia nel pasto'),
  ('cereali e carboidrati', null, null, 2,
     'nessun vincolo di quantita'', ma lo stesso tipo al massimo 2 volte a settimana'),
  ('frutta',                null, null, null, null),
  ('frutta secca e semi',   null, null, null, null),
  ('condimenti e grassi',   null, null, null, null),
  ('dolci',                 null, null, null, null),
  ('altro',                 null, null, null, null)
on conflict (categoria) do nothing;

commit;

-- CONTROLLO
-- La griglia come la vedra' l'app. Le righe senza numeri sono le categorie
-- libere: e' giusto che ci siano, servono a poterle riempire dall'app.
select categoria, min_sett, max_sett, rotazione_max, nota
  from public.frequenze_categorie
 order by (min_sett is null and max_sett is null and rotazione_max is null),
          categoria;
