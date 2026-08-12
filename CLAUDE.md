# Piano & Dispensa — stato del progetto

> Promemoria per le sessioni future di Claude Code. Leggilo prima di toccare qualsiasi cosa.

## Con chi stai lavorando — ⚠️ leggi prima di nominare qualcuno

Le persone sono **due, e non vanno confuse**:

| | **Ciprian** | **Lorena** |
|---|---|---|
| Obiettivi | 170 g proteine · 2200 kcal, in deficit | **nessun obiettivo**, mangia normale |
| Vincoli | nessuno | non mangia **pomodoro crudo, cetrioli, interiora** |
| Abitudini | mangia sempre a casa, tollera la ripetizione | spesso non a casa, vuole varietà e il tocco dolce |

- L'**account GitHub e Supabase è di Lorena** (`gallinolorena97-dotcom`).
- Il **progetto è nato da Ciprian**, che all'inizio era l'unico a usarlo: per questo
  i primi documenti davano per scontato che «io» fosse chi ha l'obiettivo proteico.
- **Oggi lo usano entrambi**, ognuno col proprio profilo sul proprio telefono.

⚠️ **I brief più vecchi contengono questo equivoco**: `PROMPT-V6-PROFILI.md` attribuisce
a «Lorena» i 170 g di proteine e chiama «X» l'altra persona. **È sbagliato** — corretto
dall'utente il 12/08/2026. Se un brief e questa tabella si contraddicono, vince questa
tabella. Nel dubbio, chiedi invece di dedurre.

⚠️ **Gli `slug` nel database non sono i nomi**: per ragioni storiche lo slug `lorena`
contiene il profilo di **Ciprian**, e lo slug `x` quello di **Lorena**. La persona è
sempre e solo quella scritta nella colonna `nome`.

L'utente **non è programmatrice**. Spiega ogni passaggio in italiano semplice, senza gergo.
Prima di ogni azione con effetti (push su GitHub, scritture sul database, cancellazioni):
**riassumi cosa stai per fare e chiedi conferma esplicita**. Se qualcosa fallisce, dai la
diagnosi in parole semplici e **una** soluzione alla volta.

## Cos'è

App a file unico per il piano pasti settimanale, l'inventario di casa e le ricette.
Si usa quasi solo da iPhone, come icona sulla home screen.

## Stack (vincolato, non negoziabile)

- **Un solo `index.html`**: vanilla JS, niente framework, niente build step, niente dipendenze da installare.
- `@supabase/supabase-js` v2 via CDN ESM (`https://esm.sh/@supabase/supabase-js@2`).
- Hosting: **GitHub Pages**, repo `gallinolorena97-dotcom/piano`, branch `main`, cartella root.
- **L'URL pubblico non deve mai cambiare**: l'icona sull'iPhone punta lì.

## Identità visiva

| Ruolo | Colore |
|---|---|
| sfondo crema | `#FAF6EF` |
| verde | `#1E5B3C` |
| salvia | `#DEEADF` |
| ambra | `#B9722A` / sfondo `#F6E7CD` |
| blu note freezer | `#2456A6` |
| testo | `#27241C` |

Mobile-first. I meta tag Apple (`apple-mobile-web-app-*`, `apple-touch-icon`) vanno conservati.

## Database (Supabase)

Project URL: `https://bixdbnhructlsxuvkmic.supabase.co`
Nel frontend c'è solo la chiave **publishable** (`sb_publishable_…`), che è l'equivalente
nuovo della vecchia `anon`.

> ⛔ La chiave segreta (`sb_secret_` / `service_role`) non va mai chiesta né usata da nessuna parte.

### Tabelle

| Tabella | Contenuto |
|---|---|
| `plan_days` | `day` (date, PK), `payload` (jsonb), `updated_at` |
| `inventory_items` | `id`, `name`, `qty` (testo libero), `cat` (`frigo`/`freezer`/`dispensa`), `updated_at` |
| `recipes` | `id`, `name`, `pref` (`fav`/`ok`/`no`, null = senza voto), `updated_at` |
| `settings` | `key`, `value` — contiene `kcal_target` e `protein_target` |

