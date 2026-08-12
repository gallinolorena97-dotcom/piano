-- ============================================================
--  Piano & Dispensa — freno di sicurezza del generatore ricette
--
--  Da incollare nel SQL Editor di Supabase e premere RUN.
--  Puoi rieseguirlo quante volte vuoi: non fa danni.
--
--  PERCHÉ SERVE
--  L'app non ha login: chiunque conosca l'indirizzo può premere
--  "Genera". Ogni generazione consuma un po' del tuo credito
--  Anthropic. Questo contatore mette un tetto massimo al giorno,
--  così la spesa non può scappare di mano in nessun caso.
--
--  Il tetto vero è scritto nella Edge Function (MAX_AL_GIORNO).
--  Questa tabella tiene solo il conteggio.
-- ============================================================


-- ------------------------------------------------------------
-- 1) La tabella del conteggio: una riga per giorno
-- ------------------------------------------------------------
create table if not exists public.generator_usage (
  day   date primary key default current_date,
  count integer not null default 0
);

-- RLS accesa e NESSUNA policy: la tabella è invisibile all'app
-- e al pubblico. Solo la Edge Function, che lavora lato server,
-- può toccarla. Così il contatore non è manomettibile dall'esterno.
alter table public.generator_usage enable row level security;

revoke all on public.generator_usage from anon, authenticated;


-- ------------------------------------------------------------
-- 2) La funzione che conta: aggiunge 1 e dice se si può procedere
--    Restituisce il numero di generazioni usate oggi,
--    oppure -1 se il tetto è già stato raggiunto.
-- ------------------------------------------------------------
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
    return -1;              -- tetto raggiunto: oggi non si genera più
  end if;
  return usate;
end;
$$;

-- Solo il lato server può chiamarla. Chi apre l'app non può
-- azzerare il contatore né aggirarlo.
revoke execute on function public.consuma_generazione(integer) from public, anon, authenticated;
grant  execute on function public.consuma_generazione(integer) to   service_role;


-- ------------------------------------------------------------
-- 3) Pulizia: teniamo solo gli ultimi 60 giorni di conteggi
-- ------------------------------------------------------------
delete from public.generator_usage where day < current_date - 60;


-- ------------------------------------------------------------
--  CONTROLLO FINALE
--  Devi vedere: la tabella generator_usage con 0 policy
--  (è giusto così: nessuno dall'esterno può leggerla).
-- ------------------------------------------------------------
select
  'generator_usage'                                  as tabella,
  (select count(*) from pg_policies
    where schemaname='public' and tablename='generator_usage') as policy_presenti,
  (select count(*) from public.generator_usage)      as giorni_registrati;


-- ------------------------------------------------------------
--  A COSA SERVE SAPERLO
--  Per vedere quante generazioni hai usato oggi:
--     select * from public.generator_usage order by day desc limit 7;
--
--  Per azzerare il contatore di oggi (se hai finito le generazioni
--  per sbaglio e ti servono subito):
--     update public.generator_usage set count = 0 where day = current_date;
-- ------------------------------------------------------------
