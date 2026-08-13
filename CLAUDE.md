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
| `plan_meals` | il calendario v5: **una riga per pasto**. Vedi lo schema più sotto |

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

### La v7 — il design (12/08/2026)

**⚠️ Regola per ogni schermata futura, v5 compresa: si usano i token, non si
inventano colori.** Stanno in cima al `<style>` di `index.html`, sezione «1 · TOKEN».
Se serve un colore che non c'è, si aggiunge un token lì e lo si usa: mai un valore
scritto a mano dentro una regola.

- **Palette** lavanda e menta. Il pastello sta su sfondi e superfici, **mai sul testo**.
  `--viola-testo` esiste apposta: il viola pieno su `--lavanda-soft` dà 4.43, sotto la
  soglia AA. Ogni combinazione in uso è stata misurata: la più bassa è 5.18.
- **Tipografia**: Fraunces per i titoli, Outfit per l'interfaccia. Due famiglie, basta.
- **Navigazione**: su telefono in basso, su desktop in alto (`@media (min-width:760px)`).
  `misuraTestata()` misura le altezze a runtime e azzera `--nav-alt` quando la barra è
  in basso: è ciò che tiene giuste le intestazioni appiccicose della Dispensa.
- **Icone e illustrazioni**: tutte SVG scritte dentro `index.html`, in `<defs>`.
  Nessuna immagine esterna, nessun download.
- **Icona dell'app**: barattolo col germoglio. `apple-touch-icon.png` (180, quadrato
  pieno: gli angoli li arrotonda iOS), `favicon.svg`, `favicon-32/180.png`.
  Rigenerabili con lo script in `scratchpad/icona.ps1` — è disegnata con primitive
  geometriche, non convertita da un'immagine.

### La v5 — il calendario (12/08/2026, Blocco 1)

La tab **Piano** non legge più `plan_days`: legge **`plan_meals`**, una riga per pasto.
Lo schema sta in `tabelle-piano-v5.sql`, con i campi commentati uno per uno.

- **Striscia dei 7 giorni** appiccicata sotto la testata, con la stessa meccanica delle
  intestazioni della Dispensa (`--h-alt` + `--nav-alt`). I chip sono `flex:1 0 42px`:
  **sette devono starci tutti sullo schermo di un iPhone**, oltre i sette la striscia scorre.
- **Tre trattamenti**: `passato` (mostra il **diario**, non il piano) · `confermato`
  (oggi e domani) · `bozza` (da dopodomani, bordo tratteggiato + badge). Lo stato scritto
  nel database vince; se manca, `statoGiorno()` lo deduce dalla distanza da oggi.
  Il trattamento cambia **bordo ed etichetta, mai il contrasto del testo**.
- **I numeri sono solo di Ciprian**, voci fisse comprese (colazione 20 g · 290 kcal,
  yogurt 17 g · 100 kcal, costante `FISSE_CIPRIAN`). Le fisse sono **scritte sotto il
  totale**: un numero non deve mai arrivare dal nulla. Nei pasti di sola Lorena non
  compare nessun numero. Nei giorni con Fuori/Libero il totale scende e lo si dichiara:
  **non si compensa mai** nei giorni vicini.
- **`chi` usa i nomi veri** (`ciprian`/`entrambi`/`lorena`), non gli slug. La traduzione
  verso `profiles` sta nella costante `SLUG_DI_CHI` in `index.html`: è l'unico punto in
  cui i due vocabolari si incontrano, e c'è l'avvertenza sul posto.
- **`dolce` ha un riquadro suo** (`.nota.dolce`), non si mescola agli ingredienti.
- **Gli scongelamenti si mostrano su `scongelare_il`**, non sul giorno del pasto:
  `promemoriaDi()` gira tutto il piano cercando i promemoria che scadono quel giorno.
  È il motivo per cui la tabella ha una riga per pasto e non per giorno.
- Se la tabella non esiste ancora, la tab lo dice e **il resto dell'app continua a
  funzionare** (`S.pianoErr`): il calendario è facoltativo come spesa e profili.
- `prova-piano-v5.sql` mette una settimana finta per poter collaudare prima del Blocco 2.
  Contiene apposta tutti i casi: entrambi, solo uno, un fuori, un libero, un avanzo che
  passa da Ciprian a tutti e due, due scongelamenti, un «dipende dalla spesa», un giorno
  senza cena, un giorno vuoto.

