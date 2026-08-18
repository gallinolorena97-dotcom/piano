-- ============================================================
--  BLOCCO 6 — procedimento e sostituzioni
--  Da eseguire su Supabase: SQL Editor → incolla → Run.
--  Si può rieseguire quante volte si vuole: non cancella niente.
-- ============================================================
--
--  PERCHÉ
--  Un piatto del piano diceva COSA si mangia e con quali ingredienti, ma
--  non COME si fa. Per «pollo e insalata» va benissimo, per «polpette al
--  sugo» un po' meno — e il momento in cui serve è quello in cui hai le
--  mani sporche e il telefono appoggiato al pensile.
--
--  E quando manca qualcosa di secondario, il piano lo dichiarava e basta:
--  «ti manca il prezzemolo». Ma in dispensa magari c'è il basilico.
-- ============================================================

-- ------------------------------------------------------------
--  1 · Il procedimento
-- ------------------------------------------------------------
alter table public.plan_meals
  add column if not exists procedimento jsonb;

alter table public.recipes
  add column if not exists procedimento jsonb;

-- ⚠️ Sta in TUTTI E DUE i posti, e non è una svista.
--    Sulla RICETTA è la versione che resta e che si riusa.
--    Sul PASTO è la fotografia di come si fa QUEL giorno, con le
--    quantità di chi mangia quel giorno.
--    Un pasto generato dalla settimana non ha una ricetta collegata: se
--    il procedimento vivesse solo sulle ricette, quei pasti resterebbero
--    muti proprio dove serve di più.
comment on column public.plan_meals.procedimento is
  'Passi numerati, come lista di stringhe: ["Metti l''acqua a bollire.", "..."]. NULL = non c''è. Due o tre righe se il piatto è banale: un procedimento lungo per una cosa ovvia non lo legge nessuno.';
comment on column public.recipes.procedimento is
  'Lo stesso, ma per UNA persona, come tutto il resto della ricetta.';

-- ------------------------------------------------------------
--  2 · Le sostituzioni
-- ------------------------------------------------------------
alter table public.plan_meals
  add column if not exists sostituzioni jsonb;

-- ⚠️ Non sono la stessa cosa di "manca". "manca" vuol dire: vai a
--    comprarlo. Una sostituzione vuol dire: non serve che tu vada da
--    nessuna parte, usa quest'altra cosa che hai già.
--    Si applicano SOLO a ingredienti non essenziali — mai alla fonte
--    proteica, che è il vincolo che comanda su tutto il metodo.
comment on column public.plan_meals.sostituzioni is
  'Lista di {"invece_di": "...", "uso": "...", "perche": "..."}. "uso" è una cosa che c''è DAVVERO in dispensa, scritta col nome della dispensa. NULL o [] = nessuna sostituzione.';

-- ------------------------------------------------------------
--  3 · Lo svuota-frigo, sulla riga di lavoro della staffetta
-- ------------------------------------------------------------
--  ⚠️ Sta qui e non in un parametro di passaggio perché la settimana si
--  genera a staffetta: ogni anello riparte da zero e rilegge la riga di
--  lavoro dal database. Se il flag vivesse solo nella prima chiamata,
--  dal secondo giorno in poi il piano tornerebbe a generare normale — e
--  nessuno se ne accorgerebbe guardando il risultato.
alter table public.plan_jobs
  add column if not exists svuota_frigo boolean not null default false;

comment on column public.plan_jobs.svuota_frigo is
  'true = questa settimana punta a finire quello che c''è invece di cucinare il meglio. Il minimo proteico di Ciprian resta comunque.';

-- ------------------------------------------------------------
--  Controllo: cosa c'è adesso
-- ------------------------------------------------------------
select day, pasto, piatto,
       coalesce(jsonb_array_length(procedimento), 0) as passi,
       coalesce(jsonb_array_length(sostituzioni), 0) as sostituzioni
from public.plan_meals
order by day desc, pasto
limit 10;