| `generator_usage` | `day` (date, PK), `count` — contatore del generatore, **senza policy**: invisibile all'app |
| `shopping_list` | `id`, `name`, `done`, `created_at` — la lista della spesa |
| `meals_log` | `id`, `day`, `pasto`, `piatto`, `prot`, `kcal`, `chi`, `proteina` — il diario dei pasti |
| `profiles` | `slug` (`lorena`/`x`), `nome`, `prot_target`, `kcal_target`, `ripetizione`, `non_mangia[]`, `evita[]`, `ama[]`, `note` |

Queste sono **tutte** le tabelle. `allowed_writers` e la funzione `is_writer()` sono
state cancellate dal database il 12/08/2026: non esistono più.

### Sicurezza — ⚠️ l'app NON ha login

Su ognuna delle quattro tabelle c'è **una sola policy**, `"accesso libero"`:
`for all to anon, authenticated using (true) with check (true)`.
RLS resta accesa, ma dice sì a tutti: **chiunque apra l'URL legge e scrive**.

Nel frontend non c'è nessun codice di autenticazione: niente `sb.auth.*`, niente pulsante
Accedi, nessuna schermata di login, nessuna variabile tipo `canWrite`. Tutte le tab sono
visibili e i moduli di modifica sono attivi già alla prima apertura. L'unico riferimento ad
auth rimasto è `auth:{ persistSession:false }` nella `createClient`, che serve proprio a
tenere spenta la gestione utenti della libreria.