### La v5 — «Genera la settimana» (13/08/2026, Blocco 2)

Il tasto è collegato. Sta in due punti: nello stato vuoto (`#pnGenera`, grande) e in
fondo alla tab Piano quando un piano c'è già (stesso id, stile ghost). Apre
`#pnWizard`, che **prende il posto del calendario** dentro la stessa tab: tre schermate
in fila, `PS.fase` dice quale.

1. **La passata.** Sette giorni × due pasti, ognuno con modo (A casa/Fuori/Libero),
   chi mangia e una nota facoltativa. **Parte tutta compilata** su «A casa · Tutti e
   due»: si tocca solo ciò che cambia, ed è il motivo per cui sta sotto il minuto.
   Il chip «di solito a tavola ci sono» imposta tutti e quattordici i pasti insieme.
   Ogni tocco ridisegna **solo quel pasto** (`ridisegnaPasto`), altrimenti il testo
   della nota che stai scrivendo sparirebbe.
2. **La generazione.** Quattro blocchi da **due giorni** (1-2, 3-4, 5-6, 7). Ogni
   blocco è una chiamata alla Edge Function con `modo:'settimana'`, e riceve
   `gia_pianificato` (i pasti già decisi, ingredienti compresi) e `resta_prima` (cosa
   resta in dispensa secondo il blocco precedente). **È questo che tiene in piedi la
   coerenza di magazzino.** Fuori e liberi non si generano: si mandano come contorno
   informativo (`fuori_e_liberi`), perché dicono chi non c'è.
3. **Il riepilogo.** Mostra le righe **esatte** che finiranno in `plan_meals`
   (`righeDaSalvare()`), i totali di Ciprian giorno per giorno riusando
   `totaleGiorno()`, cosa manca e cosa resta. Solo qui si scrive nel database.

Salvataggio: `delete` dei giorni della passata + `insert` delle righe nuove. I mancanti
finiscono nella lista della spesa esistente (`aggiungiAllaSpesa(nomi, silenzioso)`) e i
pasti che li aspettano hanno `dipende_da_spesa = true`. Il campo data ha `min = oggi`:
**il passato non si riscrive mai.**

⚠️ **Il tetto: una settimana costa 4 tacche, non 1.** Il brief chiedeva che contasse
come una sola generazione, ma i blocchi sono quattro chiamate vere: contarne una
lascerebbe le altre senza freno, e il freno è l'unica cosa fra l'indirizzo pubblico e
la carta di credito. Con 30/giorno restano 7 settimane al giorno e **il tetto di spesa
non si muove** (~60 centesimi al giorno nel caso peggiore). Sul primo blocco la
function controlla che il margine basti per tutti (`generazioniUsateOggi()`): meglio
fermarsi prima che a metà settimana.

### ⚠️ Il bug del 13/08/2026: `max_tokens` è pensiero + risposta

Al primo collaudo vero «Genera la settimana» si è fermata dicendo «riprova con meno
giorni». Causa: `MAX_TOKENS_SETTIMANA` era **12000**, e con il ragionamento adattivo
quel numero è un tetto su **pensiero e risposta messi insieme**, non solo sulla
risposta. Simulare il magazzino di sei pasti con divieti, target e avanzi fa ragionare
a lungo: il modello finiva i token prima di scrivere il primo piatto, e `stop_reason`
tornava `max_tokens` con zero pasti completi. Sonnet 5 usa anche un tokenizer nuovo
(~30% di token in più a parità di testo), che stringe ancora.

Tre correzioni, tutte e tre necessarie:

1. **`MAX_TOKENS_SETTIMANA` da 12000 a 32000.** È un tetto, non una spesa: alzarlo non
   costa di per sé. **Non riabbassarlo.** Il massimo di Sonnet 5 è 128000.
2. **Blocchi da 2 giorni invece di 3** (4 chiamate invece di 3). Compito più piccolo,
   e restano abbastanza per tenere nello stesso blocco la coppia «cena di oggi →
   avanzo a pranzo domani».
3. **Ripiego automatico**: se un blocco viene troncato lo stesso, la function lo dice
   con `troncato:true` nel messaggio `fine` (**non** come errore) e il client rifà da
   solo i pasti mancanti **un giorno alla volta** (`rigeneraGiornoPerGiorno()`). Non
   si chiede niente all'utente: è un intoppo tecnico, non una decisione. Se anche un
   singolo giorno non riesce, resta un buco e il riepilogo lo dichiara — la settimana
   non si perde.

