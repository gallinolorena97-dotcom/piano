-- Piano & Dispensa — il calendario dei pasti (v5, Blocco 1)
-- Da incollare nel SQL Editor di Supabase e premere RUN.
-- Puoi rieseguirlo quante volte vuoi: non cancella niente.

-- 1) LA TABELLA DEL PIANO
--
--    Una riga per PASTO, non per giorno. Il motivo:
--    - i promemoria di scongelamento vanno mostrati su un giorno
--      DIVERSO da quello del pasto (24 h prima);
--    - gli avanzi collegano due pasti fra loro;
--    - la rigenerazione deve poter toccare un pasto solo, senza
--      riscrivere tutta la giornata.
--
--    day + pasto      il giorno, e se e' pranzo o cena. Insieme sono unici:
--                     un solo pranzo e una sola cena per giornata.
--    modo             'casa'   = si cucina
--                     'fuori'  = si mangia fuori
--                     'libero' = pasto libero (fa parte del metodo, non e' uno sgarro)
--    chi              'ciprian' · 'entrambi' · 'lorena'
--                     ⚠️ qui ci sono i NOMI VERI delle persone.
--                     Non confonderli con gli slug della tabella profiles,
--                     dove per ragioni storiche lo slug 'lorena' contiene
--                     il profilo di CIPRIAN e lo slug 'x' quello di LORENA.
--    stato            'bozza'      = giorno lontano, cambiera'
--                     'confermato' = oggi e domani
--                     'passato'    = gia' successo
--    piatto           cosa si mangia
--    perche           la ragione della scelta, in una riga
--    ingredienti      elenco in JSON, grammi PER PERSONA. Ogni voce:
--                       {"nome":"Riso","qta":"80 g","per":"ciprian"}
--                     "per" vale 'tutti', 'ciprian' oppure 'lorena':
--                     cosi' le porzioni diverse stanno nello stesso pasto.
--    dolce            il tocco dolce di Lorena. Sta in un campo suo e NON
--                     si mescola agli ingredienti: la scheda lo mostra
--                     in un riquadro separato.
--    tempo            minuti di preparazione
--    prot, kcal       SOLO per Ciprian. Vuoti nei pasti di sola Lorena.
--    scongelamento    il promemoria, per esteso
--    scongelare_il    su QUALE giorno mostrarlo (di solito il giorno prima)
--    avanzo_per       il rimando, es. '→ pranzo di domani'
--    dipende_da_spesa true se il pasto aspetta un acquisto
--    nota             la nota libera della passata dei 7 giorni

create table if not exists public.plan_meals (
  id               uuid primary key default gen_random_uuid(),
  day              date not null,
  pasto            text not null check (pasto in ('pranzo','cena')),
  modo             text not null default 'casa'
                     check (modo in ('casa','fuori','libero')),
  chi              text not null default 'entrambi'
                     check (chi in ('ciprian','entrambi','lorena')),
  stato            text not null default 'bozza'
                     check (stato in ('bozza','confermato','passato')),
  piatto           text,
  perche           text,
  ingredienti      jsonb not null default '[]'::jsonb,
  dolce            text,
  tempo            integer,
  prot             integer,
  kcal             integer,
  scongelamento    text,
  scongelare_il    date,
  avanzo_per       text,
  dipende_da_spesa boolean not null default false,
  nota             text,
  updated_at       timestamptz not null default now(),
  unique (day, pasto)
);

-- L'app apre sempre una finestra di giorni intorno a oggi: l'indice
-- sulla data e' quello che serve.

create index if not exists plan_meals_day_idx on public.plan_meals (day);

-- E questo serve a ritrovare in fretta i promemoria di scongelamento
-- da mostrare su un certo giorno.

create index if not exists plan_meals_scongelare_idx on public.plan_meals (scongelare_il);

-- 2) updated_at automatico, come sulle altre tabelle

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists plan_meals_touch on public.plan_meals;
create trigger plan_meals_touch before update on public.plan_meals
  for each row execute function public.touch_updated_at();

-- 3) Accesso libero, come tutte le altre tabelle dell'app.
--    L'app non ha login: e' una scelta presa l'11/08/2026.

alter table public.plan_meals enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.plan_meals to anon, authenticated;

drop policy if exists "accesso libero" on public.plan_meals;
create policy "accesso libero" on public.plan_meals
  for all to anon, authenticated using (true) with check (true);

-- 4) La vecchia tabella plan_days NON viene toccata.
--    Resta dov'e', vuota e inutilizzata: non si cancella una tabella
--    mentre se ne introduce un'altra al suo posto.

-- CONTROLLO FINALE
-- Deve rispondere "0": la tabella esiste ed e' vuota.
-- Se vuoi vedere subito il calendario con dei dati finti,
-- esegui adesso prova-piano-v5.sql.

select count(*) as righe_nel_piano from public.plan_meals;