**Perché** (decisione presa l'11/08/2026, dopo aver provato la strada del login):

1. Il requisito iniziale era login passwordless con codice via email.
2. I magic link sono inservibili qui: su iPhone il link apre Safari, che ha una memoria
   separata dalla web app aggiunta alla home, quindi la sessione non arriva mai all'app.
3. Il codice a 6 cifre richiede di mettere `{{ .Token }}` nei template email — ma Supabase,
   col servizio email gratuito incluso, **non consente di modificare i template**.
   Servirebbe un SMTP esterno.
4. Messa di fronte alla scelta fra password condivisa e nessun login, l'utente ha scelto
   **nessun login**, dopo che il rischio le era stato spiegato. È una decisione sua: non
   rimetterla in discussione a ogni sessione.

Il 12/08/2026 l'utente ha chiesto di completare la pulizia: la tabella `allowed_writers` e
la funzione `is_writer()` sono state **cancellate** dal database (`cambio-accesso-libero.sql`).
La ricetta per ricrearle, se un giorno si volesse rimettere il login, resta commentata in
fondo a `setup.sql`.

### Formato di `plan_days.payload`

```json
{
  "label": "Lunedì 11/08",
  "tag": "Palestra",
  "rows": [
    { "type": "meal",    "title": "PRANZO", "text": "Riso 80 g, pollo 150 g, piselli", "kcal": 720, "prot": 55 },
    { "type": "meal",    "title": "CENA",   "text": "Insalatona di tonno",             "kcal": 610, "prot": 48 },
    { "type": "freezer", "text": "scongelare i filetti di pollo" },
    { "type": "note",    "text": "pasto libero" }
  ],
  "tot": { "kcal": 2280, "prot": 172 }
}
```

- `type: "meal"` → riga in grassetto con titolo (PRANZO / CENA / COLAZIONE / SPUNTINO)
- `type: "freezer"` → riga blu, il fiocco ❄ lo mette l'app se manca
- `type: "note"` → riga in corsivo grigia
- `kcal`, `prot`, `tag`, `tot` sono facoltativi: se mancano non vengono mostrati

## Il generatore di ricette — tab "Cosa cucino"

Aggiunta del 12/08/2026. Propone piatti partendo dalla dispensa reale.

### Come è fatto

```
iPhone (index.html)  →  Supabase Edge Function "cosa-cucino"  →  API Anthropic
      tab "Cosa cucino"        legge da sé inventario/ricette          Claude
```

- **La chiave API non è mai nel frontend.** Sta nei Secrets di Supabase.
  La function la cerca da sola: prova i nomi più comuni (`ANTHROPIC_API_KEY`,
  `CLAUDE_API_KEY`, …) e, se non li trova, cerca fra tutti i secrets un valore
  che inizi con `sk-ant-`. Non serve rinominare nulla.
- **La function non si fida del client**: legge inventario, ricette e settings
  direttamente dal database con la chiave di servizio (iniettata da Supabase,
  mai scritta a mano né richiesta all'utente).
- **Modello**: `claude-sonnet-5`, `effort: medium`, adaptive thinking, structured
  outputs (`output_config.format`) — così la risposta è JSON garantito e non
  serve parsing fragile.

### Il freno di spesa — ⚠️ leggere prima di toccare

L'app non ha login: chiunque abbia l'indirizzo può premere "Genera" e consumare
credito. La difesa è **un tetto giornaliero applicato lato server**:

- tabella `generator_usage` (RLS accesa, **zero policy** → invisibile alla chiave
  pubblica, non manomettibile dall'esterno);
- funzione `consuma_generazione(limite)`, `security definer`, eseguibile solo da
  `service_role`; incrementa e restituisce `-1` se il tetto è raggiunto;
- il tetto vero è la costante `MAX_AL_GIORNO` nella Edge Function (oggi **30**).

Costo indicativo: ~2 centesimi a generazione. 30/giorno = tetto di spesa di circa
60 centesimi al giorno nel caso peggiore.

**Non rimuovere il contatore** senza sostituirlo con qualcos'altro: è l'unica cosa
che sta fra l'indirizzo pubblico e la carta di credito.

### Vincoli del metodo

Le 8 regole (proteine dominanti, kcal, deperibili, cucina-doppio, scongelamento,
pasti liberi, commensale X, tempo) stanno nella costante `REGOLE` dentro
`edge-function-cosa-cucino.ts`. **Se il metodo cambia, si cambia lì**, non nel
frontend.

### Le estensioni v4 (12/08/2026)

Le cinque tab sono: Piano · Dispensa · Ricette · Cucino · Spesa.
Dentro **Cucino** c'è un interruttore **Proposte / Diario**.

**Blocco 1 — «Ho cucinato questo»** (al posto di «Scelgo questa»)
Riepilogo modificabile, poi scalo della dispensa. Le regole di scalo stanno in
`calcolaRiga()` e sono volutamente prudenti: **si calcola solo quando il calcolo è
sicuro**. Quantità come `~1 kg`, `sì`, `2×100 g`, `? da verificare` non vengono mai
stimate: si chiede il valore. `leggiQta()` conserva la **coda** del testo (`110 g ·
scad. 29/8` → `30 g · scad. 29/8`): le scadenze non devono sparire scalando.
Ogni conferma lascia un **annulla** che ripristina dispensa, ricetta e diario.

**Blocco 2 — spesa e «ti manca»**
La function può proporre piatti con **max 2 ingredienti mancanti**, mai la fonte
proteica, e **almeno una delle 3 proposte dev'essere fattibile** con quello che c'è.
Dal riquadro «ti manca» si aggiunge tutto alla lista con un tocco.

**Blocco 3 — diario**
`meals_log` si popola da «Ho cucinato questo» e a mano. La function **rilegge da sé**
gli ultimi 5 giorni e non ripete la stessa `proteina_principale` più di 2 volte in
3 giorni, né lo stesso piatto entro 2 giorni. Vista a 14 giorni, copia a 7 giorni.
**Niente punteggi, streak o grafici**: è un registro, non una pagella.

**I blocchi 4-8 della v4 sono annullati**: assorbiti da V5 e V6 (decisione del 12/08/2026).

### La v6 — i due profili (12/08/2026)

**Blocco 1 — profili.** Tabella `profiles`, due righe (slug `lorena` = Ciprian,
slug `x` = Lorena: vedi l'avvertenza in cima a questo file). La riga sotto il titolo
**segue il profilo selezionato**: mostra il suo nome e i **suoi** obiettivi, e per chi
non ne ha scrive «nessun obiettivo» senza numeri — i target **non sono universali** e
non vanno più letti da `settings`. Toccandola si apre la schermata Profilo
(non è una tab: è `#tab-profilo`, mostrata da `apriProfilo()`).
Il selettore «su questo telefono sono» sta in `localStorage` con chiave `piano-io`.
**Non è un login e non protegge nulla**: entrambi i profili sono modificabili da
entrambi. Le liste sono `text[]` in Postgres, array JS nel frontend.

**Blocco 2 — chi mangia.** Tre voci con i nomi veri: `io` · `io_e_x` · `solo_x`
(gli stessi valori accettati da `meals_log.chi`). Il frontend manda solo `chi` e
`io_slug`: **i profili li rilegge la function dal database**, non arrivano dal telefono.
I divieti non si negoziano; a pasto condiviso la fonte proteica può essere diversa per
le due persone; se un piatto unico non funziona la function propone due piatti distinti.
La regola della varietà è **per persona** (campo `ripetizione`).

**Blocco 3 — streaming.** La function chiama Anthropic con `stream: true` e riconosce
ogni proposta dentro il JSON mentre si scrive (`creaLettore()`: conta le graffe tenendo
conto di stringhe ed escape), spedendola come **NDJSON** — una riga JSON per messaggio.
Resta **una sola chiamata al modello**: conta come una generazione sola rispetto al
tetto, e il modello vede le tre proposte insieme, che serve a garantire che almeno una
sia fattibile e che siano diverse. Il client ha un ripiego per la function vecchia
(blocco unico `{proposte:[…]}`) e per i browser senza streaming.

⚠️ **Non passare a tre chiamate parallele** per andare più veloce: si perderebbero
proprio le garanzie fra proposte, e il costo triplicherebbe l'input.

### Ancora da fare

`PROMPT-V5-PIANO-SETTIMANALE.md` (il piano settimanale, **dovrà tener conto dei due
profili**), i blocchi 4-5 della v6 (voti per persona, registro con chi c'era) e
`PROMPT-V7-DESIGN.md`.

### Cosa NON fare qui

- Non mettere la chiave API in `index.html` per nessun motivo.
- Non far passare l'inventario dal client alla function: la function lo rilegge.
- Non aggiungere un database alimenti né conteggio calorie interattivo:
  i numeri li stima Claude dentro la proposta e restano lì.

## Vincoli di metodo (importanti quanto quelli tecnici)

- **Niente database alimenti**, niente conteggio calorie interattivo: i numeri di kcal e
  proteine arrivano già scritti dentro il piano.
- **Niente streak, badge, punteggi** o meccaniche che puniscono i giorni saltati.
- I **due pasti liberi settimanali** sono parte del metodo: nel piano compaiono come slot
  normali, mai etichettati come "sgarri".
- Semplice e funzionante batte elegante. Non ottimizzare oltre il richiesto.

## Operazione ricorrente: il piano della settimana

Comando: `/piano-settimana` (vedi `.claude/commands/piano-settimana.md`).
In sintesi: parsing del testo incollato → riepilogo → conferma → file SQL di `upsert`.
**I giorni vecchi non si cancellano mai**: restano come storico.

## File

| File | Note |
|---|---|
| `index.html` | l'app |
| `apple-touch-icon.png` | icona home screen |
| `setup.sql` | schema + RLS + seed dei settings, per ripartire da un progetto Supabase nuovo. È in `.gitignore` per una richiesta dell'utente di quando conteneva la sua email; oggi non la contiene più |
| `cambio-accesso-libero.sql` | la migrazione che ha tolto il login dal database: cancella `allowed_writers` e `is_writer()`, azzera le vecchie policy e ne mette una sola per tabella. Rieseguibile senza danni |
| `edge-function-cosa-cucino.ts` | il codice della Edge Function. **Non viene servito da Pages**: sta nel repo solo come copia di riferimento, va incollato nel pannello Supabase |
| `limite-generatore.sql` | tabella e funzione del tetto giornaliero di generazioni |
| `seed-dati-iniziali.sql` | inventario e ricette di partenza (11/08) |
| `README-OPERATIVO.md` | la routine per l'utente |
| `DATI-INIZIALI.txt` | fotografia di partenza |
| `PROMPT-CLAUDE-CODE.md` | il brief originale |

## Cosa NON fare

- Non cambiare URL pubblico, nome del repo o branch di Pages.
- Non introdurre framework, bundler, TypeScript o dipendenze da installare.
- Non toccare né chiedere la chiave segreta.
- Non cancellare dati senza mostrare prima cosa verrà cancellato.