⚠️ `troncato` non è un errore e non va trasformato in uno: se la function mandasse
`{tipo:'errore'}`, la settimana si fermerebbe e il lavoro tornerebbe sulle spalle di
chi guarda.

⚠️ **La Edge Function è stata riorganizzata**: le letture dal database, la chiamata ad
Anthropic, il lettore del JSON incrementale e il flusso NDJSON sono ora scritti **una
volta sola** e usati da tutti e due i mestieri (proposte del giorno e piano
settimanale). Il file va **reincollato su Supabase**: il ramo `modo:'settimana'` non
esiste nella versione online vecchia. Lato client vale lo stesso: `flussoNdjson()` è
condivisa, `chiamaGeneratore()` ci sta sopra.

### ⚠️ Ogni azione che salva deve dare un esito visibile

Regola introdotta dopo un bug vero: il pulsante «Conferma e aggiorna» falliva e
l'errore usciva nel **banner in cima alla pagina**, invisibile a chi guardava il
pannello in fondo. Sembrava che il pulsante non funzionasse.

- **Errori delle azioni** → `esitoErrore(e)`, che usa il toast in basso: è fisso, si
  vede da qualunque punto della pagina. Mai `banner()` per un'azione.
- **Il banner** resta solo per i problemi di caricamento iniziale, quando sei in cima.
- `spiegaErrore()` deve dire **quale file SQL eseguire**, non il messaggio del database.
- Le operazioni accessorie non devono far fallire quelle principali: in
  `confermaCucinato`, se la dispensa è aggiornata e fallisce il salvataggio della
  ricetta, si tiene il lavoro fatto e si dice cosa non è riuscito.

### 🔖 DOVE SIAMO — leggere per prima cosa in una sessione nuova

**Aggiornato: 13/08/2026.**

#### ✅ Fatto e online

v4 (blocchi 1-3), v6 (blocchi 1-3), **v7 completa**, **v5 Blocco 1** (il calendario:
collaudato dall'iPhone il 13/08 — tre stati distinguibili, dolce nel suo riquadro,
numeri solo sui pasti di Ciprian, promemoria freezer sul giorno giusto),
**v5 Blocco 2** («Genera la settimana», collaudato) e **v5 Blocco 3** (la verifica del
giorno, **da collaudare**). In più: si cambia giorno strisciando col pollice.

`tabelle-piano-v5.sql` è stato eseguito e la settimana di prova è stata rimossa;
`prova-piano-v5.sql` resta nella cartella per eventuali collaudi futuri.

⚠️ **In sospeso, un passaggio manuale**: `edge-function-cosa-cucino.ts` va **reincollato
su Supabase** (Edge Functions → cosa-cucino → Deploy) — la seconda volta il 13/08,
per la correzione di `max_tokens`. Collaudo del Blocco 2: `COLLAUDO-V5-BLOCCO2.md`.

**Blocco 2 collaudato su giorni veri il 13/08** (settimana 16-22/08): la **coerenza di
magazzino ha retto**, nessun ingrediente fantasma. Ma **un blocco intero (20 e 21) è
sparito**, e il ripiego automatico non l'ha coperto — vedi qui sotto.

### ⚠️ Il secondo bug del 13/08: il ripiego guardava il motivo, non il risultato

Il ripiego era agganciato al solo `troncato`. Quel blocco però non era stato troncato:
era tornato dicendo di aver finito **senza aver scritto quei pasti** (saltati, o con
date che non corrispondevano a quelle chieste e quindi scartati dal client). `troncato`
era falso, il ripiego non è partito, e `righeDaSalvare()` ha semplicemente saltato quei
pasti — niente riga in `plan_meals`, quattro pasti spariti dal calendario.

**La regola che ne esce, e vale ovunque**: non chiedersi **perché** manca qualcosa,
chiedersi **se** manca. Ora dopo ogni blocco gira `completaMancanti()`, che confronta i
pasti chiesti con quelli arrivati e rifà i mancanti un giorno alla volta, qualunque sia
stata la causa. Quando non manca niente non costa nulla. Si prova **una volta sola**:
un buco dichiarato è meglio di una rincorsa infinita.
I pasti scartati perché non erano stati chiesti finiscono in `console.warn`.

