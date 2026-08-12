-- Piano & Dispensa — i due profili (v6)
-- Da incollare nel SQL Editor di Supabase e premere RUN.
-- Puoi rieseguirlo quante volte vuoi: non sovrascrive le modifiche
-- che avrai fatto ai profili dall'app.

-- 1) LA TABELLA DEI PROFILI
--
--    slug         nome breve interno, non si cambia: 'lorena' oppure 'x'
--    prot_target  obiettivo proteine al giorno (vuoto = nessun obiettivo)
--    kcal_target  obiettivo calorie al giorno (vuoto = nessun obiettivo)
--    ripetizione  'alta'  = mangiare la stessa cosa ravvicinata va bene
--                 'bassa' = serve varieta', non ripetere piatti simili
--    non_mangia   vincolo assoluto: non deve MAI comparire nel piatto
--    evita        preferenza forte: solo se non se ne puo' fare a meno
--    ama          da privilegiare quando possibile

create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  nome        text not null,
  prot_target integer,
  kcal_target integer,
  ripetizione text not null default 'alta' check (ripetizione in ('alta','bassa')),
  non_mangia  text[] not null default '{}',
  evita       text[] not null default '{}',
  ama         text[] not null default '{}',
  note        text,
  updated_at  timestamptz not null default now()
);

-- 2) updated_at automatico, come sulle altre tabelle

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 3) Accesso libero, come tutte le altre tabelle dell'app

alter table public.profiles enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to anon, authenticated;

drop policy if exists "accesso libero" on public.profiles;
create policy "accesso libero" on public.profiles
  for all to anon, authenticated using (true) with check (true);

-- 4) I due profili di partenza.
--    "on conflict do nothing": se li hai gia' e li hai modificati
--    dall'app, questo file NON te li riscrive.

-- ATTENZIONE ALLO SLUG: e' un codice interno, NON il nome della persona.
-- Per ragioni storiche lo slug 'lorena' contiene il profilo di CIPRIAN
-- e lo slug 'x' contiene quello di LORENA. Non fidarti dello slug:
-- la persona e' quella scritta nella colonna "nome".

insert into public.profiles (slug, nome, prot_target, kcal_target, ripetizione, non_mangia, evita, ama, note)
values
  ('lorena', 'Ciprian', 170, 2200, 'alta',
   '{}',
   '{}',
   '{}',
   'In deficit per dimagrire. Mangia sempre a casa. Tollera benissimo la ripetizione: riso e tonno due giorni di fila vanno bene. Quando Lorena non c''e'', cucina comunque ma in modo piu'' semplice.'),
  ('x', 'Lorena', null, null, 'bassa',
   '{"pomodoro crudo","cetrioli","interiora"}',
   '{"abbinamenti strani","piatti con troppi ingredienti diversi insieme"}',
   '{"verdure"}',
   'Nessun obiettivo proteico, mangia normale. Ama le verdure, mangia poca carne: la sua parte proteica pesca soprattutto da uova, formaggi, legumi e pesce. Vuole quasi sempre un tocco dolce a fine pasto: e'' parte del pasto, non un extra. Spesso non mangia a casa, in modo irregolare.')
on conflict (slug) do nothing;

-- CONTROLLO FINALE
-- Devi vedere due righe: Ciprian con 170 g / 2200 kcal, e Lorena senza
-- obiettivi ma con la lista "non mangia" gia' compilata.

select slug, nome, prot_target, kcal_target, ripetizione, non_mangia
from public.profiles
order by slug;
