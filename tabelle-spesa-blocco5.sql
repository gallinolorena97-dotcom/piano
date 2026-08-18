-- ============================================================
--  SPESA COLLEGATA AL PIANO — la riga sa per quando serve
--  Da eseguire su Supabase: SQL Editor → incolla → Run.
--  Si può rieseguire quante volte si vuole: non cancella niente.
-- ============================================================
--
--  PERCHÉ
--  La lista della spesa si riempie già da sola coi mancanti del piano,
--  ma le righe arrivavano mute: «Panini burger» senza dire che servono
--  sabato. Al supermercato la differenza è tutta lì — quello che serve
--  domani si prende oggi, quello che serve fra cinque giorni può
--  aspettare.
--
--  Una data sola, facoltativa. Chi aggiunge una voce a mano non deve
--  compilare niente: resta vuota e la riga si comporta come prima.
-- ============================================================

alter table public.shopping_list
  add column if not exists serve_il date;

comment on column public.shopping_list.serve_il is
  'Il primo giorno del piano che aspetta questo acquisto. NULL = aggiunto a mano, non lo aspetta nessun pasto.';

-- Serve a mettere in cima quello che serve prima: l''ordine della lista
-- è l''ordine in cui conviene guardare gli scaffali.
create index if not exists shopping_list_serve_idx on public.shopping_list (serve_il);

-- ------------------------------------------------------------
--  Controllo: cosa c'è adesso
-- ------------------------------------------------------------
--  Le righe già in lista hanno serve_il vuoto: è giusto così, nessuno
--  sapeva per quando servissero. Quelle nuove lo avranno.
select name, done, serve_il
from public.shopping_list
order by serve_il nulls last, created_at;