### La v5 — la verifica del giorno (13/08/2026, Blocco 3)

In cima alla tab Piano, sopra la striscia: **«Ieri hai mangiato questo?»**, con i pasti
previsti e tre risposte per pasto — **sì · no, altro · saltato** — più la correzione di
**chi c'era davvero**.

- **Un pasto è verificato quando nel diario c'è la sua riga** (`giaNelDiario`). Lo stato
  sta nel database, non nel telefono: chi risponde per primo evita all'altro di scalare
  la dispensa una seconda volta. Per questo anche **«saltato» scrive nel diario**.
- Si guarda indietro **al massimo tre giorni**, e c'è un **«Più tardi»** che rinvia a
  domani (`localStorage`, chiave `piano-verifica-rinviata`). Oltre i tre giorni non è
  più una verifica, è un debito da riscuotere: e i giorni saltati non sono colpe.
- **Il «sì» non ha un pannello suo**: riusa quello di «Ho cucinato questo».
  `apriCucinato` ha ora un quarto argomento `opz` — `quando` (quale riga di diario
  scrivere: la verifica registra *ieri*, non oggi), `titolo`, `conRicetta`, `dopo` —
  e `registraPasto(p, quando)` con lo stesso scopo. Senza `opz` tutto si comporta
  esattamente come prima: la tab Cucino non è stata toccata.
- **`conRicetta:false` nella verifica**: confermare di aver mangiato quel che era
  previsto non vuol dire mettere il cuore a quel piatto. Altrimenti i ♥ si riempirebbero
  da soli e non vorrebbero più dire niente.
- **«No, altro»** registra nel diario e **non tocca la dispensa** — non si sa con che
  cosa sia stato fatto — e lo dice.
- ⚠️ **Due vocabolari per `chi`**: `plan_meals.chi` usa i nomi veri, `meals_log.chi` usa
  le voci relative a chi usa l'app (`io`/`io_e_x`/`solo_x`), perché così le scrive la tab
  Cucino. La traduzione sta in `chiPerDiario()` **e in nessun altro posto**. Quando si
  farà il blocco 5 della v6 (mostrare *chi* nel diario), conviene valutare se spostare
  `meals_log.chi` sui nomi veri e togliere la traduzione.

### La v5 — i numeri del giorno (13/08/2026, estensione del Blocco 3)

**Tipi di pasto.** Il diario accetta **colazione · spuntino · pranzo · cena**, in
quest'ordine anche nel menù a tendina (prima erano in ordine sparso). L'aggiunta a mano
resta com'era: testo libero, proteine e kcal **facoltative**, per tutti e due i profili.

⚠️ **La regola contro il doppio conteggio.** Le voci fisse di Ciprian — colazione
20 g · 290 kcal e yogurt 17 g · 100 kcal — sono date per scontate ogni giorno. Se però
per quel giorno **una colazione o uno spuntino vero finisce nel diario**, la voce data
per scontata viene **SOSTITUITA, mai sommata**: altrimenti la colazione varrebbe
doppio. Sta tutto in `fisseDelGiorno()`, e `notaFisse()` scrive sotto il totale quale
delle due si sta usando («colazione dal diario (25 g · 310 kcal)» oppure «colazione di
sempre (20 g · 290 kcal)»). Un numero non deve mai arrivare dal nulla.
Se la registrazione vera è senza numeri, entra come 0 e **il totale si dichiara
parziale**: non si inventa niente.

**«Finora oggi».** Nel giorno di oggi del calendario e in cima al giorno di oggi nel
diario: `finora oggi X g · Y kcal`, cioè quanto è stato messo insieme **davvero**
(voci fisse sostituite + tutto il resto del diario di quel giorno), non quanto era
previsto. Fondo lavanda per non confonderlo col totale del piano, che è menta.

⚠️ **Non è più legato a una persona: è legato all'obiettivo.** La riga compare per i
profili con `prot_target` o `kcal_target` compilati (`haObiettivo()`), chiunque siano.
Per chi non ha obiettivi non compare nessun numero, qui come ovunque. Se un giorno
Lorena vorrà contare, le basterà compilare l'obiettivo nel suo profilo.
Le **voci fisse restano di Ciprian** (`fisseDi()`): sono la sua colazione e il suo
yogurt, un altro profilo non le eredita — sarebbero numeri arrivati dal nulla.

