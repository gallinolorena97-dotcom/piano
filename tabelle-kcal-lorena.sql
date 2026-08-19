-- LE CALORIE DI LORENA
-- Da eseguire su Supabase: SQL Editor, incolla, Run. Rieseguibile.
--
-- PERCHE'
-- Fino a oggi "prot" e "kcal" su un pasto erano di Ciprian e di nessun
-- altro: nei pasti di sola Lorena restavano vuoti e non compariva nessun
-- numero. Le calorie adesso si vogliono per tutti e due.
--
-- ⚠️ SOLO LE CALORIE, NON LE PROTEINE. Le proteine sono il vincolo di
--    Ciprian e restano sue: aggiungerle anche di la' vorrebbe dire mettere
--    in piedi un obiettivo che nessuno ha chiesto.
--
-- ⚠️ UNA COLONNA NUOVA E NON UN CAMPO RIUSATO. Le porzioni sono diverse:
--    lo stesso piatto vale 620 kcal per lui e 430 per lei. Un numero solo
--    non puo' dire due cose, e "kcal" resta il suo.
--
-- ⚠️ NIENTE OBIETTIVO. Il numero si mostra e basta: nessun tetto, nessuna
--    percentuale, nessun avanzamento. Se un giorno lei vorra' contare, le
--    bastera' compilare kcal_target nel suo profilo, come e' gia' previsto.

begin;

alter table public.plan_meals
  add column if not exists kcal_lorena integer;

comment on column public.plan_meals.kcal_lorena is
  'Le kcal della porzione di Lorena in questo pasto. NULL quando lei non '
  'mangia quel pasto o quando non si sanno. "kcal" resta la porzione di '
  'Ciprian: sono due numeri diversi perche'' sono due piatti di dimensione '
  'diversa, non lo stesso numero visto da due parti.';

commit;

-- CONTROLLO
-- La settimana in corso: dove il numero c'e' e dove no.
-- ⚠️ E' NORMALE che sia tutto vuoto adesso. Lo scrive il generatore, quindi
--    compare dalla prossima settimana generata in avanti; i pasti gia' in
--    calendario restano senza, e il totale del giorno lo dichiara invece di
--    far finta.
select day, pasto, chi, piatto, kcal as kcal_ciprian, kcal_lorena
  from public.plan_meals
 where day >= current_date
 order by day, pasto desc;
