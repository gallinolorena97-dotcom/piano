-- Piano & Dispensa — freno di sicurezza del generatore ricette
-- Da incollare nel SQL Editor di Supabase e premere RUN.
-- Puoi rieseguirlo quante volte vuoi: non fa danni.
--
-- PERCHE' SERVE
-- L'app non ha login: chiunque conosca l'indirizzo puo' premere "Genera".
-- Ogni generazione consuma un po' del tuo credito Anthropic. Questo
-- contatore mette un tetto massimo al giorno, cosi' la spesa non puo'
-- scappare di mano in nessun caso.
--
-- Il tetto vero e' scritto nella Edge Function (MAX_AL_GIORNO).
-- Questa tabella tiene solo il conteggio.

-- 1) La tabella del conteggio: una riga per giorno

create table if not exists public.generator_usage (
  day   date primary key default current_date,
  count integer not null default 0
);

-- RLS accesa e NESSUNA policy: la tabella e' invisibile all'app e al
-- pubblico. Solo la Edge Function, che lavora lato server, puo' toccarla.
-- Cosi' il contatore non e' manomettibile dall'esterno.

alter table public.generator_usage enable row level security;

revoke all on public.generator_usage from anon, authenticated;

-- 2) La funzione che conta: aggiunge 1 e dice se si puo' procedere.
--    Restituisce le generazioni usate oggi, oppure -1 se il tetto
--    e' gia' stato raggiunto.

create or replace function public.consuma_generazione(limite integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  usate integer;
begin
  insert into public.generator_usage (day, count)
  values (current_date, 1)
  on conflict (day) do update
     set count = generator_usage.count + 1
   where generator_usage.count < limite
  returning count into usate;

  if usate is null then
    return -1;
  end if;
  return usate;
end;
$$;

-- Solo il lato server puo' chiamarla: chi apre l'app non puo' azzerare
-- il contatore ne' aggirarlo.

revoke execute on function public.consuma_generazione(integer) from public, anon, authenticated;
grant  execute on function public.consuma_generazione(integer) to   service_role;

-- 3) Pulizia: teniamo solo gli ultimi 60 giorni di conteggi

delete from public.generator_usage where day < current_date - 60;

-- CONTROLLO FINALE
-- Devi vedere una riga con policy_presenti = 0.
-- Zero e' giusto: significa che il contatore e' invisibile dall'esterno.

select
  'generator_usage' as tabella,
  (select count(*) from pg_policies
    where schemaname='public' and tablename='generator_usage') as policy_presenti,
  (select count(*) from public.generator_usage) as giorni_registrati;

-- PROMEMORIA
-- Per vedere quante generazioni hai usato oggi:
--   select * from public.generator_usage order by day desc limit 7;
--
-- Per azzerare il contatore di oggi:
--   update public.generator_usage set count = 0 where day = current_date;