⚠️ **Limite noto**: «finora oggi» somma tutte le righe di diario del giorno senza
distinguere chi ha mangiato, perché `meals_log.chi` è relativo a chi sta usando l'app
(vedi `chiPerDiario()`) e da un altro telefono vuol dire l'opposto. Finché conta una
persona sola va bene; se anche Lorena si desse un obiettivo, andrebbe prima spostato
`meals_log.chi` sui nomi veri.

#### ⛔ Fuori per scelta, deciso il 13/08/2026 — non riproporlo

**Database alimenti · codici a barre · streak.** I numeri restano **dichiarati o
stimati**. La precisione, quando servirà, arriverà dai campi facoltativi `kcal_100g` e
`prot_100g` sulle voci di dispensa (punto C del blocco «dopo i Blocchi 3 e 4»), non da
un archivio esterno né da uno scanner.

### Scorrere fra i giorni (13/08/2026)

Si cambia giorno **strisciando col pollice** sulla scheda (verso sinistra = avanti,
come si sfoglia) e con le **frecce ← →** sul computer. Il gesto si ascolta solo sulla
scheda: sulla striscia dei giorni e dentro la verifica no, perché lì darebbe fastidio.
Serve un movimento di almeno 55 px e chiaramente orizzontale (1,6 volte quello
verticale), altrimenti si rovinerebbe lo scorrimento normale della pagina.
Ai due estremi della striscia non si va oltre. Il giorno nuovo entra dal lato da cui
arriva (`.entra-da-destra` / `.entra-da-sinistra`, 200 ms).

Per il resto tutti i file SQL sono stati eseguiti, e la Edge Function online è quella
col campo «che voglia hai?».

#### ⛔ Decisioni chiuse — non riaprirle

- **Database alimenti, codici a barre, streak: fuori.** Deciso il 13/08/2026.
  I numeri sono dichiarati o stimati; la precisione arriverà dai campi `kcal_100g` e
  `prot_100g` sulle voci di dispensa.
- **Mascotte: cancellata.** Provata (un pancake) e scartata. Gli stati vuoti e
  l'attesa usano **oggetti**, mai personaggi. Non riproporla.
- **Icona: la B, il barattolo.** Definitiva. È già nel repo, non va rigenerata.
- **Stile: la passata ricca è approvata** nella versione attualmente online.

#### ▶️ PROSSIMO PASSO — ⛔ il brief dice di FERMARSI QUI

Brief: `PROMPT-V5-PIANO.md`. I blocchi 1, 2 e 3 sono scritti: **«FERMATI QUI. Collaudo
insieme, poi si decide se proseguire.»** Non cominciare il Blocco 4 senza che l'utente
lo chieda: prima si collauda la verifica del giorno su giorni veri.

Quando si riparte, il Blocco 4 è **la rigenerazione della coda** — più la **modifica a
mano**, che l'utente ha chiesto tre volte e va fatta per prima (memo qui sopra).

`plan_days` resta dov'è, vuota e inutilizzata: non si cancella mentre se ne introduce
un'altra. Il frontend non la legge più.

#### 📌 Da fare col Blocco 4 — modifica a mano di un pasto (chiesto il 13/08/2026)

Chiesto **tre volte** il 13/08/2026: è la cosa che l'utente vuole di più dopo i
blocchi del brief. **Due modi di arrivarci, tutti e due richiesti:**

- **toccando un pasto** di oggi o futuro si sceglie **«Modifica a mano»**;
- e un **tasto «Modifica» visibile su ogni giorno**, che non si debba cercare.

Serve a riempire i buchi che il generatore lascia e a scrivere un piatto deciso da sé.
Si scrive il piatto (nome, chi mangia, ingredienti facoltativi; proteine e kcal
facoltative), **senza passare dal generatore**. Vale per i pasti di **oggi o futuri**;
sui giorni passati no, quelli mostrano il diario.
Tre regole:

- **proteine/kcal vuote su un pasto di Ciprian** → il totale del giorno si dichiara
  **parziale**, non si inventano numeri (`totaleGiorno()` ha già `senzaNumeri`: è lì
  che va agganciato);
- una modifica a mano **può rompere i giorni dopo**: vale lo stesso controllo della
  rigenerazione del Blocco 4 — se le bozze successive contavano su ingredienti che il
  piatto scritto a mano consuma, **avvisa e proponi di rigenerare la coda**;
