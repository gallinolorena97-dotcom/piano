-- ============================================================
--  LA STAFFETTA — la settimana si genera da sola, sul server
--  Da eseguire su Supabase: SQL Editor → incolla → Run.
--  Rieseguibile senza danni.
-- ============================================================
--
--  A che serve
--  -----------
--  Prima la settimana la generava il TELEFONO: quattro chiamate una dopo
--  l'altra, con l'app che doveva restare aperta e collegata per minuti.
--  Se lo schermo si spegneva, il filo cadeva e il lavoro si fermava.
--
--  Adesso il telefono dice soltanto "fai questa settimana" e se ne va. Il
--  lavoro vive qui dentro: una riga per ogni settimana da generare, che
--  dice a che punto siamo. Ogni chiamata della Edge Function fa UN giorno,
--  lo scrive nel calendario, aggiorna questa riga e sveglia la chiamata
--  dopo. Il telefono, quando torna, legge questa riga e sa tutto.
--
--  ⚠️ Perche' una chiamata per giorno: Supabase spegne una funzione dopo
--  150 secondi (piano gratuito). Misurato il 16/08/2026: un giorno impiega
--  86 secondi, due giorni 127. Due giorni erano l'85% del tetto.

create table if not exists public.plan_jobs (
  id            uuid primary key default gen_random_uuid(),
  creato_il     timestamptz not null default now(),
  aggiornato_il timestamptz not null default now(),

  -- in_corso · finito · fermo
  --   fermo = si e' interrotto e NON riparte da solo. Il motivo sta in "errore".
  stato         text not null default 'in_corso',

  -- la passata intera, come l'ha compilata l'utente:
  -- [{ day, pranzo:{modo,chi,nota}, cena:{modo,chi,nota} }, …]
  -- ⚠️ Serve tutta, non solo il giorno in lavorazione: ogni chiamata la
  -- rilegge per guardare avanti (la cena di oggi decide la porzione doppia
  -- solo sapendo chi c'e' domani a pranzo).
  passata       jsonb not null,

  -- il "oggi" del TELEFONO, non del server: decide quali giorni sono
  -- confermati e quali bozze. Il server sta su UTC e sbaglierebbe di poco,
  -- ma sbaglierebbe.
  oggi          date not null,
  io_slug       text,

  prossimo      int  not null default 0,   -- indice del prossimo giorno da generare
  giorni_tot    int  not null default 0,   -- quanti giorni hanno pasti da cucinare

  -- i pasti gia' decisi, una riga di testo ciascuno: e' il testimone che
  -- passa da una chiamata all'altra perche' non si spenda due volte lo
  -- stesso pollo, e perche' un avanzo promesso venga raccolto
  fatti         jsonb not null default '[]'::jsonb,
  resta         text  not null default '', -- cosa rimane in dispensa, a parole

  passo         text,                      -- cosa sta facendo adesso, in italiano
  errore        text                       -- perche' si e' fermato, in italiano
);

create index if not exists plan_jobs_stato_idx on public.plan_jobs (stato, aggiornato_il desc);

-- ------------------------------------------------------------
--  Sicurezza: l'app LEGGE soltanto.
--  Scrive solo la Edge Function, che usa la chiave di servizio e quindi
--  non passa dalle policy. E' un miglioramento rispetto al resto del
--  database: qui il telefono non puo' rovinare niente nemmeno per sbaglio.
-- ------------------------------------------------------------
alter table public.plan_jobs enable row level security;

drop policy if exists "lettura libera" on public.plan_jobs;
create policy "lettura libera" on public.plan_jobs
  for select to anon, authenticated using (true);

-- ------------------------------------------------------------
--  Pulizia: i lavori vecchi non servono a nessuno.
--  Non c'e' nessun automatismo: se un giorno la tabella desse fastidio,
--  questa riga la si esegue a mano.
--    delete from public.plan_jobs where creato_il < now() - interval '30 days';
-- ------------------------------------------------------------
