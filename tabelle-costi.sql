-- ============================================================
--  I COSTI DEL GENERATORE — due colonne sul contatore che c'è già
--  Da eseguire su Supabase: SQL Editor → incolla → Run.
--  Si può rieseguire quante volte si vuole: non cancella niente.
-- ============================================================
--
--  PERCHÉ
--  Il contatore `generator_usage` sa già QUANTE generazioni sono state
--  fatte ogni giorno, ed è quello che tiene il tetto. Non sa però quanto
--  sono costate: una proposta e una settimana intera contano una tacca a
--  testa, ma non spendono uguale.
--
--  Due colonne, e diventa una stima di spesa leggibile dentro l'app.
--
--  ⚠️ RESTA UNA STIMA, e l'app lo deve scrivere ogni volta che la mostra.
--  Il conto vero è quello della Console di Anthropic: i prezzi cambiano,
--  e i token contati qui non comprendono tutto (la cache, per esempio).
-- ============================================================

alter table public.generator_usage
  add column if not exists tok_in  bigint not null default 0,
  add column if not exists tok_out bigint not null default 0;

comment on column public.generator_usage.tok_in is
  'Token di ingresso del giorno: il testo mandato al modello (dispensa, regole, contesto). Costano poco ma sono tanti.';
comment on column public.generator_usage.tok_out is
  'Token di uscita del giorno: pensiero piu'' risposta. Costano molto di piu'' ed e'' li che si va a finire.';

-- ------------------------------------------------------------
--  Chi scrive: solo il lato server
-- ------------------------------------------------------------
--  ⚠️ La tabella ha RLS accesa e ZERO policy, e deve restare cosi': e'
--  invisibile alla chiave pubblica, quindi non manomettibile da chi apre
--  l'indirizzo. Non aggiungere policy per far leggere i costi all'app —
--  ci pensa la Edge Function con la chiave di servizio (modo 'costi').

create or replace function public.registra_token(entrata bigint, uscita bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.generator_usage (day, count, tok_in, tok_out)
  values (current_date, 0, entrata, uscita)
  on conflict (day) do update
     set tok_in  = generator_usage.tok_in  + entrata,
         tok_out = generator_usage.tok_out + uscita;
end;
$$;

revoke execute on function public.registra_token(bigint, bigint) from public, anon, authenticated;
grant  execute on function public.registra_token(bigint, bigint) to   service_role;

-- ------------------------------------------------------------
--  Controllo: cosa c'è adesso
-- ------------------------------------------------------------
select day, count, tok_in, tok_out
from public.generator_usage
order by day desc
limit 10;
