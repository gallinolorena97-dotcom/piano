# PROMPT PER CLAUDE CODE — App "Piano & Dispensa" v2 con backend Supabase

## Chi sono e come lavorare con me
Non sono una programmatrice. Spiegami ogni passaggio in italiano semplice, senza gergo.
Prima di ogni azione con effetti (push su GitHub, modifiche al database, cancellazioni)
fermati, riassumi cosa stai per fare e chiedimi conferma esplicita.
Se qualcosa fallisce, dammi la diagnosi in parole semplici e UNA soluzione alla volta.

## Contesto
Ho un sito su GitHub Pages (repo: te lo indico io in chat, cartella con `index.html`).
È un'app a file unico, vanilla JS, con 3 tab — Piano (piano pasti settimanale),
Dispensa (inventario frigo/freezer/dispensa), Ricette (con voti ♥/OK/NO) — più un
bottone "Copia per Claude" che esporta tutto in testo. Oggi i dati vivono in
`localStorage` (chiave `dispensa_v1`) e il piano è scritto dentro l'HTML.

Obiettivo della v2: spostare TUTTI i dati su Supabase, così:
1. il piano settimanale si aggiorna inserendolo nel database (lo farai tu quando
   te lo incollo), senza più sostituire file su GitHub;
2. inventario e ricette sono sincronizzati tra dispositivi;
3. un'altra persona ("X") può vedere tutto dal suo telefono; la scrittura è
   riservata agli indirizzi email che ti fornirò.

## Stack vincolato (non negoziabile)
- Frontend: **un solo `index.html`**, vanilla JS, niente framework, niente build step.
- `@supabase/supabase-js` v2 caricato via CDN (ESM).
- Hosting: GitHub Pages sul repo esistente (branch main). L'URL non deve cambiare:
  l'icona sulla home screen del mio iPhone deve continuare a funzionare.
- Conserva l'identità visiva attuale: sfondo crema #FAF6EF, verde #1E5B3C,
  salvia #DEEADF, ambra #B9722A / #F6E7CD, blu note freezer #2456A6, testo #27241C.
- Conserva i meta tag Apple (apple-mobile-web-app-*, apple-touch-icon già presente).
- Mobile-first: si usa quasi solo da iPhone.

## Modello dati (indicativo — proponi migliorie ma resta semplice)
```sql
create table plan_days (
  day date primary key,
  payload jsonb not null,        -- label, tag, righe pasto/freezer/nota, totali
  updated_at timestamptz default now()
);
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  qty text not null default '—', -- testo libero; se contiene '?' l'app mostra VERIFICA
  cat text not null check (cat in ('frigo','freezer','dispensa')),
  updated_at timestamptz default now()
);
create table recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pref text check (pref in ('fav','ok','no'))  -- null = senza voto
);
create table settings (
  key text primary key,
  value text not null
);
-- default: kcal_target = '2200-2350', protein_target = '170'
```

## Autenticazione e sicurezza (requisiti, tu scegli l'implementazione)
- Login senza password: magic link / codice via email (Supabase Auth).
- RLS attiva su tutte le tabelle: **lettura consentita anche senza login**
  (X deve solo aprire l'URL), **scrittura solo per utenti autenticati**.
- La scrittura deve essere possibile SOLO per gli indirizzi email che ti darò
  (allowlist): proponi tu il meccanismo più semplice e spiegamelo.
- Nel frontend vanno solo Project URL e chiave `anon` (che ti fornisco io).
  Non chiedermi mai la `service_role` e non inserirla da nessuna parte.

## Funzionalità per tab (parità con oggi + sync)
1. **Piano**: legge `plan_days`, mostra le card dei giorni con la struttura attuale
   (banda giorno, righe PRANZO/CENA in grassetto con grammi e kcal, righe freezer ❄
   in blu, totale a destra), evidenzia il giorno corrente con badge OGGI e vi scorre
   all'apertura. Header con i target da `settings`.
2. **Dispensa**: CRUD su `inventory_items` (aggiungi con categoria, cerca, modifica
   quantità, elimina con possibilità di ripristino). Le quantità con `?` mostrano
   l'etichetta VERIFICA con bordo ambra, come oggi.
3. **Ricette**: CRUD su `recipes`, voti ♥ / OK / NO come toggle.
4. **Copia per Claude**: genera lo stesso testo di oggi (INVENTARIO per categorie,
   sezione DA VERIFICARE, sezione RICETTE per voto) leggendo dal database.
5. Stato di caricamento e messaggi d'errore comprensibili; se manca la rete,
   dillo chiaramente invece di mostrare una pagina vuota.

## Vincoli di metodo (importanti quanto quelli tecnici)
- NIENTE database alimenti, niente conteggio calorie interattivo: i numeri di kcal
  e proteine arrivano già scritti dentro il piano.
- NIENTE streak, badge, punteggi o meccaniche che puniscono i giorni saltati.
- I due pasti liberi settimanali sono parte del metodo: nel piano compaiono come
  slot normali, mai come "sgarri".

## Migrazione dati (prima sessione)
Ti incollerò l'export dell'app attuale, in questo formato:
```
INVENTARIO — aggiornato GG/MM ore HH:MM

FRIGO
- Nome — quantità
...
CONGELATORE
...
DISPENSA
...
DA VERIFICARE
- Nome
...
RICETTE
Preferite: a, b
Vanno bene: c
Da non riproporre: d
Senza voto: e, f
```
Fai il parsing e popola `inventory_items` e `recipes`. Mostrami un riepilogo
(quanti elementi per categoria) e chiedi conferma prima di scrivere.

## Aggiornamento settimanale del piano (operazione ricorrente)
Quando ti incollo un piano settimanale (testo con giorni, righe PRANZO/CENA,
righe ❄, TOT — il formato delle card attuali), devi:
1. fare il parsing in record `plan_days` (una riga per giorno, payload jsonb);
2. mostrarmi il riepilogo (date coperte, n. pasti per giorno);
3. dopo la mia conferma, fare upsert sul database — i giorni vecchi restano
   come storico, non cancellarli.
Crea per questo un comando o una procedura ripetibile e documentala.

## Deliverable della prima sessione
1. `setup.sql` completo (tabelle, RLS, policy, seed dei `settings`) con le
   istruzioni per incollarlo nel SQL Editor di Supabase.
2. Il nuovo `index.html` (e nient'altro di necessario al runtime).
3. `README-OPERATIVO.md`: la mia routine settimanale spiegata in 10 righe semplici.
4. `CLAUDE.md` nel repo con lo stato del progetto, così le prossime sessioni
   ripartono senza rispiegare tutto.
5. Commit e push su GitHub (previa conferma), poi una checklist di test da fare
   insieme: apertura pagina, login dal telefono, aggiunta/modifica/cancellazione
   di un ingrediente, voto a una ricetta, "Copia per Claude", verifica che X
   veda i dati senza login.

## Cosa NON fare
- Non cambiare l'URL pubblico, il nome del repo o il branch di Pages.
- Non introdurre framework, bundler, TypeScript o dipendenze da installare.
- Non toccare/chiedere la chiave `service_role`.
- Non cancellare dati senza mostrarmi prima cosa verrà cancellato.
- Non ottimizzare oltre il richiesto: semplice e funzionante batte elegante.