- un pasto scritto a mano è **`confermato`, mai bozza**, e **non si rigenera senza
  chiedere**. Vale anche per la rigenerazione automatica: va saltato di default.

#### 📌 Da fare col Blocco 4 — la passata non sa dire «questi giorni lasciali stare»

Trovato collaudando il Blocco 2 il 13/08/2026. La passata fa **sempre sette giorni** e
i modi sono solo tre (A casa / Fuori / Libero): **non c'è modo di segnare un giorno
come "non ancora deciso"**. Chi vuole pianificare solo da qui a domenica è costretto a
mettere Fuori o Libero sui giorni che non gli interessano, cioè a scrivere nel
calendario una cosa falsa.

Serve un quarto stato («non ancora») che **non produce nessuna riga** in `plan_meals`,
oppure la scelta di quanti giorni fare. Il primo è meglio: tiene la griglia sempre di
sette giorni, e `righeDaSalvare()` salta quei pasti come già fa quando il generatore
non scrive niente.

#### 📌 Da fare DOPO i Blocchi 3 e 4 (chiesto il 13/08/2026)

**A · Ripulire il menu.** Via **«Copia per Claude»**: serviva quando l'inventario si
portava a mano in chat, ma ormai vive nel database e la Edge Function se lo rilegge da
sola. Resta il **copia-riepilogo del Diario**, che serve ancora. Al suo posto nel menu
entrano la voce **Costi** (punto B) e un **export completo dei dati** come backup —
scaricabile, non da incollare.

**B · I costi dentro l'app.** La Edge Function registra i **token di ogni chiamata**
nella tabella del tetto (`generator_usage`, che oggi ha solo `day` e `count`: servono
due colonne in più), e il menu mostra la **stima di spesa del mese**.
⚠️ Va scritto **stima**, e va detto che il conto vero sta nella Console di Anthropic:
i prezzi cambiano e il conteggio dei token lato nostro non include tutto.
⚠️ **Da fare al prossimo intervento sulla function, non con un deploy dedicato**: ogni
deploy è un passaggio manuale sul pannello Supabase e vanno raggruppati.

**C · Più precisione sui numeri, senza database alimenti.** Sulle voci di dispensa due
campi **facoltativi**: `kcal_100g` e `prot_100g`. Il generatore li usa quando ci sono,
altrimenti stima come fa adesso **e lo dichiara**.
Non contraddice la regola «niente database alimenti» qui sotto: non si importa nessun
archivio, non c'è nessuno scanner di codici a barre, e i campi restano vuoti finché
non li scrive l'utente sulle voci che le interessano.

#### Rimasto indietro, minore

- v6 blocco 5: il diario non mostra ancora **chi** ha mangiato (il campo `chi` in
  `meals_log` esiste già).
- La texture di sfondo facoltativa della v7: non fatta. Il brief stesso dice che al
  primo dubbio si lascia perdere.

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

La strada normale è ora **«Genera la settimana» dentro l'app** (v5 Blocco 2): la
domenica si fa la passata dei sette giorni e si genera. Non serve più passare da qui.

Il comando `/piano-settimana` (vedi `.claude/commands/piano-settimana.md`) resta come
**ripiego**, per quando un piano arriva scritto in chat: parsing del testo incollato →
riepilogo → conferma → file SQL di `upsert` in `plan_meals`, una riga per pasto.
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
| `tabelle-piano-v5.sql` | la tabella `plan_meals` del calendario, coi campi commentati |
| `prova-piano-v5.sql` | una settimana finta per collaudare il calendario a mano |
| `COLLAUDO-V5.md` | la checklist di collaudo del calendario. Come tutti i `COLLAUDO-*`, resta **solo sul computer**: è in `.gitignore` |
| `seed-dati-iniziali.sql` | inventario e ricette di partenza (11/08) |
| `README-OPERATIVO.md` | la routine per l'utente |
| `DATI-INIZIALI.txt` | fotografia di partenza |
| `PROMPT-CLAUDE-CODE.md` | il brief originale |

## Cosa NON fare

- Non cambiare URL pubblico, nome del repo o branch di Pages.
- Non introdurre framework, bundler, TypeScript o dipendenze da installare.
- Non toccare né chiedere la chiave segreta.
- Non cancellare dati senza mostrare prima cosa verrà cancellato.
