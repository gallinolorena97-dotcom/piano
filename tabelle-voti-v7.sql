-- Piano & Dispensa — i voti delle ricette diventano per persona
-- Da incollare nel SQL Editor di Supabase e premere RUN.
-- Puoi rieseguirlo quante volte vuoi: non cancella e non sovrascrive.
--
-- PRIMA: ogni ricetta aveva UN voto solo (colonna recipes.pref).
-- ADESSO: ogni persona ha il suo. Il cuore di Ciprian non e' quello di Lorena.

-- 1) LA TABELLA DEI VOTI
--    Una riga per ogni coppia ricetta + persona.

create table if not exists public.recipe_votes (
  recipe_id    uuid not null references public.recipes(id) on delete cascade,
  profile_slug text not null,
  pref         text not null check (pref in ('fav','ok','no')),
  updated_at   timestamptz not null default now(),
  primary key (recipe_id, profile_slug)
);

create index if not exists recipe_votes_slug_idx on public.recipe_votes (profile_slug);

-- 2) MIGRAZIONE DEI VOTI GIA' ESISTENTI
--
--    ATTENZIONE, e' un'assunzione: i voti esistenti sono stati dati
--    prima che i profili esistessero, quindi non si sa di chi siano.
--    Li attribuiamo a CIPRIAN, che all'inizio era l'unico a usare l'app
--    (slug 'lorena' = profilo di Ciprian: vedi CLAUDE.md).
--
--    Se qualcuno di quei voti era in realta' di Lorena, si corregge in
--    due tocchi dall'app: non serve rifare niente qui.

insert into public.recipe_votes (recipe_id, profile_slug, pref)
select id, 'lorena', pref
from public.recipes
where pref is not null
on conflict (recipe_id, profile_slug) do nothing;

-- 3) updated_at automatico

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recipe_votes_touch on public.recipe_votes;
create trigger recipe_votes_touch before update on public.recipe_votes
  for each row execute function public.touch_updated_at();

-- 4) Accesso libero, come tutte le altre tabelle dell'app

alter table public.recipe_votes enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.recipe_votes to anon, authenticated;

drop policy if exists "accesso libero" on public.recipe_votes;
create policy "accesso libero" on public.recipe_votes
  for all to anon, authenticated using (true) with check (true);

-- NOTA sulla vecchia colonna recipes.pref
-- Resta dov'e', intatta, come rete di sicurezza: se qualcosa andasse
-- storto i voti vecchi sono ancora li'. L'app non la legge piu'.

-- CONTROLLO FINALE
-- Devi vedere i voti migrati, tutti attribuiti a Ciprian (slug 'lorena').

select p.nome as persona, v.pref as voto, count(*) as quante
from public.recipe_votes v
left join public.profiles p on p.slug = v.profile_slug
group by p.nome, v.pref
order by p.nome, v.pref;
