-- ============================================================
--  PIU' PRECISIONE SUI NUMERI, SENZA DATABASE ALIMENTI
--  Da eseguire su Supabase: SQL Editor → incolla → Run.
--  Si può rieseguire quante volte si vuole: non cancella niente.
-- ============================================================
--
--  PERCHÉ
--  Le proteine e le calorie dei piatti oggi le STIMA il generatore, con
--  delle medie ragionevoli. Le medie però sbagliano proprio dove conta:
--  due yogurt greci diversi possono differire del 40%, e il petto di
--  pollo di una marca non è quello di un'altra.
--
--  Due campi FACOLTATIVI sulle voci di dispensa. Dove ci sono, il
--  generatore li usa e non stima. Dove non ci sono, stima come ha sempre
--  fatto.
--
--  ⚠️ QUESTO NON È UN DATABASE ALIMENTI, e la regola che li vieta resta
--  in piedi. Non si importa nessun archivio, non c'è nessuno scanner di
--  codici a barre, e i campi restano vuoti finché non li scrive una
--  persona sulle voci che le interessano — di solito quelle quattro o
--  cinque che tornano ogni settimana.
-- ============================================================

alter table public.inventory_items
  add column if not exists prot_100g numeric,
  add column if not exists kcal_100g numeric;

comment on column public.inventory_items.prot_100g is
  'Grammi di proteine per 100 g, copiati dall''etichetta. NULL = non lo sappiamo, e il generatore stima come prima.';
comment on column public.inventory_items.kcal_100g is
  'Calorie per 100 g, copiate dall''etichetta. NULL come sopra: mai inventare un numero.';

-- ------------------------------------------------------------
--  Controllo: dove sono stati scritti
-- ------------------------------------------------------------
select name, qty, cat, prot_100g, kcal_100g
from public.inventory_items
order by (prot_100g is null and kcal_100g is null), name;
