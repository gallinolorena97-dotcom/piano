-- ============================================================
--  RICETTE COMPLETE — le colonne che mancavano a `recipes`
--  Da eseguire su Supabase: SQL Editor → incolla → Run.
--  Si può rieseguire quante volte si vuole: non cancella niente.
-- ============================================================
--
--  PERCHÉ
--  Fino a oggi una ricetta era soltanto un NOME con un voto: serviva a
--  dire «questo ci piace», non a rifare il piatto. Un pasto scritto a
--  mano nasceva quindi senza ingredienti e senza numeri, e un pasto senza
--  numeri buca i totali della giornata di Ciprian — non uno, due (il TOT
--  del piano e «finora oggi» del diario).
--
--  Da qui in poi una ricetta ha un CONTENUTO, e il pasto a mano può
--  nascere completo come quelli del generatore.
-- ============================================================

-- ------------------------------------------------------------
--  1 · Il contenuto della ricetta
-- ------------------------------------------------------------
alter table public.recipes
  add column if not exists ingredienti jsonb   not null default '[]'::jsonb,
  add column if not exists prot        integer,
  add column if not exists kcal        integer,
  add column if not exists tempo       integer;

-- ⚠️ REGOLA DA NON DIMENTICARE — tutto qui dentro è PER UNA PERSONA.
--    Una ricetta è una cosa sola, il pasto invece cambia a seconda di
--    quanti sono a tavola. Tenere qui la porzione singola è ciò che
--    permette di riusare la stessa ricetta per uno o per due senza che
--    l'app debba moltiplicare niente da sé: a dimensionare il pasto è
--    il generatore, che sa già farlo.
comment on column public.recipes.ingredienti is
  'Per UNA persona. [{"nome":"...","qta":"120 g"}]. I nomi vanno scritti come in inventory_items, lettera per lettera: è quello che permette a stessoNome() di ritrovarli.';
comment on column public.recipes.prot is
  'Grammi di proteine per UNA persona. NULL = non lo sappiamo, e chi lo usa deve dichiarare il totale parziale invece di contarlo come zero.';
comment on column public.recipes.kcal is
  'Calorie per UNA persona. NULL come sopra: mai inventare un numero.';
comment on column public.recipes.tempo is
  'Minuti veri di preparazione. NULL se non si sa.';

-- ------------------------------------------------------------
--  2 · Il filo fra un pasto del piano e la sua ricetta
-- ------------------------------------------------------------
--  Serve a due cose: sapere che quel pasto ha già una ricetta (e non
--  riproporre il bottone), e poter ritrovare il piatto dal ricettario.
--  on delete set null: se un giorno cancelli la ricetta, il pasto resta
--  dov'è e perde solo il collegamento. Un pasto non si cancella mai per
--  colpa di un'altra tabella.
alter table public.plan_meals
  add column if not exists ricetta_id uuid references public.recipes(id) on delete set null;

comment on column public.plan_meals.ricetta_id is
  'La ricetta da cui viene questo pasto, se ce n''è una. NULL = pasto senza ricetta.';

create index if not exists plan_meals_ricetta_idx on public.plan_meals (ricetta_id);

-- ------------------------------------------------------------
--  3 · Controllo: cosa c'è adesso
-- ------------------------------------------------------------
--  Dopo il Run dovresti vedere le colonne nuove. Le ricette vecchie
--  hanno ingredienti = [] e i numeri vuoti: è giusto così, sono i nomi
--  del vecchio ricettario e il bottone «Crea la ricetta» le riempirà
--  quando servirà, senza creare doppioni.
select name,
       jsonb_array_length(ingredienti) as quanti_ingredienti,
       prot, kcal, tempo
from public.recipes
order by name;
