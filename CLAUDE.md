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

## ⛔ TRE LIVELLI DI VERIFICA, E NON SI CONFONDONO (20/08/2026)

Dire «collaudato» senza dire **come** è la cosa che ha fatto perdere più tempo in questo
progetto. Ci sono tre livelli, e solo l'ultimo è un collaudo vero:

| | che cosa dimostra | chi può farlo |
|---|---|---|
| **letto** | quello che il codice o il database dicono | Claude |
| **misurato** | che la logica gira e che il disegno viene come previsto — DOM, geometria, valori | Claude |
| **provato col tocco** | che un dito, su quel telefono, arriva a quel bersaglio | **solo l'utente** |

⚠️ **`elemento.click()` da JavaScript NON è un tocco.** Fa partire il gestore e prova che
la logica funziona, ma **salta completamente la parte in cui il browser decide chi hai
colpito** — ed è esattamente lì che sono nati gli ultimi tre bersagli morti. Un bottone
può rispondere benissimo a `click()` ed essere irraggiungibile con un dito, perché ci sta
sopra qualcos'altro, perché sborda dalla sua riga, o perché è largo tre millimetri.

⚠️ **E i clic dello strumento `computer` di claude-in-chrome, in questo ambiente, NON
ARRIVANO ALLA PAGINA.** Provato il 20/08/2026 su un bersaglio impossibile da sbagliare (la
tab «Dispensa»): **zero eventi registrati**. Quindi nemmeno quello è un tocco, e una prova
costruita su quei clic **non vale niente** — è già successo di annunciarne una.

⚠️ **Come si scrive, quindi**: «verificato per lettura», «verificato per misura», oppure
«da provare col tocco». Mai «collaudato» da solo. E quello che tocca all'utente si dichiara
come tale invece di lasciarlo credere fatto.

## ⛔ COLLAUDARE COL BROWSER SUI DATI VERI (regola dell'utente, 20/08/2026)

Con `claude-in-chrome` si può aprire l'app vera e premerne i bottoni: è il modo più
onesto di verificare una correzione, e va usato. Ma **il database dietro quell'app è
quello vero e non esiste una copia di prova**: la dispensa, il piano e la spesa sono le
cose di casa, e sono in uso mentre lavori — l'utente sta spesso guardando l'app dal
telefono nello stesso momento.

Quindi, per ogni collaudo col browser:

1. **O non si salva.** Aprire pannelli, leggere il DOM, scrivere nei campi e chiudere con
   «Annulla» non tocca niente: è il modo normale di provare. ⚠️ Non premere mai i bottoni
   che scrivono — «Salva questo pasto», «+ Aggiungi», «Usa questo», «Conferma», i tasti
   che appaiano nomi o marcano contorni liberi — a meno che il collaudo sia esattamente
   quello e non ci sia altro modo.
2. **Oppure si ripristina subito e SI DICE COSA È STATO TOCCATO**, voce per voce e con i
   valori di prima. Non «ho fatto qualche prova»: il nome della riga, il campo, il valore
   vecchio e quello nuovo.
3. **Le scritture volute** (una migrazione, un import) restano un'altra cosa: si chiedono
   prima, si eseguono e si riportano — ma non si mescolano mai a un collaudo.

⚠️ **E si verifica leggendo, non ricordando**: dire «non ho salvato niente» perché ci si
ricorda di aver premuto Annulla non basta. Si rilegge la riga dal database e si confronta
col valore di prima. Un `updated_at` recente non è una prova di colpa (l'utente sta usando
l'app), ma va guardato e spiegato invece che ignorato.

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
I divieti non si negoziano. A pasto condiviso vale la regola del **piatto unico** qui
sotto. La regola della varietà è **per persona** (campo `ripetizione`).

#### ⚠️ Quando mangiano insieme si cucina UN PIATTO SOLO (16/08/2026)

Trovato su un piano vero: una domenica sera il generatore ha dato **hamburger e
patatine a Ciprian e gnocchi a Lorena**. Era permesso — la vecchia regola diceva che
«la fonte proteica può essere diversa fra i due» — e il modello l'ha usata per arrivare
ai 170 g. La licenza è stata **ristretta, non tolta**.

Nei pasti «Entrambi» c'è **un solo piatto base per tutti e due**. Le sole differenze
ammesse sono varianti dello stesso piatto:

- **grammature diverse** (abbondante per Ciprian, normale per Lorena);
- un'**aggiunta proteica a lato** per Ciprian quando il piatto base non basta al suo
  target — uova, skyr, grana, tonno — scritta negli ingredienti con `per: "ciprian"`;
- il **tocco dolce** di Lorena, che ha già il campo `dolce` suo.

Se il piatto condiviso è povero di proteine, il target di Ciprian si recupera con
l'aggiunta a lato o **sugli altri pasti della giornata**, mai cambiandogli il piatto.

**Due piatti davvero diversi: una sola ragione**, cioè un divieto di Lorena che rende
quel piatto impossibile per lei e senza una variante semplice. In quel caso il campo
`perche` **deve** dire il motivo: si vede già accanto al pasto (`.nota.perche`), e
serve a poter vedere il perché invece di subirlo.

Nei pasti condivisi comanda il profilo più esigente sulla varietà: le ripetizioni di
Ciprian vivono nei **suoi pasti da solo** (la catena cena → pranzo del giorno dopo),
che restano come sono. I pasti liberi restano liberi: non si genera niente, per nessuno.

Sta nel prompt della Edge Function, in **tutti e due i mestieri**: `REGOLE_SETTIMANA`
(sezione «2 bis») e `REGOLE` (il caso «Tutti e due insieme»). **Se il metodo cambia, si
cambia lì**, non nel frontend.

**Blocco 3 — streaming.** La function chiama Anthropic con `stream: true` e riconosce
ogni proposta dentro il JSON mentre si scrive (`creaLettore()`: conta le graffe tenendo
conto di stringhe ed escape), spedendola come **NDJSON** — una riga JSON per messaggio.
Resta **una sola chiamata al modello**: conta come una generazione sola rispetto al
tetto, e il modello vede le tre proposte insieme, che serve a garantire che almeno una
sia fattibile e che siano diverse. Il client ha un ripiego per la function vecchia
(blocco unico `{proposte:[…]}`) e per i browser senza streaming.

⚠️ **Non passare a tre chiamate parallele** per andare più veloce: si perderebbero
proprio le garanzie fra proposte, e il costo triplicherebbe l'input.

### Due regole del metodo, chieste il 16/08/2026

Stanno nel prompt della Edge Function, che è il posto dove il metodo vive.

#### ⚠️ Il pomodoro: il divieto è SOLO sul crudo — non evitarlo per prudenza

Il divieto di Lorena è **«pomodoro crudo»**, e il generatore lo trattava come se fosse
«pomodoro»: lo evitava dappertutto. È un errore, non una cautela — in dispensa c'era un
cuore di bue fermo a dimostrarlo.

⚠️ **La famiglia però resta intera**: pomodoro, pomodorini, datterini, ciliegini,
pachino, cuore di bue, passata, pelati. Il divieto si restringe sulla **forma**, non
sulla famiglia — cambiare nome non è una scappatoia, e i datterini crudi in insalata
sono pomodoro crudo tanto quanto una fetta di cuore di bue.

| Forma | Con Lorena a tavola | Nei pasti di solo Ciprian |
|---|---|---|
| **cotta** — sugo, al forno, in umido, datterini saltati, confit. Passata e pelati sono cotti per natura | **sì**, liberamente e senza limiti | sì |
| **cruda** — insalate, bruschette, fette a crudo, panzanella, pomodorini a spicchi | **no**, per tutta la famiglia: o si cuoce o si toglie | **sì**, senza spiegazioni |

Quando il pomodoro cotto entra in un pasto con Lorena, il piatto o gli ingredienti
**devono dirlo** («datterini saltati in padella», non «datterini»): chi legge deve
vedere che è nella forma consentita.

⚠️ **La regola generale che ne esce**: un divieto **senza** precisazioni vieta tutta la
famiglia dell'alimento in ogni forma; un divieto **con** una precisazione vieta tutta la
famiglia **in quella forma lì**. Vale per ogni divieto futuro, non solo per il pomodoro.

#### I pranzi di Ciprian da solo: ha un'ora di pausa

In quest'ordine, ed è la regola 5 bis del prompt:

1. **l'avanzo della cena precedente, da scaldare e basta** — è la via maestra, ed è il
   motivo per cui esiste la catena delle doppie porzioni;
2. se un avanzo non c'è, un piatto pronto in **15 minuti veri**, pochi passaggi;
3. **mai** cotture lunghe, forno, brasati o più pentole a pranzo.

⚠️ **Il target proteico non si sconta per fretta: si risolve a monte.** Le cene di
Ciprian devono nascere già con la porzione proteica giusta **anche per il pranzo del
giorno dopo**, così l'avanzo arriva completo. È l'altra metà dello sguardo in avanti.

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

### La grafica completata (18/08/2026) — l'inventario e i buchi chiusi

Fatto l'inventario chiesto da `PROMPT-FIX-E-GRAFICA.md`: **il v7 c'era quasi tutto**,
schermate v5 comprese (calendario, passata e verifica usano già i token). Quello che
mancava, e che è stato chiuso:

**I token, che coprivano solo metà delle cose.** Nel corpo del CSS c'erano **41 colori
scritti a mano**: sette sfumature (due coppie copiaincollate identiche), `#fff` nove
volte, il verde-testo `#1F6B4F` cinque volte, il velo del menu, tre ombre. Ora esistono
`--menta-ink` (il gemello mancante di `--pesca-ink`), `--su-pieno`, `--corallo-chiaro`,
`--segno`, `--velo`, `--luce`, le ombre `--ombra-pillola/-nav/-btn`, le nove
`--grad-*` e le due `--font-*`. **Nel corpo del CSS oggi ci sono zero colori a mano**:
è il modo per accorgersene se ne rientra uno.

⚠️ **L'eccezione che resta**: i colori dentro i `data-URI` SVG (lo scarabocchio, le
stelline, la freccia del menù a tendina, il bordo della testata). Un data-URI **non
legge le variabili CSS**: `--segno` esiste ed è la verità, ma il valore va cambiato
anche a mano lì dentro. Dove capita c'è l'avvertenza sul posto.

**Le emoji al posto delle icone.** `✎` era scritto tre volte **mentre `i-matita`
esisteva già**, `❄` due volte con `i-freezer` già disegnata, e `🍱` era l'unica emoji a
colori dell'app. Un'emoji la disegna il sistema: cambia forma fra iPhone e computer e
non prende il colore che le si dà. Ora ci sono sei icone in più (`i-rigenera`, `i-ok`,
`i-chiudi`, `i-piu`, `i-cuore`, `i-avanzo`) e **una funzione sola, `ico(nome, misura)`**:
se serve un simbolo si passa da lì. Il tratto di **tutte** le icone è ora dichiarato
1.8 sul `<g>` (erano 1.8 solo per le tab e solo grazie al CSS della nav, 1.9 per
quattro, 2 per il menu).

**Gli stati vuoti**: erano 3 illustrati su 14, e **Cucino non ne aveva proprio uno** —
si apriva la tab e sotto il modulo c'era il nulla. Ora Dispensa e Ricette hanno
`ill-dispensa` e `ill-ricette` (stesso stile delle tre approvate) e Cucino ha il suo,
con la pentola ferma: ⚠️ `.vuoto-ill .vapore path{animation:none}` — la stessa pentola
serve all'attesa, ma in uno stato vuoto non sta bollendo niente.

**I doppioni tolti**: un solo bottone-testo (`.btn-testo`, era scritto a mano tre
volte), una sola forma per le quattro etichettine maiuscole, il promemoria freezer
disegnato in un modo solo (era `.row freezer` in un punto e `.nota freezer` in un
altro, nella stessa scheda).

⚠️ **`.ps-avviso` è diventato `.avviso` con due toni, e non sono intercambiabili**:
`.attenzione` (pesca) = qualcosa non torna e tocca a te; `.info` (lavanda) = ti sto
raccontando cosa succede. Prima era uno solo, color allarme, e finiva addosso anche a
«sto scrivendo la settimana»: a furia di vedere l'ambra per cose normali non la si
guarda più quando serve davvero.

⚠️ **I tre bottoni della verifica** (Sì · No, altro · Saltato) stavano dentro `.chips`,
cioè il componente con cui si **sceglie** fra opzioni, e servivano tre eccezioni CSS
per farli sembrare altro. Sono **azioni**: ora sono bottoni veri, col «Sì» primario.

**Gli elementi che il browser lasciava nudi**: la freccia del menù a tendina era due
triangolini fatti con due sfumature incrociate — ora è una freccia del set, tratto 1.8.
Le frecce su/giù dei campi numero sono via. ⚠️ **L'icona del calendario resta** (si
tinge soltanto): toglierla renderebbe le date impossibili da inserire su iPhone.

#### La firma: la testata — ⛔ secondo tentativo, in attesa del giudizio

`PROMPT-FIX-E-GRAFICA.md` chiede **una cosa sola fatta benissimo**, a scelta fra le
illustrazioni degli stati vuoti e il trattamento della testata. Scelta la **testata**:
è l'unica cosa che si vede da ogni schermata, le illustrazioni esistevano già ed erano
approvate, e `.arco-testata` era **codice morto** — il trattamento della testata era
stato disegnato e mai attaccato.

**Il primo tentativo (18/08, commit `d54d948`) è stato bocciato.** Il giudizio, testuale:
«la pulizia si sente ed è promossa; la firma no». Tre motivi, e vanno ricordati perché
sono la lezione, non l'episodio:

1. il barattolo era **38px dentro una piastrellina**: «se lo devo cercare, non firma»;
2. l'onda era **2.6px pallidi a larghezza intera**: a quello spessore qualunque onda
   «si legge come un bordo qualsiasi»;
3. il fondo della testata era la sfumatura lavanda-pesca, cioè **il gradiente da
   template che il brief stesso vieta**, e per giunta generato invece che disegnato.

⚠️ **La regola che ne esce, e vale per ogni firma futura**: una firma timida non è una
firma prudente, è una firma che non c'è. Se una cosa deve essere riconoscibile, o ha
peso o non vale il posto che occupa.

**Il secondo tentativo** parte da un'idea sola: la testata **non è una barra sopra
l'app, è l'etichetta del barattolo**. Aprire l'app deve somigliare ad aprire l'icona.

1. **Un colore solo, quello dell'icona.** La testata è `--lavanda-soft` piatto — lo
   stesso quadrato lavanda su cui sta il barattolo di `apple-touch-icon.png`. Il token
   `--grad-testata` è stato **cancellato**: ⛔ non rimetterlo.
2. **Il barattolo a 54px e senza riquadro**, col `viewBox` stretto sul disegno: il
   riquadro è tutta la testata, tenerne un altro dentro lo rimpicciolirebbe di nuovo.
   E regge **due righe** (titolo e pillola), non sta di fianco a una.
   ⚠️ Se cambia `favicon.svg`, cambia anche `#i-marchio`: il senso è che siano la
   stessa cosa.
3. **L'onda con un tratto vero**: 4.6px di `--viola` pieno, passo tre volte più largo,
   su fondo colorato. È lo stesso gesto dello scarabocchio sotto i titoletti di sezione
   (`.q-label::after`, che resta com'è): l'app parla in grande la calligrafia che usa
   già in piccolo.
4. **Gli obiettivi in una pillola**, promossa al primo giro: non era più una riga di
   testo grigia che non sembrava toccabile.

⚠️ **Tre conseguenze da non disfare:**
- pillola e tasto del menu sono passati a fondo **bianco**: su una testata lavanda un
  oggetto lavanda sparisce;
- `.h-title em` usa `--viola-testo`, **non** `--viola`: il viola pieno su
  `--lavanda-soft` dà 4.43, sotto la AA (sta scritto nei token);
- `<meta name="theme-color">` è lavanda come la testata: se resta bianco, su iPhone la
  barra di stato taglia in due la testata invece di continuarla.

⛔ Il vecchio `.arco-testata` resta **cancellato**: era un'onda *piena* color superficie,
e il fondo dell'app è sfumato — avrebbe lasciato una macchia. L'onda nuova è un **segno**.

#### Le quantità: lo spazio prima dell'unità si mette solo per mostrarle

Trovato il 18/08/2026: in dispensa convivono «300 g» e «500g». **È il dato**, non un
difetto di visualizzazione — `scriviQta()` mette lo spazio, ma gira **solo** quando
l'app ricalcola una quantità dopo «Ho cucinato questo»; tutto il resto (scritto a mano,
scritto dal generatore) finisce nel database così com'è.

`mostraQta()` mette lo spazio **solo in lettura**, e il dato resta quello che è:
riscriverlo vorrebbe dire toccare la dispensa di nascosto. ⚠️ Prudenza come dappertutto:
tocca solo un numero attaccato a un'unità conosciuta (`g kg mg l ml cl dl`), e lascia
intatti «2×100 g», «1,5», «? da verificare», «scad. 29/8».
⚠️ **Mai dentro un campo da compilare**: quello che si salva dev'essere quello che si
è scritto. `apriEditorQty()` e il pannello di «Ho cucinato questo» mostrano il grezzo.

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
2. **La generazione.** **Un giorno per chiamata**, sette chiamate (dal 16/08/2026: prima
   erano quattro blocchi da due giorni — vedi «Il tetto vero di Supabase»). Ogni
   chiamata usa `modo:'settimana'` e riceve `gia_pianificato` (i pasti già decisi,
   ingredienti e `avanzo_per` compresi), `resta_prima` (cosa resta in dispensa secondo
   la chiamata precedente) e `settimana` (**la passata intera**, anche i giorni non
   suoi). I primi due tengono in piedi la **coerenza di magazzino**; il terzo tiene in
   piedi la **catena degli avanzi**. Fuori e liberi non si generano.
3. **Il riepilogo.** Mostra le righe **esatte** che finiranno in `plan_meals`
   (`righeDaSalvare()`), i totali di Ciprian giorno per giorno riusando
   `totaleGiorno()`, cosa manca e cosa resta. Solo qui si scrive nel database.

Salvataggio: `delete` dei giorni della passata + `insert` delle righe nuove. I mancanti
finiscono nella lista della spesa esistente (`aggiungiAllaSpesa(nomi, silenzioso)`) e i
pasti che li aspettano hanno `dipende_da_spesa = true`. Il campo data ha `min = oggi`:
**il passato non si riscrive mai.**

⚠️ **Il tetto: una settimana costa 7 tacche, non 1** (erano 4 fino al 16/08/2026). Il
brief chiedeva che contasse come una sola generazione, ma le chiamate al modello sono
sette vere: contarne una lascerebbe le altre senza freno, e il freno è l'unica cosa fra
l'indirizzo pubblico e la carta di credito. Con 30/giorno restano **4 settimane al
giorno** e **il tetto di spesa non si muove** (~60 centesimi al giorno nel caso
peggiore). Sulla prima chiamata la
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
   avanzo a pranzo domani». ⚠️ **Superato il 16/08/2026**: adesso è **un giorno per
   chiamata** — vedi «Il tetto vero di Supabase» più sotto.
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
settimanale) — e dal 18/08 anche dal terzo, `modo:'ricetta'`. ✅ Il deploy è in pari.
Lato client vale lo stesso: `flussoNdjson()` è condivisa, `chiamaGeneratore()` ci sta
sopra e «Crea la ricetta» ci sta sopra a sua volta.

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

### L'avviso delle scorte, riscritto per TIPO DI PROBLEMA (20/08/2026)

Era un elenco piatto di quattordici righe uguali, ognuna con la sua frase ripetuta: si
leggeva come una tabella di database. ⚠️ **Il problema non era la quantità di
informazione, era che non aveva forma** — per capire di che natura fossero quei guai
bisognava leggerli tutti.

⚠️ **È TUTTO TESTO CALCOLATO: zero generazioni.** Un riassunto scritto dal modello
costerebbe una tacca ogni volta che l'avviso si ridisegna — cioè a ogni tocco — e direbbe
cose che l'app sa già contare da sé.

- **una riga di sintesi**: «3 da comprare · 5 ce le hai già · 2 ne hai poche». I gruppi
  vuoti non si nominano: «0 da comprare» è rumore;
- **tre gruppi**: *Da comprare* (non ce l'hai e non hai niente di simile) · *Ce l'hai,
  scritto diverso* (c'è un candidato o una voce simile) · *Ne hai poche* (c'è ma non
  basta). ⚠️ **La frase la dice il TITOLO del gruppo, non ogni riga**: è tutta la
  differenza fra un avviso e una tabella;
- **la conseguenza su ogni voce**: non «Provolone» ma «Provolone — lunedì 24/08 · Torta
  salata». È l'informazione per cui questo avviso si apre davvero;
- **ordine per data** del pasto che si ferma per primo: quello che ti blocca lunedì viene
  prima di quello che ti blocca venerdì, e l'alfabeto non dice niente su cosa fare stasera.

⚠️ **Quattro per gruppo e non sei in tutto**: con un tetto unico un gruppo lungo si mangia
gli altri, e spariscono proprio i tipi di problema che la sintesi ha appena annunciato.

⚠️ **«Te la indico io» sta su TUTTI i mancanti, anche in «Da comprare»** — corretto subito
dopo il raggruppamento. Quel gruppo contiene proprio i casi che l'app non sa riconoscere
(«Patatine fatte in friggitrice ad aria» ci finisce perché NON vede la somiglianza con
«Patate da friggere»): toglierlo di lì vorrebbe dire nasconderlo dove serve di più, e
lasciare come unica uscita la rinuncia.

### ⚠️ «Non seguire più» è SEMPRE stato per il nome, mai per il pasto (20/08/2026)

Domanda dell'utente, verificata leggendo il codice: `contorni_liberi` è **una chiave sola**
e `contornoLibero(nome)` è interrogata in tre punti — il controllo scorte, la lista della
spesa, i mancanti di «Crea la ricetta» — e **in nessuno c'è traccia del pasto**.

⚠️ **Non è che due cose si siano fuse: una delle due non è mai esistita.** Il difetto era
il NOME: «contorno libero» prometteva uno scopo (*questo piatto*) che il codice non ha mai
avuto, e chi leggeva lo capiva così — giustamente. Rinominarlo «non seguire più questo
ingrediente» è ciò che ha fatto combaciare le parole col comportamento.
⚠️ **Regola che ne esce**: quando un'etichetta descrive uno scopo, quello scopo dev'essere
vero nel codice. Un nome che promette più di quello che fa è un bug che non dà errori.

Una esclusione **per singolo pasto** resterebbe da costruire ex novo (vivrebbe su
`plan_meals`, non in `settings`): non è stata fatta, e non va data per esistente.

### La guardia prima di una rinuncia (20/08/2026)

Cinque «non seguo più» di fila in un colpo, e fra quelli **polenta, farro e lenticchie**:
cibo vero, non sale e brodo. Quella porta era più comoda della correzione.

Ora, se la categoria dell'ingrediente ha un **minimo settimanale** nella griglia,
`guardiaContorno()` si mette in mezzo: *«Lenticchie è legumi, e la griglia ne chiede almeno
2 a settimana. Da qui in poi non ti dirò più quando manca, nemmeno per arrivare a quel
minimo.»* E rimanda a «te la indico io», che per polenta e farro era la risposta giusta.

⚠️ **Solo i minimi, non i massimi**: rinunciare all'avviso su una cosa di cui bisogna
mangiare *almeno* tot fa saltare un obiettivo; su un massimo, al più non si dice che ce n'è
troppa — guaio più piccolo e di segno opposto.
⚠️ **«Lascia stare» è il bottone PIENO**: il primo tocco che capita dev'essere quello che
non rompe niente.
⚠️ **Il silenzio di un avviso che non arriva più è la cosa più difficile da vedere che
esista**: per questo si dice prima, non si scopre dopo.

### Giro 3 — gli attriti d'uso (20/08/2026)

⚠️ **Nessun file SQL, nessun deploy**: tutto frontend.

**1 · Il contenuto dietro la striscia dei giorni.** La causa non era la posizione: la
striscia è una **pillola con i margini**, e il contenuto le passava dietro **riapparendo
negli spazi ai lati** — da cui «Pasta sfoglia» mozzato. Ora c'è una fascia opaca larga
quanto lo schermo (`.settimana::before`), e tutto ciò a cui si salta ha
**`scroll-margin-top`**: il browser si ferma più in basso da solo, ovunque, senza conti da
rifare in dieci punti del JavaScript.
⚠️ `misuraTestata()` misura anche la striscia (`--striscia-alt`) **ma quel valore non entra
in nessuna posizione appiccicosa**: Dispensa e Piano restano dove sono sempre stati.

**2 · Il campo del nome che tagliava.** Era un `input` stretto: «Patatine fatte in
friggitrice o…», cioè modificavi una cosa che non riuscivi a leggere. Ora è un `textarea`
di una riga che **va a capo e cresce** (`aggiustaAltezza()`), con una **×** dentro che
compare solo quando c'è testo. Invio non va a capo: un nome su due righe non combacerebbe
con niente.
⚠️ **Il cursore non si forza a fine parola**, ed è la scelta che il brief lasciava aperta:
forzarlo romperebbe proprio il caso da salvare — toccare in mezzo per correggere una
lettera. La × copre il bisogno vero.

**3 · La dispensa da 66 voci.** Filtri per categoria col conteggio, e ricerca che usa
`stessoNome()` — «uova» trova «Uovo» — **più** il vecchio «contiene», perché scrivendo
«moz» si vuole arrivare a Mozzarella e `stessoNome()` non risponde a un pezzo di parola.
⚠️ Compaiono **solo le categorie che hanno qualcosa dentro**: un filtro che dà zero
risultati è un modo di perdere tempo. ⚠️ Il filtro **non sta in localStorage**: è una cosa
che si fa adesso per trovare una voce, non un'impostazione — ritrovarla accesa domani
vorrebbe dire aprire la dispensa mezza vuota senza capire perché.

**4 · Tornare dove ero.** `restaDovEri()` attorno a ogni ridisegno che parte da un'azione.
⚠️ Il ripristino va **dopo** il ridisegno: prima la pagina ha ancora l'altezza vecchia e il
browser non lascerebbe scorrere fin lì.

### ⚠️ DA PROVARE COL TOCCO — nessuno l'ha ancora fatto (20/08/2026)

Rilettura onesta di tutto quello che è stato dichiarato «collaudato» negli ultimi giri,
diviso per **come** è stato verificato. ⚠️ **Nessuna riga di questa tabella è stata provata
con un dito**: i clic dello strumento non arrivano alla pagina (vedi i tre livelli in cima
al file), e `elemento.click()` da JavaScript salta proprio la parte che qui conta.

**Logica verificata (per misura), bersaglio MAI provato** — la logica gira, ma che il dito
ci arrivi non lo sa nessuno:

- i sostituti nell'avviso: candidati, ordine, «ne mancano X» — i pannelli si aprono e i
  numeri sono giusti, provato facendo partire il gestore da JavaScript;
- «è una cosa che ho: te la indico io», con l'elenco della dispensa e la ricerca;
- il salto alla riga dell'ingrediente (`portaAllIngrediente`): la riga giusta si illumina;
- il pannello del pasto: numeri che si dichiarano vecchi, ricalcolo con la differenza;
- la domanda sull'unità nel modulo della dispensa (lì non c'erano clic, solo scrittura nei
  campi: la logica è certa e resta solo il bersaglio).

**MAI ESERCITATO, in nessun modo** — scritto, mai fatto girare nemmeno da JavaScript:

- ⚠️ **il toast**: si chiude con un tocco, non si muove con la tastiera, due righe, quattro
  secondi. **Niente di questo è stato provato.**
- ⚠️ **la correzione del pannello dei sostituti** (`previousElementSibling` al posto di
  `closest('.mano-riga')`): è quella del secondo bersaglio morto, scritta leggendo il
  codice. **Toccare un'alternativa lì non l'ha ancora fatto nessuno.**
- ⚠️ **«mettilo in lista spesa»** e **«non seguire più questo ingrediente»** sull'avviso.
- ⚠️ **il salvataggio** di qualunque cosa passi da questi pannelli: per rispetto della
  regola sui dati veri non è mai stato premuto un tasto che scrive.

**Verificato per misura e basta** (nessun tocco possibile): la riga dell'avviso che si
spezza in una azione per riga — dimostrata dalla geometria (tre bottoni con la stessa `y`
prima, 40 px di distanza dopo) e da una schermata.

**Verificato per lettura** (e questo regge): lo split dei latticini sul database, le colonne
SQL esistenti, `stessoNome()` che appaia «Fesa di tacchino» e «Fesa tacchino».

#### ✅ La prima prova col tocco è arrivata dai dati (20/08/2026)

Non da un collaudo: dalle **tracce dell'uso vero**. Dopo il giro dei bersagli morti, in
`settings` sono comparsi `alias_nomi: [["Patatine","Patate da friggere"]]`,
`unita_note: {"Scamorza affumicata":"g"}`, cinque nomi in `contorni_liberi`, e una riga
«Fagiolini · 300 g · serve il 26/08» nella lista della spesa.

⚠️ **Vuol dire che dall'iPhone funzionano davvero**: «te la indico io», la domanda
sull'unità, «non seguire più» e «mettilo in lista spesa». È la prova che i miei collaudi
non potevano dare — e vale più di tutti loro messi insieme.

⚠️ **Resta da provare col tocco tutto il resto**, in particolare il toast, la correzione
del pannello dei sostituti, le coppie insegnate e l'intero Giro 3.

### 🔖 DOVE SIAMO — leggere per prima cosa in una sessione nuova

**Aggiornato: 13/08/2026.**

#### ✅ Fatto e online

v4 (blocchi 1-3), v6 (blocchi 1-3), **v7 completa**, **v5 Blocco 1** (il calendario:
collaudato dall'iPhone il 13/08 — tre stati distinguibili, dolce nel suo riquadro,
numeri solo sui pasti di Ciprian, promemoria freezer sul giorno giusto),
**v5 Blocco 2** («Genera la settimana», collaudato), **v5 Blocco 3** (la verifica del
giorno) e **v5 Blocco 4** (modifica a mano, rigenerazione, «Lascia») — **questi due da
collaudare**. In più: si cambia giorno strisciando col pollice.

✅ **I file SQL fino al Blocco 5 sono tutti eseguiti** (18/08/2026), verificati uno per
uno interrogando il database. ⚠️ **Ne è rimasto indietro uno solo**: `tabelle-costi.sql`
— `tabelle-nutrienti.sql` risulta eseguito (ricontrollato il 19/08). Vedi «PROSSIMO PASSO».
`plan_meals.a_mano` · `plan_meals.ricetta_id` · `recipes.ingredienti/prot/kcal/tempo` ·
`shopping_list.serve_il` · la tabella `plan_jobs`: ci sono tutti.

⚠️ **Come verificarlo invece di chiederlo**, se un domani viene il dubbio: la chiave
publishable sta in `index.html` e le policy sono «accesso libero», quindi basta chiedere
al database se una colonna esiste, senza leggere nessun dato —
`GET /rest/v1/<tabella>?select=<colonna>&limit=0` con gli header `apikey` e
`Authorization`. Risponde 200 se la colonna c'è, 400 se manca. È più onesto che
chiedere due volte la stessa cosa a chi ha già risposto.

`tabelle-piano-v5.sql` è stato eseguito e la settimana di prova è stata rimossa;
`prova-piano-v5.sql` resta nella cartella per eventuali collaudi futuri.

✅ **Il deploy della Edge Function è in pari**: `edge-function-cosa-cucino.ts` è stato
reincollato su Supabase (Edge Functions → cosa-cucino → Deploy) **il 20/08/2026**, e la
versione online contiene tutto quello che segue. ⚠️ Vale però la regola: **ogni volta
che si tocca il `.ts` serve un deploy a mano dell'utente**, quindi le modifiche alla
function si raggruppano invece di spargerle.
La storia dei deploy, perché si capisca cosa c'è dentro — la seconda volta il 13/08,
per la correzione di `max_tokens`; **la terza il 16/08**, per il piatto unico nei pasti
condivisi, per i nomi degli ingredienti copiati dalla dispensa e per il **battito** che
tiene caldo il collegamento; **la quarta il 18/08**, per il terzo mestiere `modo:'ricetta'`
che completa un piatto scritto a mano; **la quinta il 20/08**, per le due categorie nuove
dello split (`formaggi` e `latticini freschi`) nell'elenco di `categoria_principale`.
Collaudo del Blocco 2: `COLLAUDO-V5-BLOCCO2.md`.

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

### La v5 — Blocco 4 (13/08/2026): a mano e rigenerazione

⚠️ **Serve un passaggio sul database**: `tabelle-piano-v5-blocco4.sql` aggiunge la
colonna `plan_meals.a_mano`. Senza, il salvataggio a mano fallisce e `spiegaErrore()`
dice quale file eseguire.

**Il quarto modo della passata: «Lascia».** Vuol dire *non toccare questo pasto*, e
copre due bisogni che sono la stessa cosa vista da due lati:

- in una settimana nuova = «questo giorno non lo decido adesso» → **non scrive niente**
  nel calendario. È il buco trovato collaudando il Blocco 2, ora chiuso;
- in una rigenerazione = «tieni quello che c'è già».

Di conseguenza **il salvataggio non cancella più il giorno intero**: cancella pasto per
pasto solo quello che sta per riscrivere (due `delete`, uno per pranzo e uno per cena,
poi un `insert`). I pasti su «Lascia» non compaiono in `righeDaSalvare()` e quindi
sopravvivono.

**Modifica a mano.** Due ingressi, tutti e due chiesti: la matita **✎ su ogni pasto**
(anche su un pasto che non c'è: è così che si riempiono i buchi) e il tocco sul pasto.
Solo da **oggi in avanti** (`modificabile()`): sul passato c'è il diario.
Il pannello scrive nome, chi mangia, ingredienti, proteine e kcal, dolce e nota.

Le tre regole, tutte e tre nel codice:

1. **proteine/kcal vuote → mai inventate.** `salvaPastoAMano()` scrive `null`, e
   `totaleGiorno()` conta quel pasto in `senzaNumeri`: il totale del giorno si dichiara
   **parziale**. I due campi spariscono del tutto sui pasti di sola Lorena.
2. **Può rompere i giorni dopo.** Dopo il salvataggio gira `scorteMancanti()` e, se
   qualcosa non torna, il messaggio rimanda all'avviso in cima — lo stesso della
   rigenerazione. Non si rigenera mai niente da soli.
3. **È `confermato` e `a_mano:true`, mai bozza.** Nella passata di una rigenerazione
   parte su «Lascia»: non si rifà senza che tu lo chieda.

**L'avviso delle scorte.** `scorteMancanti()` somma quello che i pasti futuri danno per
scontato e lo confronta con la dispensa. ⚠️ **Prudenza uguale a «Ho cucinato questo»:
si allarma solo quando il conto è sicuro.** Quantità non numeriche, unità diverse, voci
segnate «?» non producono avvisi — meglio tacere che gridare al lupo.
«Non ora» lo nasconde **fino a ricaricare** (`S.avvisoVia`, non `localStorage`): il
problema è vero e non va dimenticato.

#### ⚠️ I nomi degli ingredienti: un solo confronto, `stessoNome()` (16/08/2026)

Trovato due volte sui dati veri: l'avviso segnalava mancante «uovo» mentre in dispensa
c'era «Uova», e prima ancora mozzarella/Mozzarelle, polpo/Polpi, panino per
burger/Panini burger. Non era un caso isolato: erano **quattro confronti diversi**
sparsi per l'app, che sbagliavano in quattro modi diversi.

Ora ce n'è **uno solo**, `stessoNome(a, b)`, ed è usato in **tutti** i punti in cui si
confrontano nomi di cibo: `cercaInDispensa()` (lo scalo di «Ho cucinato questo» e
l'avviso delle scorte), il raggruppamento dentro `scorteMancanti()`, `inListaSpesa()`,
la deduplica di `aggiungiAllaSpesa()` e le liste del Profilo. **Se serve confrontare
due nomi, si passa da lì: non se ne scrive un altro.**

Due principi:

1. **Nome intero, mai pezzi di parola.** «latte» non è «latte di cocco», «farina» non
   è «farina di mandorle». Per questo non si usa più `includes()`: si confrontano le
   parole che contano (via `paroleNome()`, che butta via articoli e preposizioni), e
   devono essere **tante uguali e tutte appaiate**. Così «panino per burger» trova
   «Panini burger», ma «latte» non tocca il latte di cocco.
2. **Singolare e plurale sono la stessa cosa.** `formeParola()` genera i plurali
   regolari italiani (carota→carote, pomodoro→pomodori, zucca→zucche, aglio→agli,
   pesce→pesci). Gli irregolari stanno nella mappa `ALIAS_NOMI` — **uovo/uova è lì**,
   ed è fatta apposta per essere allungata quando salta fuori un caso nuovo.

⚠️ **Solo dal singolare al plurale, mai il contrario**, ed è la parte delicata: se si
provasse a indovinare il singolare, «pesche» diventerebbe «pesce» e la dispensa
scalerebbe il pesce al posto delle pesche. Funziona lo stesso perché due nomi si
incontrano se almeno uno dei due è al singolare — e in dispensa uno dei due lo è quasi
sempre. Per lo stesso motivo restano distinti grana/grano, pasta/pasto, pesce/pesca.

`forseInCasa()` resta, ma solo per **l'ultimo caso** che a `stessoNome()` sfugge di
proposito: le voci-contenitore che nominano la roba nella **quantità** e non nel nome
(«Base sempre in casa — grana · burro · …»). È larga, e va usata **solo per far tacere
un avviso**, mai per scalare: sbagliare verso il silenzio va bene, verso il rumore no.

⚠️ **La cura vera è a monte**: nel prompt della Edge Function c'è l'ordine di scrivere
gli ingredienti del piano **con i nomi della dispensa, lettera per lettera** — niente
singolari al posto dei plurali, niente sinonimi, niente aggettivi in più. `stessoNome()`
copre i residui, non è il rimedio principale.

**Rigenerazione.** Non c'è un motore nuovo: si **riapre la stessa passata**
(`apriPassata({dal, quanti, daPiano, titolo})`) precompilata da `S.piano`, e i blocchi
si calcolano su misura (`blocchiDa(n)`, sempre due giorni per volta). Tre ingressi:
il tasto **↻ Rigenera** nella fascia del giorno (**solo giorni futuri, mai oggi**),
**Rigenera da …** nell'avviso delle scorte, e **Allunga il piano** quando il piano
copre meno di 7 giorni da oggi (`pianoCortoHtml()`).

### ⚠️ «Load failed» sull'iPhone — il filo non deve essere il tavolo di lavoro (16/08/2026)

«Genera la settimana» si è rotta **due volte su due** dall'iPhone, con la frase
`Load failed`. Diagnosi, in tre pezzi:

1. **`Load failed` è la frase di Safari per «la connessione si è rotta».** Non è un
   errore dell'app né della function: la function parla sempre italiano. L'app aveva
   un traduttore per i guasti di rete, ma conosceva solo il modo di dire di Chrome
   (`Failed to fetch`), quindi la frase di Safari arrivava grezza e sembrava un guasto
   misterioso. Ora c'è **`guastoDiRete()`**, che conosce tutti e due: **se salta fuori
   un altro browser con parole sue, si aggiunge lì e la capiscono tutti.**
2. **Perché il filo cade.** Ogni blocco tiene aperto **un collegamento solo** mentre il
   modello ragiona — e mentre ragiona **sul filo non passa niente**: può essere un
   minuto di silenzio prima del primo piatto. Basta che si spenga lo schermo, che si
   cambi app o che il telefono passi dal Wi-Fi alla rete cellulare.
3. **Perché faceva male**, ed è il difetto vero: fino al «Salva» finale i pasti generati
   vivevano **solo nella memoria del telefono**. Il filo non era il mezzo di trasporto,
   era il tavolo di lavoro.

⚠️ **La regola che ne esce: il database è la verità, il telefono è una finestra.**
Ogni blocco finito si scrive **subito** in `plan_meals` (`salvaBlocco()` dopo
`completaMancanti()`); `scriviRighe()` è il pezzo condiviso col salvataggio finale, e
`PS.salvati` tiene il conto di cosa è già scritto perché non si riscriva due volte. Se
il filo cade, quello che c'era prima è già al sicuro e **ricaricando si vede lo stato
reale**. I giorni scoperti si completano coi tasti che c'erano già.

Conseguenze da non dimenticare:

- il riepilogo **non è più il momento in cui si salva**: dice che è già tutto scritto,
  scrive quel che resta (i giorni fuori/liberi) e chiude. Per questo «Butta via»
  diventa «Chiudi» quando qualcosa è già stato scritto: **un tasto non deve promettere
  di cancellare una cosa che non cancella**;
- `chiudiPassata()` **rilegge dal database** se qualcosa è stato scritto, altrimenti si
  vedrebbe la settimana di prima. Chi ha già riletto passa `true`;
- la **ricevuta** (`ricevuta()`) conta su `S.piano` appena riletto, non sulla schermata:
  «nel calendario ci sono 11 pasti su 14» è una verifica, «salvato» era una promessa.

**Il battito.** La function manda `{tipo:'battito'}` ogni 10 secondi mentre il modello
pensa: tiene caldo il collegamento ed evita almeno le cadute per inattività. **Non
basta da solo** — con lo schermo spento il filo cade lo stesso — ed è per questo che la
difesa vera è il salvataggio blocco per blocco.

⛔ Resta scoperto un caso: se il filo si taglia in **mezzo** a un blocco, quel giorno
non era finito e non c'era da nessuna parte. **Lo chiude la staffetta** (vedi sotto):
l'utente ha deciso il 16/08/2026 che spostare la generazione sul server **è
obbligatorio**, non facoltativo.

### ⚠️ Il tetto vero di Supabase: 150 secondi, e ci stavamo dentro per un pelo

**Misurato col cronometro il 16/08/2026**, chiamando la funzione online:

| Chiesto | Pensiero prima del primo piatto | Durata totale | Sui 150 s del piano gratuito |
|---|---|---|---|
| 2 giorni (4 pasti) — com'era | 115 s | **127 s** | l'**85%** del tetto |
| 1 giorno (2 pasti) — com'è ora | 78 s | **86 s** | il 58% |

I limiti ufficiali: **wall clock 150 s sul piano gratuito** (400 s sui piani a
pagamento), CPU 2 s — ma **l'attesa della risposta di Claude non conta**, è rete.
⚠️ **Lo stesso tetto vale per i lavori in sottofondo** (`EdgeRuntime.waitUntil`): una
funzione in background si spegne agli stessi 150 s. È il motivo per cui «spostare tutto
sul server» **da solo non basta** e la staffetta deve spezzare per giorno.

Conseguenze, tutte in vigore:

- **un giorno per chiamata** (`blocchiDa()`), sette chiamate a settimana. Due giorni
  viaggiavano all'85% del tetto: bastava una dispensa più grande e **era Supabase a
  spegnere la funzione**, il flusso si troncava e sul telefono usciva «Load failed».
  Molto probabilmente è questa la causa vera dei due fallimenti, non solo il telefono;
- **il pensiero non si dimezza dimezzando il lavoro** (115 s contro 78 s): c'è un costo
  fisso di ~65 s per leggere dispensa e vincoli. **Sotto il giorno singolo non conviene
  scendere**: si pagherebbe il costo fisso due volte per lo stesso lavoro;
- **una settimana costa 7 tacche** delle 30 al giorno (~14 centesimi), non più 4.

### La staffetta — la settimana si genera da sola, sul server (16/08/2026)

⚠️ **Serve un passaggio sul database**: `tabelle-staffetta.sql` (tabella `plan_jobs`).
Finché non è eseguito l'app non se ne accorge nemmeno: `S.staffetta` resta falso e si
genera col modo vecchio, senza errori.

**Il requisito**, dettato dall'utente: *premo «Genera», poso il telefono, e la settimana
si completa da sola anche a schermo spento; quando riapro l'app vedo lo stato reale e
completo.* Non era facoltativo.

**Come funziona.** Il telefono manda `modo:'settimana-avvia'` con la passata intera e se
ne va. Da lì in poi:

| Anello | Cosa fa |
|---|---|
| `settimana-avvia` | scrive subito i pasti fuori/liberi (non serve il modello), crea la riga in `plan_jobs`, **risponde subito** e in sottofondo lancia il primo passo |
| `settimana-passo` | genera **un giorno**, lo scrive in `plan_meals`, aggiorna la riga di lavoro, **sveglia l'anello dopo** e si spegne |
| `settimana-riprendi` | rimette in corsa una staffetta ferma, dal primo giorno mancante |

⚠️ **Perché a staffetta e non un unico lavoro in sottofondo**: `EdgeRuntime.waitUntil()`
tiene viva la funzione dopo la risposta, **ma resta dentro gli stessi 150 secondi**. Una
settimana intera non ci starebbe mai. Ogni anello riparte col budget pieno.
`inSottofondo()` prende `EdgeRuntime` da `globalThis` invece di dichiararlo: una
dichiarazione nostra si scontrerebbe con quella del runtime al deploy.

**Nessun anello si fida del precedente**: rilegge `plan_jobs` dal database. Se un anello
muore, la catena si ferma, lo stato diventa `fermo` e l'app offre **«Riprendi»**. ⚠️ Non
riparte da sola: una catena che si rincorre consumerebbe credito senza che nessuno
guardi. Se muore così male da non riuscire nemmeno a dirlo, l'app se ne accorge dal tempo
(`sembraFermo()`: più di 4 minuti senza aggiornamenti, mentre un giorno ne impiega ~1,5).

**Lato app non c'è nessun motore**, solo una finestra: `avvisoLavoroHtml()` in cima al
Piano dice cosa sta facendo il server, `guardaLavoro()` ricontrolla ogni 6 secondi e
ridisegna il calendario man mano. Se chiudi non cambia niente; se riapri, `loadAll()`
ritrova il lavoro e ricomincia a guardare da solo.

⚠️ **Il gemello da tenere allineato**: `rigaDiPasto()` nella function fa lo stesso
mestiere di `righeDaSalvare()` nel frontend — da un pasto alla riga di `plan_meals`.
Adesso è la function a scrivere i pasti generati; quella del frontend resta per i pasti
scritti **a mano** e per il modo vecchio. **Se cambia lo schema, si toccano tutte e due.**

Il modo vecchio (`modo:'settimana'`, il telefono che guida) **resta** come ripiego per
quando la function online non è ancora stata reincollata. Il contesto del prompt è
scritto una volta sola (`costruisciContestoSettimana()`) e lo usano tutti e due: due
copie si sarebbero scollate alla prima modifica.

#### ⚠️ La coppia degli avanzi non è più «stesso blocco»: è «stessa informazione»

Prima i blocchi erano da due giorni proprio per tenere insieme «cena di oggi → avanzo a
pranzo domani». Con un giorno per chiamata quella stampella non c'è più, e la sostituisce
una regola più forte, voluta dall'utente il 16/08/2026:

**ogni chiamata riceve la passata dell'INTERA settimana** — chi mangia, casa/fuori/libero,
le note — anche per i giorni che non sta scrivendo (`descriviSettimana()` nel frontend,
campo `settimana` nel corpo, sezione «LA SETTIMANA INTERA» nel prompt). Serve perché **la
cena di oggi può decidere la porzione doppia solo sapendo se domani a pranzo Ciprian è a
casa da solo**: senza sguardo in avanti la catena nasce cieca.

E in avanti, nel prompt (regola 5): **se il giorno prima ha marcato un `avanzo_per` per
oggi, il pasto di oggi È quell'avanzo**, non un piatto nuovo. L'unica eccezione è
l'impossibilità vera, e va scritta in una riga in `perche`. Perché funzioni,
`compattaPasto()` **deve** mandare avanti il campo `avanzo_per`: è il filo della catena.

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

#### ▶️ PROSSIMO PASSO

**Aggiornato il 20/08/2026.**

✅ **IL DEPLOY DELLA FUNCTION È IN PARI.** Fatto dall'utente il **20/08/2026**, subito dopo
il push della barra in basso. Online c'è tutto quello arretrato dal 18/08 (menu, costi,
valori per 100 g) **più** le due categorie nuove dello split, `formaggi` e
`latticini freschi`, nell'elenco da cui il modello prende `categoria_principale`.
⚠️ Vale sempre la regola: ogni volta che si tocca il `.ts` serve un deploy a mano
dell'utente, quindi le modifiche alla function **si raggruppano** e si dichiarano.

⚠️ **RESTA UN SOLO FILE SQL**: `tabelle-costi.sql`, e non è verificabile da qui —
`generator_usage` non ha policy, quindi è invisibile alla chiave publishable e il trucco
del `select=<colonna>&limit=0` non funziona. Finché non è eseguito «Quanto sto spendendo»
resta a zero; il resto dell'app non se ne accorge.

Tutti gli altri risultano eseguiti, verificati uno per uno interrogando il database
(`tabelle-nutrienti` · `tabelle-blocco6` · `tabelle-kcal-lorena` · `tabelle-frequenze-v8` ·
`tabelle-categorie-v8`), e lo split dei latticini è stato scritto direttamente dall'app.

⚠️ **NIENTE SQL E NIENTE DEPLOY per tutto quello fatto dopo lo split**: alias dei nomi,
contorni liberi, coppie di sostituti, punti di ripristino, unità dei numeri nudi e memoria
dei valori per 100 g vivono **tutti in `settings`**, che è una tabella chiave→valore già
esistente. È la ragione per cui quella tabella è diventata il posto dove l'app impara: non
costa una migrazione a chi la usa.

#### ⛔ La coda dei giri, che NON si esegue da soli

L'utente tiene la sua strada in `PROMPT-GIRO*.md` e la dà un giro alla volta. Fatti:
**Giro 1** (protezione e rumore) · **Giro 2** (rinomina di una voce con alias automatico,
fatta in anticipo) · **Giro 3** (gli attriti d'uso). Restano suoi, e **non vanno anticipati**:
riallineamento periodico della dispensa · lista della spesa per reparto · memoria fra le
settimane · le scadenze in un campo loro.

⚠️ **Quello che manca è il COLLAUDO**, ed è l'unica cosa che l'utente può fare e
nessun altro. Due parti.

*Il piatto a mano*: matita ✎ su un pasto da oggi in poi, scrivere solo un nome, toccare
«Crea la ricetta». Controllare che i nomi degli ingredienti siano quelli della dispensa,
che i numeri arrivino, che il TOT del giorno smetta di dirsi parziale, e che riaprendo
la matita il riquadro dica «è già nel ricettario» invece di rioffrire il bottone. In tab
Ricette la ricetta dev'esserci **senza cuore**.

*La spesa*: generare o rigenerare qualcosa che lasci dei mancanti, controllare che in
lista compaia «serve …» e che l'ordine segua le date; spuntare una riga e accettare
«Mettilo in dispensa»; poi tornare sul giorno che dipendeva da quella spesa e vedere
che il riquadro ambra **è sparito**.

#### La v5 — Blocco 5: la spesa collegata al piano (18/08/2026)

⚠️ **Serve un passaggio sul database**: `tabelle-spesa-blocco5.sql` aggiunge
`shopping_list.serve_il`. Senza, tutto continua a funzionare com'era — la lista si
legge con `select('*')` e l'inserimento **riprova da solo senza la data**
(`inserisciInSpesa()`) — ma le righe restano mute.

Tre anelli, ed erano tre buchi dello stesso filo.

**A · La riga sa per quando serve.** I mancanti si portano dietro il giorno che li
aspetta (`mancantiDaPasti()`), e la lista si ordina per quello: prima ciò che serve
prima, le voci scritte a mano in fondo. Su una riga si legge «serve domani», e in ambra
se è oggi o domani. Al supermercato la differenza è tutta lì.
⚠️ Se la stessa cosa serve per due giorni, **vince il primo**: è quello che decide
quando conviene averla in casa. La deduplica resta di `aggiungiAllaSpesa()`, che
confronta i nomi con `stessoNome()` — «uovo» e «uova» sono una riga sola.

**B · Spuntare un acquisto propone di metterlo in dispensa.** Era l'anello mancante: la
lista si riempiva dal piano, ma quello che compravi restava fuori dalla dispensa e i
giorni «dipende dalla spesa» aspettavano una cosa che intanto era in frigo.
⚠️ **Si propone, non si fa**: quanto ne hai preso e dove lo metti non si può sapere, e
qui non si inventano numeri. Si apre un modulo sulla riga stessa, con la quantità da
scrivere (testo libero) e la categoria da scegliere. Vuota → `?`, cioè da verificare,
come ovunque.
⚠️ Se quella cosa **in dispensa c'è già** non si propone niente: si dice cosa c'è e si
lascia decidere. Aggiungerla due volte sarebbe la stessa verità scritta in due posti.
Confermando, la riga **esce dalla lista**: una cosa entrata in dispensa non è più da
comprare, e lasciarla lì spuntata sarebbe un doppione. L'annulla rimette tutto.

**C · «Dipende dalla spesa» sparisce quando è coperto** (`riquadroSpesa()`).
`dipende_da_spesa` è una fotografia scattata alla generazione: **un avviso che resta
acceso quando il problema non c'è più smette di essere un avviso**. Ora si guarda in
dispensa, e il riquadro dice anche **cosa** manca invece di mandare a controllare la
lista. ⚠️ Prudenza come sempre: si nomina mancante solo ciò che non si trova né con
`cercaInDispensa()` né con `forseInCasa()`.

⚠️ **`toast()` ha un quarto parametro, l'etichetta del bottone**, e torna sempre ad
«Annulla» se non la si passa: un toast che si tenesse addosso la scritta del toast
precedente prometterebbe la cosa sbagliata.

#### La v5 — Blocco 6: procedimento, sostituzioni, svuota-frigo (18/08/2026)

⚠️ **Serve `tabelle-blocco6.sql`**: `plan_meals.procedimento`, `plan_meals.sostituzioni`,
`recipes.procedimento`, `plan_jobs.svuota_frigo`. Senza, tutto continua a funzionare —
le colonne nuove si mandano **solo se hanno un valore** — ma i tre lavori non si vedono.

**1 · Il procedimento.** Passi numerati, coi tempi veri **dentro** i passi («rosola 5
minuti»), non alla fine: chi cucina ha le mani sporche e legge una riga per volta.
⚠️ **La lunghezza la decide il piatto**: due o tre righe se è banale. Un procedimento
lungo per una cosa ovvia non lo legge nessuno, e chi ne salta uno si abitua a saltarli
tutti. Tetto a dieci passi, applicato lato codice (`passiPuliti()`), non solo chiesto
nel prompt.

⚠️ **Sta su `plan_meals` E su `recipes`, e non è una svista.** Sulla ricetta è la
versione che resta e si riusa (per una persona); sul pasto è come si fa **quel** giorno.
Un pasto generato dalla settimana non ha una ricetta collegata: se il procedimento
vivesse solo sulle ricette, quei pasti resterebbero muti proprio dove serve di più.

⚠️ **Nel calendario è CHIUSO** (`<details class="proc">`). Il piano si guarda dieci
volte al giorno per sapere cosa si mangia e si apre due volte per cucinare: tenerlo
aperto allungherebbe ogni scheda per il caso raro, e la striscia dei sette giorni
sparirebbe sotto un muro di testo. È un `<details>`, cioè l'apri-e-chiudi del browser:
nessuna riga di JS da mantenere.

**2 · Le sostituzioni.** ⚠️ **Non sono «manca», sono il contrario di «manca».** «Manca»
vuol dire vai a comprarlo; una sostituzione vuol dire *non serve che tu vada da nessuna
parte, usa questa cosa che hai già*. Per questo stanno nel riquadro **menta** delle
buone notizie e non nell'ambra degli avvisi: sono una spesa risparmiata.

⚠️ **Mai sulla fonte proteica.** Il pollo non si sostituisce col tonno «perché tanto
sono proteine»: quello cambia il piatto, e le proteine sono il vincolo che comanda su
tutto il metodo. Valgono per erbe, aromi, contorni, latticini di rifinitura.

**3 · Lo svuota-frigo.** Un chip nella passata, **spento di default e senza memoria**:
è una scelta per *questa* settimana, non un'impostazione — chi parte fra dieci giorni
non deve ritrovarselo acceso.

⚠️ **Non è una modalità diversa del generatore: è una priorità in più**, che si infila
davanti alla varietà e ai gusti ma resta **dietro** alle proteine e ai divieti. Nel
prompt è scritto in quest'ordine, e il punto 4 lo dice per esteso: **il minimo di 55 g
nei pasti principali di Ciprian resta**. Svuotare il frigo non è una scusa per dargli un
piatto di verdure; se per arrivarci serve comprare una fonte proteica, quella va in
«manca».

⚠️ **Il flag vive su `plan_jobs`, non in un parametro di passaggio.** La settimana si
genera a staffetta e ogni anello riparte da zero rileggendo la riga di lavoro: se il
flag stesse solo nella prima chiamata, dal secondo giorno in poi il piano tornerebbe
normale **e nessuno se ne accorgerebbe** guardando il risultato.

⚠️ **Altri due gemelli da tenere allineati**, oltre a `rigaDiPasto()`/`righeDaSalvare()`:
`passiPuliti()` e `sostPulite()` esistono **due volte**, nella function e nel frontend,
e ripuliscono le stesse cose. Se cambia lo schema si toccano tutte e due.

#### L'import della settimana 22-28 agosto (18/08/2026)

Brief: `PROMPT-IMPORT-SETTIMANA.md`. Una settimana decisa a mano in chat (Lorena in
convalescenza) caricata nel calendario **senza chiamare il generatore**: zero tacche
consumate. File: `import-settimana-22-28.sql`.

⚠️ **`ingredienti` contiene la lista «Scala», non le porzioni.** Sono due informazioni
diverse e servono a due cose diverse: quanto si toglie dalla dispensa, e quanto va nel
piatto di ciascuno. Le porzioni per persona stanno nella **nota** del pasto. Metterle
negli ingredienti avrebbe fatto scalare la somma sbagliata — e per i pasti «avanzo» la
somma giusta è **zero**, perché quella roba era già stata contata il giorno prima.

⚠️ **Gli avanzi scalano solo quello che si aggiunge oggi.** Martedì pranzo (torta salata
di lunedì) scala solo insalata e tonno; giovedì pranzo (burrito di mercoledì) non scala
niente. Scalare due volte lo stesso ingrediente svuoterebbe la dispensa di roba mai
usata.

**La cena di domenica è `modo:'libero'`**, col meccanismo che esiste già: il totale del
giorno scende e lo si dichiara. Non è uno sgarro e non va scritto come tale.

**Il Blocco 2 — lo spesone** sta in `import-spesa-22-28.sql`, e ha richiesto una colonna
nuova (`tabelle-spesa-qta.sql`).

⚠️ **PERCHÉ LA QUANTITÀ NON PUÒ STARE DENTRO AL NOME**, ed è la cosa da ricordare: il
nome è la CHIAVE con cui `stessoNome()` collega spesa, piano e dispensa. «Pane 1 kg» non
è più il «Pane» che il piano aspetta — il piano continuerebbe a segnalarlo mancante, e
spuntandolo finirebbe in dispensa una voce chiamata «Pane 1 kg» che non corrisponde a
niente. Per questo `shopping_list.qta` è una colonna a sé, e la riga la mostra ACCANTO
al nome. Il brief diceva «senza costruire nulla di nuovo»: quel vincolo era sul flusso
comprato→dispensa, che infatti è quello del Blocco 5 e non è stato toccato.

Le date `serve_il` sono calcolate sul primo pasto che aspetta quella cosa, così la lista
si ordina da sé. Le voci senza data (caffè, zucchero, carta forno) vanno in fondo.

⚠️ **Due cose non coperte da nessuno**, dichiarate e non risolte di nascosto:
`Olio` (che non è nella dispensa né nello spesone: comparirà come mancante finché non lo
si aggiunge a «Base sempre in casa») e `Grana`, che invece è già dentro la quantità di
«Base sempre in casa» e quindi `forseInCasa()` lo fa tacere.
⚠️ **`Pasta sfoglia` l'ho aggiunta io**: non era nello spesone, ma lunedì sera la torta
salata non si fa senza.

#### La stessa settimana, rifatta il 19/08/2026 — ⚠️ vale questa, non quella sopra

`PROMPT-IMPORT-SETTIMANA.md` è stato **riscritto** il 19/08: stessa settimana, piatti
diversi. I file nuovi sono `import-settimana-22-28-v2.sql` e `spesa-22-28-v2.sql`, e
**sostituiscono** i due del 18/08, che restano nella cartella solo come storia.
Cinque pasti su quattordici cambiano davvero: domenica pranzo (pasta al sugo **con le
fettine di vitello**, non più uova sode), mercoledì cena (**polenta** al posto del purè),
giovedì cena (**zuppa di lenticchie con pastina** al posto del minestrone con ceci),
venerdì pranzo (**pasta in bianco col cotto magro** al posto di «Avanzi o toast») e
venerdì cena (**straccetti di tacchino al limone con farro** al posto del pollo alle erbe).

⚠️ **Lo spesone del 18/08 era già sul database, tutto da spuntare.** Per questo il file
nuovo non si limita ad aggiungere: **toglie dieci voci** che servivano solo al piano
vecchio (minestrone, ceci, fiocchi di patate, pancarré, e le scorte che non tornano) e
**aggiorna quantità e data** di quelle rimaste, senza mai toccare la spunta. Una lista
della spesa con dentro gli avanzi di un piano superato è peggio di nessuna lista: al
supermercato si compra roba che nessuno userà.

⚠️ **Le voci scritte a mano dall'utente non si toccano** (Prezzemolo, Limone, cipolla,
Bicarbonato, Tonno in scatola): non sono venute da un import, e cancellarle sarebbe
decidere al posto suo. Restano però **tre doppioni** che solo lei può sciogliere —
`Limone`/`limoni`, `cipolla`/`Cipolle`, `Tonno in scatola`/`Tonno` — perché `stessoNome()`
non li appaia (il singolare non si deduce dal plurale, ed è voluto).

⚠️ **Un ingrediente, un nome solo.** Il brief scriveva «grana» mercoledì sera e
«parmigiano» negli altri due pasti: nel piano è **`Parmigiano`** dappertutto, che è anche
il nome della riga di spesa. Due nomi per la stessa cosa vorrebbero dire che l'app non
riconosce di averla. Stessa ragione per **`Riso Roma`**, che è il nome esatto in dispensa.

⚠️ **`Olio` adesso è nello spesone** (1 litro): era la prima delle due cose scoperte del
18/08. `Grana` resta coperto da «Base sempre in casa», come prima.

I conti del brief tornano tutti, ed è il modo di accorgersi di un errore di trascrizione:
pasta 360 g, uova 5, carote 6, riso 290 g, parmigiano 85 g, prosciutto cotto 240 g, petto
di pollo 350 g — esattamente i numeri che il brief dichiara a fianco delle quantità.

#### ⚠️ Il buco chiuso: «Genera la settimana» passava sopra ai pasti scritti a mano

Trovato verificando il punto 4 di quel brief, e **non era un problema di quell'import**:
era un difetto vero, che c'era da sempre.

`costruisciPassata()` metteva su «Lascia» i pasti `a_mano` **solo quando `daPiano` era
vero**, cioè rigenerando. Una **«Genera la settimana» partita da zero** costruiva la
passata con tutti i pasti su «A casa», e il salvataggio poi cancella e riscrive i giorni
che tocca: i pasti scritti a mano sparivano **senza che niente lo chiedesse**, e chi li
aveva scritti se ne accorgeva quando non c'erano più.

La regola dell'app era già scritta — *un pasto scritto a mano è confermato e non si
rigenera senza chiedere* — semplicemente non era applicata su quel percorso.

⚠️ **È un punto di partenza, non un lucchetto**: basta toccare «A casa» per rigenerarlo
davvero. Deve restare così — decidere di buttare via quello che si è scritto è una
scelta di chi guarda, non una porta chiusa.

E la passata **lo dice**: «ci sono 3 pasti scritti da te in questi giorni, sono su
Lascia e non li tocco». Un «Lascia» comparso da solo, se non si sa perché, sembra un
errore.

#### La grafica è CHIUSA (18/08/2026) — non si riapre da soli

Giudizio dell'utente sul secondo giro: **«promossa per questo giro — meglio del primo,
non definitiva»**. Il cantiere è chiuso: niente illustrazioni come firma, la firma
**resta la testata**, e ogni schermata futura eredita i token.

⚠️ **Si riapre solo su una critica puntuale dell'utente.** Non rimettere mano alla
grafica di propria iniziativa, e non riproporre le illustrazioni come firma: due firme
insieme sono zero firme.

#### Il piatto a mano nasce completo (18/08/2026)

Un pasto scritto a mano nasceva col solo nome, e **un pasto senza numeri bucava i totali
di Ciprian in due posti**: il TOT del piano (`plan_meals`) e «finora oggi» (`meals_log`).
Tre blocchi.

**Blocco 1 — la ricetta ha un contenuto.** `tabelle-ricette-complete.sql` aggiunge a
`recipes` i campi `ingredienti` (jsonb), `prot`, `kcal`, `tempo`, e a `plan_meals` il
campo `ricetta_id`.

⚠️ **Tutto quello che sta in `recipes` è PER UNA PERSONA.** Una ricetta è una cosa sola,
il pasto invece cambia con quanti sono a tavola. Tenere qui la porzione singola è ciò
che permette di riusare la stessa ricetta per uno o per due **senza che l'app moltiplichi
niente da sé**: a dimensionare il pasto è il generatore, che sa già farlo. Raddoppiare
«un cucchiaio di olio» o «mezza cipolla» darebbe risultati sbagliati, e la regola di
questa casa è che si calcola solo quando il calcolo è sicuro.

**Blocco 2 — il bottone «Crea la ricetta».** Sta nel pannello «Scrivo io», subito sotto
il nome del piatto. ⚠️ **Parte solo se lo si tocca**: costa **una tacca** delle 30
generazioni del giorno, come una proposta. Mai automatico, mai al salvataggio.

Il terzo mestiere della Edge Function (`modo:'ricetta'`, `REGOLE_RICETTA`,
`SCHEMA_RICETTA`) restituisce **due misure dello stesso piatto in una chiamata sola**:

- `ricetta_*` → per **una** persona, va nel ricettario;
- `pasto_*` → dimensionato su **chi mangia davvero** quel giorno, va nel calendario.

⚠️ **Le tre regole anti-doppione** stanno in `ricettaPerNome()` + `haContenuto()`, e il
confronto è `stessoNome()` come in tutto il resto dell'app:

1. esiste una ricetta con quel nome **e con dentro qualcosa** → si **collega** quella e
   **non la si tocca**: qualcuno l'aveva approvata. Viene anche mandata al generatore
   perché la riusi invece di riscriverla a modo suo;
2. esiste ma è **vuota** (il vecchio ricettario conosceva solo i nomi) → si **riempie
   quella riga**, e il nome resta il suo: si riempie il contenuto, non si ribattezza;
3. non esiste → se ne crea una.

⚠️ `eraPiena` si legge **prima** di scrivere: nel caso 2 la riempiamo noi, e dopo
sembrerebbe che ci fosse già — il messaggio finale direbbe una bugia.

⚠️ **Il bottone riempie il modulo, NON salva il pasto.** Salvare resta un gesto
dell'utente, così può guardare cosa è stato scritto e correggerlo prima.
⚠️ **E non mette nessun cuore.** Scrivere la ricetta di un piatto non vuol dire che quel
piatto piace: se i ♥ si mettessero da soli smetterebbero di voler dire qualcosa. È la
stessa regola di `conRicetta:false` nella verifica del mattino.

⚠️ `ricetta_id` si scrive nel pasto **solo se c'è davvero**: mandarlo sempre, anche
vuoto, farebbe fallire il salvataggio su un database in cui il file SQL non è ancora
stato eseguito — e scrivere un pasto a mano funzionava già da prima, non deve smettere.

**Blocco 3 — «parziale» basta un numero solo.** ⚠️ Fino a oggi la dichiarazione di
totale parziale scattava solo se mancavano **tutti e due** i numeri (`prot == null &&
kcal == null`). Ma il caso più probabile è l'altro: **le proteine uno se le ricorda, le
kcal no.** Con la «e» quel pasto entrava con le proteine giuste, sommava **zero calorie**
e il totale **taceva**. Ora è `||`, e vale su **tutte e tre** le funzioni che contano:

- `totaleGiorno()` — il TOT del piano;
- `totaleFinora()` — «finora oggi» dal diario;
- `fisseDelGiorno()` — dove c'era anche un `every()` al posto di un `some()`, cioè
  servivano *tutte* le registrazioni senza *entrambi* i numeri prima di dirlo.

**La regola che ne esce, e vale ovunque si sommino numeri**: un buco che non si dichiara
è peggio del buco. Un numero non deve mai sembrare più completo di quello che è.

#### Quello che era in coda da prima

Brief: `PROMPT-V5-PIANO.md`. Il brief diceva di fermarsi dopo il Blocco 3; **l'utente ha
deciso il 13/08 di proseguire col Blocco 4**, che è quindi scritto ma **non collaudato**.

Prima di andare avanti: `COLLAUDO-V5-BLOCCO3.md` e `COLLAUDO-V5-BLOCCO4.md`, ed eseguire
`tabelle-piano-v5-blocco4.sql`.

Poi il **Blocco 5 — spesa collegata al piano**: quando spunto un acquisto, proposta di
aggiungerlo alla dispensa; e se un giorno «dipende dalla spesa» ora è coperto, l'avviso
sparisce. Dopo ancora, i tre punti A/B/C qui sopra e il Blocco 6 (procedimento,
sostituzioni, svuota-frigo).

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

#### ✅ Fatti il 18/08/2026 — menu, costi, valori per 100 g

Erano i tre punti A/B/C in coda dal 13/08. Fatti **insieme**, in un push solo, perché
tutti e tre toccavano la Edge Function: ⚠️ **ogni deploy è un passaggio a mano
dell'utente e vanno raggruppati.**

**A · Il menu ripulito.** Via **«Copia per Claude»** e la sua `testoExport()`:
l'inventario si portava a mano in chat, ma ormai vive nel database e la function se lo
rilegge da sé. Al suo posto **«Quanto sto spendendo»** e **«Scarica un backup dei
dati»** (un file `.json`, da tenere, non da incollare).
⚠️ Il **copia-riepilogo del Diario resta**: quello serve ancora.
⚠️ `scaricaBackup()` prende quello che è **già in memoria** e, se qualcosa non si era
caricato, **lo scrive nel file** invece di far finta: un backup che mente è peggio di
nessun backup.

**B · I costi.** `tabelle-costi.sql` aggiunge `generator_usage.tok_in/tok_out` e la
funzione `registra_token()`. I token si contano in **un punto solo**, dentro
`pezziDiTesto()`, perché di lì passa ogni chiamata di tutti e tre i mestieri: contarli
nei singoli mestieri vorrebbe dire dimenticarsene al quarto.

⚠️ **Come arrivano i token, e non è ovvio**: `message_start` porta gli input (già
definitivi), `message_delta` porta gli output **cumulativi**. Quindi l'uscita si
**sostituisce** a ogni delta, non si somma — sommarla gonfierebbe la stima di parecchie
volte. La scrittura sta in un `finally`, così vale anche se il flusso si rompe: quello
che è stato speso è stato speso lo stesso.

⚠️ **`generator_usage` resta invisibile alla chiave pubblica** (RLS accesa, zero
policy): è ciò che la rende non manomettibile da chi apre l'indirizzo. Per mostrarne il
contenuto **non si aggiunge una policy** — c'è il modo `costi` della function, che ha la
chiave di servizio. E quel modo **non consuma una tacca**: guardare quanto spendi non
deve farti spendere.

⚠️ **La cifra è una STIMA e l'app lo scrive ogni volta.** `COSTO_IN`/`COSTO_OUT` nella
function sono i prezzi al 18/08/2026: quando cambiano diventano sbagliati **in
silenzio**. È metà del motivo per cui si rimanda alla Console di Anthropic per il conto
vero. L'altra metà è che i token contati qui non comprendono tutto.

**C · I valori per 100 g.** `tabelle-nutrienti.sql` aggiunge `inventory_items.prot_100g`
e `kcal_100g`, **facoltativi**. `descriviDispensa()` li passa al modello dove ci sono, e
tutti e tre i prompt dicono la stessa cosa: **dove il valore è dichiarato non si stima**,
dove non c'è si stima come sempre.

⚠️ **Non è un database alimenti** e la decisione che li vieta resta in piedi: nessun
archivio importato, nessuno scanner di codici a barre, e i campi restano vuoti finché
non li scrive una persona sulle voci che le interessano.

⚠️ **`nutriente()` non è `numeroONull()`**: qui **lo zero si accetta**, perché esiste
davvero (l'acqua ha 0 kcal). `numeroONull()` lo butta via apposta, ed è giusto nel suo
contesto — sono due regole diverse e non vanno unificate.

⚠️ **L'editor della dispensa è cambiato**: era un campo solo che si salvava perdendo il
fuoco, ora è un pannellino con Salva. Con più campi il «salva quando esci dal campo»
sarebbe una trappola — passare dalla quantità alle proteine salverebbe a metà. **Invio
salva ancora**, quindi per cambiare solo una quantità i gesti restano quelli di prima.

⚠️ **Tutte e tre le colonne nuove sono facoltative anche per il DATABASE**: se il file
SQL non è stato eseguito, la scrittura **riprova senza** e lo dice, invece di far
fallire un'azione che funzionava da sempre.

#### V8 Blocco 1 — la categoria alimentare (19/08/2026)

⚠️ **Serve un passaggio sul database**: `tabelle-categorie-v8.sql` aggiunge
`inventory_items.categoria` e assegna la categoria alle 59 voci esistenti (elenco
approvato dall'utente in chat). Senza, l'app continua a funzionare: la colonna si manda
solo quando ha un valore e la scrittura riprova senza, dicendolo.

⚠️ **CATEGORIA ≠ POSIZIONE, e non vanno mai confuse.** `cat` (frigo/freezer/dispensa)
dice **dove** sta una cosa e comanda scongelamenti e deperibili; `categoria` dice **che
cosa è** e comanda sostituzioni e frequenze. Il salmone sta in freezer oggi e in frigo
domani, ma resta pesce. Sono due domande diverse: la posizione **non è stata toccata**.

**Le quattordici**: pesce · carne bianca · carne rossa · salumi · uova · latticini ·
legumi · cereali e carboidrati · verdura · frutta · frutta secca e semi · condimenti e
grassi · dolci · altro. Le tredici del brief più `frutta secca e semi`, che serviva a
noci e burro d'arachidi.

⚠️ **Nessun vincolo sui valori nel database**, ed è voluto: aggiungere una categoria un
domani non deve costringere a una migrazione. A tenerle pulite pensa il menu a tendina,
che è l'unico modo per scriverle.

⚠️ **Vuota resta vuota.** La prima voce del menu è «— che cos'è? —», non «altro»: un
«altro» messo d'ufficio è una risposta inventata, e le frequenze ci conterebbero sopra.

**La proposta automatica** (`categoriaProposta()`) guarda in quest'ordine: ⓵ una voce di
dispensa con lo stesso nome (`stessoNome`) che ha già una categoria — **una scelta tua
vince sempre sul dizionario**; ⓶ `DIZIONARIO_CATEGORIE`, ~180 nomi comuni; ⓷ **dal
20/08/2026**, un nome conosciuto che sta **dentro** questo (`nomeDentro()`), prima dalla
dispensa e poi dal dizionario, e vince **il più specifico**, cioè quello di più parole;
⓸ niente, e il campo resta da scegliere. Si propone in tutti e tre i punti d'ingresso:
modulo di aggiunta, editor della voce, e «Mettilo in dispensa» dalla spesa.

⚠️ **Il passo ⓷ non è un di più: senza, mezzo piano resta senza categoria.** Trovato su
sabato 22: accanto a «Patatine fatte in friggitrice ad aria» **non compariva il tasto ↻**
per scambiarla. La catena è tutta qui — nessuna voce e nessuna riga del dizionario si
chiama così → nessuna categoria → `sostitutiPer()` non ha niente da confrontare → nessun
sostituto e nessun tasto. **I nomi che il generatore scrive sono descrizioni**
(«straccetti di tacchino al limone», «prosciutto cotto magro»), non etichette di scaffale:
pretendere il nome esatto lasciava fuori proprio i pasti veri.

⚠️ **Qui si può essere più larghi che in `stessoNome()`, e non è una contraddizione:**
sbagliare qui propone un sostituto che si rifiuta con un tocco, sbagliare là **scala la
dispensa sbagliata**. Prezzo dichiarato: un «latte di cocco» finirebbe fra i latticini.

⚠️ **`patatine` è scritto a parte nel dizionario**: per l'app non è il plurale di `patate`
ma un'altra parola (`formeParola()` non lo deduce, ed è giusto così). Senza quella riga il
passo ⓷ non avrebbe niente da trovare dentro «Patatine fatte in friggitrice ad aria».

⚠️ **Il tasto ↻ vive dentro il pannello del pasto**, non sulla scheda: si tocca il pasto
(o la matita ✎) e compare sulla riga dell'ingrediente. Sulla scheda gli ingredienti sono
in sola lettura, ed è voluto — un secondo posto da cui scambiare sarebbe un secondo posto
da tenere allineato.

⚠️ **Scelte di merito già discusse e approvate**: le patate stanno in *cereali e
carboidrati* (nel piatto sostituiscono pasta e riso, e un minimo di verdura non si
raggiunge con le patatine); passata e pesto in *condimenti* per la stessa ragione; il
maiale in *carne rossa*; salmone e tonno affumicati in *pesce* e non in *salumi*.

#### Le calorie di Lorena (19/08/2026) — ⚠️ SQL + DEPLOY

⚠️ **Serve `tabelle-kcal-lorena.sql`** (`plan_meals.kcal_lorena`) **e un deploy**: il
numero lo scrive il generatore.

Fino a oggi `prot` e `kcal` erano di Ciprian e di nessun altro, e nei pasti di sola
Lorena non compariva niente. Ora le **calorie** sono di tutti e due.

⚠️ **Solo le calorie, non le proteine.** Le proteine sono il vincolo di Ciprian e
restano sue: metterle anche di là vorrebbe dire tirare su un obiettivo che nessuno ha
chiesto.

⚠️ **Colonna nuova, non campo riusato.** Lo stesso piatto vale 620 kcal per lui e 430
per lei: un numero solo non può dire due cose. E le **aggiunte a lato di Ciprian**
(ingredienti con `per: "ciprian"`) non entrano nel numero di lei.

⚠️ **NIENTE OBIETTIVO, ed è scritto anche nel prompt in tutti e due i mestieri.** Il
numero si mostra e basta: nessun tetto, nessuna percentuale, nessun «ti restano». Al
modello è vietato commentare il suo totale o ridurle le porzioni per far tornare un
conto. *Un numero accanto a un tetto diventa un voto*, e qui non si danno pagelle — è
la stessa ragione per cui non esistono streak né punteggi.
Se un giorno vorrà contare, le basterà compilare `kcal_target` nel suo profilo: il
meccanismo c'è già (`haObiettivo()`).

⚠️ **Il totale di giornata di Lorena non somma le voci fisse**: colazione e yogurt sono
di Ciprian (`fisseDi()`), e attribuirgliele sarebbe inventare una colazione che nessuno
ha dichiarato. Se manca anche un solo numero il totale si dichiara parziale; se mancano
tutti **non si scrive niente** — uno zero sarebbe una bugia, non un'assenza.

⚠️ Nel pannello «scrivo io» il campo sta **fuori** da `[data-numeri]`: quel blocco
sparisce nei pasti di sola Lorena perché contiene le proteine, ed è proprio lì che le
sue calorie devono restare visibili. Il gemello all'incontrario è `.solo-ciprian`.

**Lo vedrai dalla prossima settimana generata**: i pasti già in calendario non hanno quel
numero, e il totale lo dichiara invece di far finta.

**L'interruttore nel menu** — «Mostra le calorie anche per Lorena», **acceso di
default** perché è stato chiesto.

⚠️ **Governa solo la vista, ed è CSS apposta** (`body.no-kcal-lorena`). I numeri
continuano a essere calcolati, scritti e salvati: farlo in CSS invece che con un ramo nel
codice rende **impossibile** che «non mostrarli» diventi per sbaglio «non scriverli», e
riaccendendolo si ritrova tutto lo storico invece di un buco. Il campo del pannello
«scrivo io» sparisce anche lui ma **conserva il valore** — `display:none` non svuota
niente e al salvataggio il numero riparte da dov'era.

⚠️ **Sta in `localStorage`, non nel database**, come `piano-io`: è una preferenza di chi
guarda, e i telefoni sono due — uno può volerle vedere e l'altro no. ⚠️ **Solo uno «0»
scritto spegne**, così un `localStorage` vuoto o una modalità privata che non salva non
lo spengono per sbaglio.

⚠️ **Non chiama `renderPlan()`**: non c'è niente da ricalcolare, e ridisegnare farebbe
credere che l'interruttore tocchi i dati.

#### V8 Blocco 3 — le frequenze settimanali (19/08/2026) — ⚠️ RICHIEDE IL DEPLOY

⚠️ **Serve un passaggio sul database**: `tabelle-frequenze-v8.sql` (tabella
`frequenze_categorie` + `plan_meals.categoria_principale`). Senza, la griglia resta vuota
e il piano si genera come prima, senza quel vincolo: non si rompe niente.

La griglia della nutrizionista, confermata dall'utente il 19/08. Si guarda e si corregge
dal **menu** («Quante volte a settimana ›»), non da una tab: si tocca due volte l'anno, e
una tab per una cosa del genere ruba il posto a quelle di ogni giorno.

**Le cinque regole di conteggio**, tutte dettate dall'utente, tutte nel prompt (§4 ter):

1. **Solo i pasti condivisi e quelli di Lorena.** Mai quelli di solo Ciprian, e dentro un
   pasto condiviso **un ingrediente con `per: "ciprian"` non conta**: le sue 3 uova sode
   a lato di una cena di gnocchi lasciano le uova della griglia a zero. Altrimenti le sue
   proteine bruciano i minimi e i massimi di lei — il contrario di quello che serve.
2. **Liberi e fuori casa restano fuori.** La pizza non consuma il massimo dei formaggi.
3. **Un avanzo conta come pasto suo**: merluzzo a cena + avanzo a pranzo = 2 pesci. Non
   si deduplica niente.
4. **Si conta su `categoria_principale`**, un campo nuovo che scrive il generatore. ⚠️
   **Non è `proteina_principale`**: quella dice l'alimento («pollo»), questa la categoria
   («carne bianca»). Un pasto conta **una volta sola**. L'unica eccezione è la **verdura**,
   che si conta come **presenza** fra gli ingredienti e non come piatto — è la risposta
   dell'utente alla domanda su «ogni giorno».
5. **Settimane corte: non si forza e non si tace.** Quando i pasti conteggiabili sono
   meno di quanti ne chiedono i minimi, la priorità è **pesce → legumi → carne bianca →
   uova** e il resto resta scoperto, **dichiarato** nel riepilogo insieme a quanti pasti
   contavano davvero. ⚠️ **I massimi valgono sempre**: con meno pasti sono solo più
   facili da rispettare, non diventano elastici.

⚠️ **IL CONTEGGIO LO FA L'APP, NON IL MODELLO** (`verificaFrequenze()`, sulle righe vere
di `plan_meals`). Il generatore riceve la griglia e cerca di rispettarla, ma quello che
compare nel riepilogo è contato dopo: **un vincolo verificato da chi lo doveva rispettare
non è una verifica, è una promessa.**

⚠️ **L'ordine in cui si dichiarano i minimi scoperti è quello di priorità**, non
alfabetico: dichiararli in ordine sbagliato farebbe sembrare grave la cosa che l'utente
ha messo per ultima.

⚠️ **Minimo maggiore del massimo si rifiuta al salvataggio**: non è un vincolo, è una
cosa che non si può soddisfare, e salvarla lascerebbe il generatore a sbatterci contro
ogni volta senza che nessuno capisca perché.

**La rotazione dei formati** — la verifica mai chiusa, che avevo confermato **mancante** —
entra qui come §4 quater: stesso formato (risotto, zuppa, polpette, insalatona, pasta
asciutta, al forno, panino, torta salata) **al massimo 2 volte** a settimana, e ⚠️ **una
catena di avanzi conta come una scelta sola**. Il campo `formato` è nello schema.
⚠️ È un asse **diverso** dalla rotazione dei cereali (`rotazione_max`): quella riguarda
l'ingrediente, questa la forma del piatto. Tre risotti diversi sono tre piatti sulla
carta e la stessa cena nel piatto.

#### V8 Blocco 2 — i sostituti della stessa categoria (19/08/2026)

«Non hai il merluzzo» è mezza informazione se in freezer c'è il nasello. Ora l'avviso
delle scorte lo dice — «hai il nasello: lo uso al suo posto?» — e lo stesso gesto c'è
aprendo il pasto, sulla riga dell'ingrediente.

⚠️ **Solo dentro la stessa categoria, mai fra categorie diverse, nemmeno come proposta.**
Il merluzzo si sostituisce col nasello, non con le lenticchie «perché tanto sono
proteine». È la stessa regola che il generatore ha già per le sue sostituzioni.

⚠️ **Si scarta solo quello che si SA non bastare.** Se la quantità che serve o quella che
c'è non sono due numeri confrontabili, la voce resta in elenco **con scritto quanto ce
n'è**: davanti al frigo si giudica meglio che con una regola, e qui sbagliare verso il
silenzio costa più che sbagliare verso la proposta.

⚠️ **I numeri si spostano della DIFFERENZA, non si ricalcola il pasto da zero**
(`numeriDopoIlCambio()`). Il totale di un pasto è una stima fatta sul piatto intero:
rifarla sommando gli ingredienti darebbe un numero diverso e peggiore di quello che c'è.

⚠️ **Se i valori per 100 g non si sanno, i numeri si AZZERANO** invece di restare quelli
di prima, e il pannello lo dice **prima** di confermare. Salmone e merluzzo non hanno le
stesse calorie: un cambio che lascia i numeri vecchi è una bugia, e un totale che si
dichiara parziale è la verità.

⚠️ **IL DELTA HA DUE ESTREMI, E VALE PER TUTTI E DUE** — chiesto esplicitamente
dall'utente il 19/08. Il conto salta anche quando l'ignoto è l'ingrediente che **esce**:
la base da cui sottrarre non si sa, e *un delta su base ignota è un numero inventato*.
Nel codice era già così (`completo(a) && completo(b)`), **il messaggio no**: diceva «non
so i valori per 100 g» senza dire di chi, e nel pannello lo ripeteva su ogni candidato —
facendo credere che dipendesse dal candidato e mandando a provarne un altro per niente.

Ora: se l'ignoto è quello che esce, lo si dice **una volta sola in cima** («di «merluzzo»
non so i valori, qualunque cambio scegli…»), col rimedio vero — scrivili in dispensa e
torna qui. Se l'ignoto è il candidato, lo dice la sua riga. Se il problema è la quantità
non pesabile, lo dice quella. ⚠️ **Un'informazione che indica la cosa sbagliata è come un
numero che arriva dal nulla**: fa agire nella direzione sbagliata.

⚠️ **Il cambio vale su tutti i pasti futuri che usano quell'ingrediente**, non solo sul
primo — cambiarne uno su tre lascerebbe il problema in piedi e farebbe credere di averlo
risolto. L'annulla riporta indietro **tutti** insieme.

Il bottone è **menta e non pesca**: una sostituzione è il contrario di un avviso, vuol
dire «non devi andare da nessuna parte». Stessa scelta già fatta per le sostituzioni del
generatore.

#### ⚠️ Il bug trovato collegando la categoria: un dato scritto e mai riletto

`inventory_items` si leggeva con `select('id,name,qty,cat')`, cioè un **elenco fisso di
colonne**. Quando il 18/08 sono arrivate `prot_100g` e `kcal_100g`, il lato che scrive è
stato aggiornato e **il lato che legge no**: i valori per 100 g finivano nel database e
non tornavano più indietro. L'editor li mostrava sempre vuoti, e nessuno se ne accorgeva
perché non c'era nessun errore da nessuna parte.

Ora è `select('*')`, per la stessa ragione per cui lo fa la Edge Function (c'era già
l'avvertenza, lì). ⚠️ **La regola: un dato scritto e mai riletto è un dato perso**, e i
lati che scrivono e che leggono si toccano insieme.

#### Blocco 4 — dal mancante al pasto (19/08/2026)

Nell'avviso «da X in poi il piano conta su cose che non hai più», ogni riga è **toccabile**
e porta al **primo pasto che la richiede**, col pannello di modifica già aperto.

⚠️ **Serve soprattutto quando il mancante non manca davvero.** Il caso vero è il nome
scritto diverso: `stessoNome()` copre i residui ma non tutto, e prima l'unica via era
leggere l'elenco e andarsi a cercare il pasto a mano. Adesso si apre da lì e si corregge.

⚠️ **Non c'è un secondo modo di aprire quel pannello**: l'handler chiama `vaiAlGiorno()` e
poi **preme la matita vera** (`b.click()`). Riscrivere la stessa apertura sarebbe un
secondo posto da tenere allineato, e si scollerebbe.

`scorteMancanti()` ora tiene `dove` (giorno **e pasto**, non più solo il giorno) e ne
espone il primo in `primo`, col pranzo prima della cena dentro la stessa giornata.

⚠️ Le righe toccabili sono alte **36 px e non 44**, contro la regola: sei righe da 44
spingerebbero la striscia dei giorni fuori schermo proprio mentre l'avviso chiede di
guardare il piano. La riga è larga quanto l'avviso, quindi il bersaglio orizzontale è
tutto — ed è quello che conta col pollice.

#### Blocco 3 — i condimenti esistono (19/08/2026) — ⚠️ RICHIEDE IL DEPLOY

Le ricette generate ignoravano olio, burro e grassi di cottura: non comparivano fra gli
ingredienti e non pesavano sui numeri. **Le calorie del condimento sono calorie vere**, e
un piano che le dimentica racconta una giornata più leggera di quella che è stata.

⚠️ **La regola è scritta UNA volta sola**, nella costante `CONDIMENTI`, e i tre mestieri
la interpolano: `REGOLE` (§2 bis), `REGOLE_SETTIMANA` (§4 bis), `REGOLE_RICETTA` (regola
10). Due copie si scollerebbero alla prima modifica — è già successo in questo file.

⚠️ **La riga di confine è il peso, non la categoria.** Quelli che pesano (olio, burro,
panna, formaggio grattugiato, maionese, pesto) vanno **fra gli ingredienti coi grammi** e
**dentro i conti**; quelli che non pesano (sale, pepe, aceto, limone, erbe, spezie,
aglio) restano `q.b.` e fuori dai conti. Riferimenti dati al modello: mezzo cucchiaio
(~6 g) per verdure e insalata, un cucchiaio (~12 g) per rosolare carne o pesce, ~5 g per
ungere una teglia — riferimenti, non un tetto.

⚠️ **«q.b.» vale zero nei conti**, ed è il motivo per cui è vietato sui condimenti che
pesano: un olio scritto e non contato è peggio che non averlo scritto, perché fa sembrare
fatto un lavoro che non è stato fatto.

⚠️ **I condimenti di base si danno per presenti** (olio, sale, pepe, aceto): non vanno
mai in `manca` e non pesano sul limite delle cose che mancano. Senza questa riga ogni
pasto sarebbe nato con «manca: Olio», e la regola «almeno un piatto fattibile» sarebbe
saltata su tutta la settimana.

Effetti collaterali controllati, nessun intervento necessario: l'olio in grammi contro un
«1 litro» in dispensa ha **unità diverse**, quindi `scorteMancanti()` non dà falsi allarmi
e `calcolaRiga()` non scala niente — la prudenza che c'era già copre il caso.

#### Blocco 2b — le ricette che usano quell'ingrediente (19/08/2026)

Il 2a («i valori vivono sul nome, non sulla riga di dispensa») era già stato fatto poche
ore prima — vedi «I valori per 100 g» più sotto. Questo è il seguito.

Scrivere che lo yogurt greco ha 10 g di proteine per 100 non cambia solo la voce di
dispensa: cambia il conto di **ogni ricetta che lo contiene**. Quelle ricette però le ha
approvate una persona, e i loro numeri erano una stima fatta con criterio.

⚠️ **Si propone, non si riscrive.** Dopo il salvataggio il messaggio dice quante ricette
sono coinvolte e offre «Rivedi i numeri»; il pannello mostra **vecchio e nuovo
affiancati** e aspetta. C'è anche l'annulla. È la stessa regola di «Mettilo in dispensa»:
quanto ne hai preso e cosa vuoi tenere non lo può sapere l'app.

⚠️ **O si sa tutto, o non si sa niente.** `ricalcolaRicetta()` rifà il conto **solo** se
*ogni* ingrediente ha i valori per 100 g e una quantità pesabile. Sommare i pezzi
conosciuti darebbe un totale più basso del vero e **dall'aria precisa**, che è il modo
peggiore di sbagliare. Quando non si può, il pannello **dice quali ingredienti mancano**,
così si rimedia invece di restare al buio.

⚠️ **`grammiDi()` accetta solo massa**, `g` e `kg`. «200 ml» di latte non si converte
(servirebbe la densità) e «2 fette» non è un numero. Fuori dai grammi non si stima.

⚠️ Il messaggio dice **prima** che il salvataggio è andato bene e **poi** la notizia
delle ricette: la notizia non deve mangiarsi la conferma di quello che hai appena fatto.

#### Blocco 1 — la spesa si completa da sola (19/08/2026)

**A · La riga nasce con quanto ne manca davvero.** `serveInTutto()` somma il fabbisogno
di un nome su tutti i pasti futuri, `quantoManca()` ci toglie quello che c'è in dispensa,
e `aggiungiAllaSpesa()` scrive il risultato in `qta`.

⚠️ **Prudenza uguale a tutto il resto: `null` non è un errore, è la risposta onesta.**
Basta una quantità non numerica («q.b.», «~1 kg», «2×100 g»), un'unità diversa fra due
pasti, o un «?» sulla voce di dispensa, e la quantità resta vuota invece di essere
verosimile. Una riga senza quantità si compra a occhio come si è sempre fatto; **una riga
con la quantità sbagliata fa comprare la cosa sbagliata**.

⚠️ **Oggi si riempie di rado, ed è la function che deve cambiare, non questo.** Il
generatore tiene le cose che mancano **fuori** dagli ingredienti del pasto (regola 9 dei
prompt): se non sono fra gli ingredienti, non c'è niente da sommare. Per questo
`mancantiDaPasti()` accetta **già** sia un nome scritto (`"Olio"`) sia un oggetto
(`{nome, qta}`): quando la function imparerà a dire anche quanto ne serve, non ci sarà da
tornare qui. **Quella modifica va nel deploy unico di fine giro.**

⚠️ La quantità si calcola sui **pasti che si stanno salvando**, non su `S.piano`: mentre
la settimana si genera, il piano nuovo non è ancora quello che l'app ha in mano.

**B · «Mettilo in dispensa» era già precompilato** (`apriAggiuntaDispensa()` scriveva già
`v.qta` nel campo). Quello che mancava era il gesto: ⚠️ **il fuoco ora si mette SOLO se
il campo è vuoto.** Con la quantità già scritta, mettere il cursore nel campo apre la
tastiera dell'iPhone, che si mangia mezzo schermo e spinge fuori proprio il bottone da
premere. La mano serve per correggere, non per confermare.

#### I valori per 100 g: si scrivono all'aggiunta, e l'app se li ricorda (19/08/2026)

Due cose chieste insieme dall'utente, ed erano due facce dello stesso difetto.

**1 · I campi c'erano solo in MODIFICA.** Cioè si potevano scrivere solo *dopo* aver
creato la voce — che è esattamente il momento in cui la confezione non è più in mano.
Ora `prot_100g` e `kcal_100g` stanno anche nel modulo di aggiunta della Dispensa, e
restano **facoltativi** come sempre.

**2 · La memoria.** Lo yogurt greco ha gli stessi valori a giugno e ad agosto: riscriverli
a ogni confezione è lavoro che non serve. Quello che si scrive una volta torna da solo.

⚠️ **NON è un database alimenti**, e la decisione del 13/08 che li vieta resta in piedi:
qui dentro finiscono **solo i nomi passati da questa cucina**, coi numeri copiati da una
persona dall'etichetta. Nessun archivio importato, nessuno scanner, nessun valore che
nessuno ha mai scritto.

⚠️ **Sta in `settings`, non in `localStorage`, e non è un ripiego: i telefoni sono due.**
Un ricordo che vive sul telefono lo avrebbe uno solo dei due, e l'altro continuerebbe a
riscrivere gli stessi numeri a mano. `settings` è una tabella chiave→valore e serve
esattamente a questo: la chiave è `nutrienti_noti`, il valore un JSON.
**Nessun file SQL da eseguire** — la riga è già stata creata, vuota.

⚠️ **La chiave si cerca con `stessoNome()`**, come ogni confronto fra nomi di cibo in
questa app: «uovo» e «Uova» sono la stessa cosa qui come dappertutto.

⚠️ **`ricordoDi()` guarda anche la dispensa vera**, non solo la memoria: è ciò che fa
funzionare la cosa **dal primo giorno** invece che dalla seconda volta in poi — i valori
scritti prima che questa memoria esistesse non sono persi — e copre il caso più comune,
la confezione nuova aggiunta accanto a quella che sta finendo.

⚠️ **Quello che scrivi vince su quello che l'app ricorda.** I due campi si riempiono da
soli solo se sono vuoti o se li aveva riempiti l'app (`nutriProposti`); appena ci si
scrive dentro, non li tocca più. E **lo dichiara**: sotto i campi compare da dove
vengono quei numeri. Un numero non deve mai arrivare dal nulla, neanche quando è comodo.

⚠️ **Entra anche dalla spesa.** `confermaAggiuntaDispensa()` applica il ricordo, perché è
da lì che le voci entrano davvero dopo la spesa: senza, la memoria sarebbe servita
proprio dove serve meno. Il messaggio finale dice che quei numeri sono i tuoi di prima.

⚠️ **`inserisciInDispensa()` riprova senza le due colonne** se non esistono, e
`conNutrienti()` le manda **solo quando hanno un valore**: su un database dove
`tabelle-nutrienti.sql` non è stato eseguito, aggiungere una voce — che ha sempre
funzionato — non deve smettere. Se il ricordo non si salva **non si dice niente e non si
ferma niente**: la voce di dispensa è già salvata, e quello è solo un promemoria.

#### «Svuota la lista» nella Spesa (19/08/2026)

Chiesto dall'utente: dopo aver fatto la spesa si vuole azzerare la lista **senza spuntare
una voce per volta**. C'era solo «Togli le spuntate», che presuppone il lavoro che si
vuole evitare.

⚠️ **Due tocchi, e il primo dice quante voci porta via.** È l'unica azione della lista
che cancella anche ciò che **non** è spuntato: dopo la spesa è proprio quello che serve,
ma un tocco per sbaglio col telefono in tasca butterebbe via la settimana. Il primo tocco
non cancella, mostra il numero e aspetta cinque secondi; poi il bottone si disarma da sé.
`renderSpesa()` chiama `disarmaSvuota()`: se la lista cambia mentre il bottone aspetta, il
numero scritto sopra non è più vero.

⚠️ **Sta su una riga sua**, non di fianco a «Copia la lista»: un'azione che cancella tutto
non deve stare a un dito di distanza da una che non cancella niente.

⚠️ **Il bug che si portava dietro l'annulla di «Togli le spuntate»**, trovato facendo
questo: reinseriva `{id, name, done}` scritto a mano e **perdeva quantità e `serve_il`**.
Le voci tornavano nude, senza «2 barattoli da 400 g» e senza «serve il 27». Ora tutte e
due le cancellazioni in blocco annullano da `rimettiTutte()`, che passa da
`rimettiInLista()` — l'unico posto che sa riportare indietro una riga intera.
**Un annulla che restituisce una cosa diversa da quella tolta non è un annulla.**

#### La v6 — Blocco 5: il diario dice chi ha mangiato (19/08/2026)

Era l'ultima cosa rimasta indietro. Il campo `meals_log.chi` esisteva già e nessuno lo
guardava: adesso ogni riga del diario porta una pillola col nome, e il modulo «aggiungi a
mano» ha la sua voce per dirlo.

⚠️ **La traduzione si fa solo al momento di mostrare, mai una volta per tutte.**
`meals_log.chi` è scritto dal punto di vista di **chi ha in mano il telefono**: `io` non
è una persona, è «io che sto usando l'app». La stessa riga letta dall'altro telefono
parla di qualcun altro. `chiDalDiario()` è il gemello all'incontrario di `chiPerDiario()`
e passa sempre dal profilo selezionato **qui**. Per lo stesso motivo `cambiaIo()` adesso
richiama anche `renderDiario()`: senza, cambiando profilo il diario continuerebbe a
chiamare le righe col nome di prima.

⚠️ **Campo vuoto → non si scrive niente.** Le righe scritte prima che il campo esistesse
non dicevano chi, e far comparire un nome sarebbe raccontare una cosa che nessuno ha
detto. Anche nel modulo la voce è facoltativa, ed è la prima della tendina.

⚠️ **`finora oggi` NON è stato toccato**, e il limite noto resta: somma tutte le righe
del giorno senza distinguere chi. Filtrarlo per `chi` sarebbe sbagliato finché quel campo
è relativo al telefono — prima andrebbe spostato sui nomi veri, come dice il blocco 3.
Mostrare il nome è una cosa, contarci sopra è un'altra.

#### I nomi appaiati: l'app impara, il piano resta com'è (20/08/2026)

Nessun file SQL: la memoria sta in `settings`, chiave **`alias_nomi`**, un JSON di
gruppi (`[["Straccetti di tacchino","Fesa di tacchino"], …]`). Stessa ragione di
`nutrienti_noti`: **i telefoni sono due**, e una cosa imparata da uno la deve sapere
anche l'altro.

Quando un ingrediente del piano non si riconosce in dispensa ma c'è una voce che gli
somiglia, l'avviso delle scorte lo chiede: *«in dispensa c'è «Fesa di tacchino»: è la
stessa cosa?»*. Rispondendo di sì l'app **impara l'appaiamento**.

⚠️ **IL PIANO NON SI RISCRIVE, ed è una scelta dell'utente del 20/08/2026.** Il primo
disegno era «rinomina l'ingrediente nei pasti futuri»; è stato **capovolto**: è la
dispensa che cambia col tempo — la confezione nuova, il nome sulla busta — non il modo
in cui una persona chiama le cose. Riscrivere il piano sarebbe farla parlare come il
frigo. Si tocca solo `settings`, mai `plan_meals`, e prot/kcal non si toccano mai.

⚠️ **Da lì in avanti vale OVUNQUE**, perché entra in `stessoNome()` come prima cosa
(prima di qualunque regola di grammatica: è la risposta di una persona): avviso delle
scorte, scalo di «Ho cucinato questo», deduplica della spesa, sostituti, valori per
100 g. Un appaiamento che valesse in un punto solo lascerebbe l'app a sapere una cosa
in una schermata e a ignorarla in quella accanto.

⚠️ **Proprio perché vale ovunque, un appaiamento sbagliato SCALA la dispensa sbagliata.**
Per questo: si conferma **rispondendo a una domanda**, mai da soli; ogni conferma lascia
un **annulla**; e si toglie in un posto solo, facile da trovare — ☰ menu → **«I nomi che
ho appaiato»**, dove c'è l'elenco con «Togli» su ogni riga. L'annulla **rimette il testo
di prima**, non toglie il gruppo: se la risposta ne aveva uniti due, toglierlo
separerebbe anche quello che era già appaiato da prima.

⚠️ **`nomiSimili()` è STRETTA APPOSTA**: le parole che contano di un nome devono essere
**tutte dentro** quelle dell'altro (`stessoNome()` senza il vincolo della stessa
lunghezza). «Petto di pollo» ⊂ «Fetto Petto di pollo» ✓, «Parmigiano» ⊂ «Parmigiano
grattugiato» ✓; ma **«Filetti di merluzzo» vs «Filetti di pollo» tace**, perché
condividono solo «filetti» e proporre il pollo al posto del merluzzo sarebbe un danno
vero. *Una domanda sbagliata fatta con sicurezza è peggio del silenzio.*

⚠️ Per lo stesso motivo nel menu c'è **«Appaiane due tu»**, due campi e un bottone: la
regola stretta tace su tutti i casi in cui i due nomi si somigliano senza che uno
contenga l'altro — «straccetti di tacchino» e «fesa di tacchino» è proprio quello.
Senza quei due campi la prudenza smetterebbe di essere prudenza e diventerebbe un muro.

⚠️ **`forseInCasa()` resta com'era e continua a zittire per primo**: le somiglianze si
cercano **dopo**. Altrimenti l'avviso si riempirebbe di «forse è questo» e spingerebbe
fuori dalle prime sei i guai veri. Il costo dichiarato: «Petto di pollo» resta silenzioso
(`forseInCasa` trova «pollo» dentro «Fetto Petto di pollo»), e per appaiarlo si passa dai
due campi del menu.

**Tre guai, tre parole diverse** (`comeManca()`): `poco` → «servono 5, ne hai 3»;
`assente` → «non ce l'hai in dispensa»; `nome` → «non l'ho riconosciuto in dispensa».
⚠️ Quando sono **tutti** di tipo `nome`, il titolo dell'avviso cambia («usa nomi che non
ritrovo in dispensa») e **il tasto «Rigenera da…» sparisce**: non manca niente da rifare,
e una settimana costa sette generazioni delle trenta del giorno — un tasto che non serve,
lì, costa soldi. Sui guai di tipo `nome` non si offrono nemmeno i **sostituti**: la cosa
ce l'hai già, cambiare il piatto sarebbe la risposta sbagliata alla domanda giusta.

**E il messaggio dopo il salvataggio dice COSA.** `cosaNonTorna(iso, pasto)` sostituisce
il vecchio «da qui in avanti qualcosa non torna più»: nomina i primi due, con le parole di
`comeManca()`. ⚠️ **Nomina prima i guai del pasto appena salvato** (il campo `dove` sa già
giorno e pasto): l'avviso guarda tutti i giorni futuri, e rispondere del merluzzo di
venerdì a chi ha appena salvato lunedì è come non rispondere.

#### Rinominare una voce di dispensa (20/08/2026)

Sotto la matita della Dispensa, insieme a quantità, categoria e valori per 100 g, c'è
adesso anche il **nome**.

⚠️ **Rinominando, il vecchio nome diventa un alias del nuovo DA SOLO e SENZA CHIEDERE.**
Non è una comodità: il nome non è un'etichetta, è la **chiave** con cui la voce si incontra
col piano, con la lista della spesa e con le ricette. Cambiandolo, tutti i pasti già
scritti col nome di prima smetterebbero di combaciare **in silenzio**, e il giorno dopo
l'avviso direbbe che manca una cosa che sta in frigo. Chiedere non avrebbe senso: non è una
preferenza, è ciò che tiene in piedi quello che era già scritto. Resta togliibile dal menu
come tutti gli altri.

⚠️ **L'alias si scrive solo se serve**: da «uova» a «Uova», o da «Patate» a «patate»,
`stessoNome()` li appaia già da sé (`daAppaiare` controlla proprio questo). Un appaiamento
inutile sarebbe solo una riga in più da leggere nel menu.

⚠️ **Nome vuoto: si rifiuta.** Una voce senza nome sparirebbe dalla lista e non
combacerebbe più con niente.

⚠️ **Se l'alias non riesce a salvarsi, il nome resta cambiato e lo si dice** — «non sono
riuscito a collegare «X»: i pasti già scritti così potrebbero risultare mancanti». È
l'unica volta in cui un'operazione accessoria che fallisce va gridata: qui il danno non è
una comodità mancata, è il piano che si scolla dalla dispensa.

#### ⚠️ LE FREQUENZE NON SONO MAI STATE PROVATE (verificato il 20/08/2026)

Il Blocco 3 della v8 è **scritto e online, ma non ha mai girato nemmeno una volta.**
Verificato interrogando il database: `plan_meals.categoria_principale` è **vuoto su tutte
le righe**, senza eccezioni. Quel campo lo scrive solo il generatore, quindi vuol dire che
**dopo il deploy delle frequenze non è mai stata generata una settimana**: la settimana
22-28 è entrata da un import SQL, che non passa dal modello.

Di conseguenza **non è mai stato provato niente** di tutto questo:

- che il modello scriva `categoria_principale` prendendola dall'elenco esatto;
- che `verificaFrequenze()` conti giusto sulle righe vere;
- i minimi, i massimi, la priorità pesce → legumi → carne bianca → uova;
- la rotazione dei formati (§4 quater) e `rotazione_max` sui cereali;
- il riquadro del riepilogo che dichiara i minimi scoperti.

⚠️ **Non darlo per funzionante e non scriverlo come fatto.** La prima settimana generata
davvero è anche il primo collaudo di tutto il blocco: conviene guardarla riga per riga.

#### Il punto di ripristino (20/08/2026)

⚠️ **Nessun file SQL**: sta in `settings`, chiave **`piano_ripristino`**.

«Rigenera da dopodomani» cancella e riscrive giorni già decisi, a volte scritti a mano uno
per uno, e **prima di oggi quella cancellazione era definitiva**. Ora, appena prima di
scrivere, `segnaRipristino()` fotografa i pasti che stanno per sparire; il menu ha
**«Torna a com'era ›»**.

⚠️ **La fotografia si fa PRIMA di scrivere e prima di TUTTI E DUE i modi** — la staffetta
scrive dal server, il ripiego dal telefono, ma quello che cancellano è lo stesso. Il punto
d'aggancio è uno solo, subito prima del bivio in `avviaGenerazione()`.

⚠️ **Se la fotografia non riesce e c'era qualcosa da perdere, NON SI GENERA.** È l'unico
posto dell'app in cui un'operazione accessoria che fallisce ferma quella principale: qui
non è una comodità, è la rete sotto il trapezio. Riprovare costa un tocco, scrivere sopra
senza rete costa la settimana.

⚠️ **`ambito` è separato da `righe`, e non è un dettaglio.** Rimettendo a posto bisogna
cancellare anche i pasti che PRIMA non c'erano — quelli che la generazione ha creato dal
nulla. Se si cancellasse solo dove si riscrive, un pasto inventato sopravviverebbe al
ripristino. I pasti su «Lascia» restano **fuori** dall'ambito: nessuno li tocca, e metterli
dentro vorrebbe dire cancellarli al ripristino.

⚠️ **SE NE TENGONO TRE** (`MAX_RIPRISTINI`), ed è una scelta motivata. Uno solo non basta:
il guaio non si vede quasi mai subito — si rigenera giovedì, poi venerdì, e ci si accorge
il sabato che è stato giovedì a mangiarsi la settimana scritta a mano; col punto singolo la
seconda rigenerazione avrebbe già cancellato la fotografia che serviva. Dieci sarebbero
peggio di tre: ogni punto è una copia intera dei pasti, e soprattutto **scegliere fra dieci
date è un lavoro nuovo per chi guarda**, proprio nel momento in cui si ha fretta. Tre
coprono le operazioni di una stessa sessione, che è quando gli errori si notano.
⚠️ C'è anche un tetto di **peso** (`MAX_PESO_RIPRISTINI`): se la pila cresce troppo cadono
i **più vecchi**, mai i più recenti. E `puntiRipristino()` accetta anche la forma vecchia a
punto singolo, così chi l'aveva già salvata non la perde.

⚠️ **È reversibile**: `tornaComEra(i)` fotografa com'è *adesso* prima di rimettere, e la
mette **in cima** alla pila — così il tasto si può sempre disfare e nessuno resta bloccato
dalla parte sbagliata. ⚠️ `updated_at` non si rimette indietro: la riga è stata toccata
adesso.

⚠️ **Vale anche per «Sostituisci e salva»** (`sostituisciIngrediente()`), che riscrive il
piano quanto una rigenerazione. Lì però, se il punto non riesce a salvarsi, **il cambio si
fa lo stesso**: l'annulla immediato del toast c'è comunque, e il danno possibile è un
ingrediente in due o tre pasti, non la settimana intera. È la differenza fra le due, ed è
voluta.

#### La conferma che NOMINA i pasti scritti a mano (20/08/2026)

Prima di aprire la passata, se in quei giorni c'è anche **un solo** pasto `a_mano`, si
mette in mezzo una schermata (`PS.fase = 'conferma'`, `vistaConferma()`) che li elenca:
giorno, pasto e **nome del piatto**.

⚠️ **Non è un «sei sicura?»**: un avviso che chiede solo conferma si impara a scacciare.
«3 pasti» non fa riconoscere la settimana costruita a mano, «sabato 22 · pranzo — Pane,
prosciutto crudo e mozzarella» sì.

⚠️ **E dice la verità intera, non un pericolo gonfiato**: quei pasti partono su «Lascia» e
**non vengono riscritti**, a meno che non sia una persona a toccarli nella schermata dopo.
Spaventare per una cosa che non succede è lo stesso difetto dell'ambra usata a sproposito.

⚠️ Sta in `apriPassata()` e **non nei singoli tasti**: gli ingressi sono tre («Rigenera
da…», ↻ sul giorno, «Allunga il piano») e una regola scritta tre volte si scolla al primo
cambiamento.

#### Il backup sa quanto è vecchio (20/08/2026)

Sotto il tasto del backup, `avvisoBackup()` scrive: «l'ultimo backup è del 18/08, e da
allora il piano è stato riscritto 2 volte: quel file non è più aggiornato». Il conto sono
i punti di ripristino più recenti dell'ultimo scaricamento.

⚠️ **Un backup è utile solo se si sa quanto è vecchio.** Un file scaricato prima di due
rigenerazioni racconta un calendario che non esiste più, e chi lo tiene da parte crede di
essere al sicuro: è la stessa bugia di un numero che sembra più completo di quello che è.

⚠️ **Sta in `localStorage` e non in `settings`**: è un fatto di QUESTO telefono. Il file è
nella cartella Download di chi l'ha scaricato, e l'altro telefono non ce l'ha.

**E il tasto dice quanto pesa premerlo** (`pesoRigenerazione()`): «riscrive 5 giorni
(9 pasti) · 2 pasti scritti da te, che lascio stare», dentro il tasto e non accanto — la
riga accanto la si legge dopo aver già premuto. ⚠️ I pasti a mano si contano **a parte**
perché non vengono riscritti (partono su «Lascia»): dirlo insieme al resto è ciò che
distingue un avvertimento da una promessa.

`sovrascriviPasti(ambito, righe)` è ora il **posto unico** che cancella e riscrive:
`scriviRighe()` (le generazioni) e `tornaComEra()` ci passano tutte e due.

#### La proposta di sostituto era diventata rumore (20/08/2026)

Dodici carboidrati per la polenta, otto verdure per l'insalata. Tre correzioni.

**1 · Massimo tre, ordinati per quantità utile.** `sostitutiPer()` calcola quanto ogni voce
**copre** di quello che serve (2 = ce n'è il doppio) e mette davanti le più abbondanti.
⚠️ Le voci di cui non si può sapere la quantità restano in elenco — davanti al frigo si
giudica meglio che con una regola — ma **dopo** quelle che si sanno bastare.

**2 · Via il conteggio.** «Hai 8 cose simili» non dice se sono utili né quali sono: adesso
la riga nomina la più abbondante, «hai Nasello e altro: ne uso uno?».

**3 · L'interruttore «sostituibile» per categoria** (`CHIAVE_SOSTITUIBILI`, in `settings`;
menu → «Quello che ho insegnato all'app»). ⚠️ **Non è una preferenza estetica**: dove
l'ingrediente è la **fonte proteica** scambiarlo è ragionevole — merluzzo o nasello, la
cena è quella; dove l'ingrediente **È il piatto** — cereali, verdura, frutta — scambiarlo
non è una sostituzione, è un altro piatto, e quello si decide dalla matita.
Accesi di partenza: pesce · carne bianca · carne rossa · salumi · uova · formaggi ·
latticini freschi · legumi. ⚠️ I **salumi** stanno fra gli accesi (cotto e crudo si
scambiano davvero), la **frutta secca** fra gli spenti (lì è una guarnizione, e cambiarla
cambia il piatto).

#### ⚠️ La proposta funzionava SOLO dove l'app non sapeva contare (20/08/2026)

Segnalato come «regressione dello split»: Provolone e merluzzo non proponevano niente,
«Pulled chicken» sì. **Non era lo split, e non era il flag `sostituibile`** — verificato
aprendo l'app online e premendo i bottoni: rispondevano tutti e tre. Era la **quantità
scritta sull'ingrediente**:

| ingrediente | chiede | in dispensa | esito |
|---|---|---|---|
| Pulled chicken | `2 confezioni` | tutto in grammi | unità incomparabili → **non scarta nessuno** |
| Filetti di merluzzo | `450 g` | 300 + 100 + 50 g | li **scarta tutti e tre** |
| Provolone | `150 g` | Scamorza `250` senza unità | illeggibile → a pari merito → **tagliata dal tetto di 3** |

⚠️ **La conclusione è più scomoda del bug**: «Pulled chicken» funzionava **per caso**.
Dove l'app sapeva fare il conto, buttava via la risposta. Quattro correzioni:

1. **Non si scarta più quello che non basta**: resta in elenco **dicendo quanto ne manca**.
   Tre pesci in freezer non sono «niente».
2. **E se lo scegli lo stesso, la differenza va in LISTA SPESA** con la data del primo
   pasto che lo aspetta. Era il buco vero: lasciar scegliere un candidato insufficiente
   senza dire altro fa **nascere il pasto zoppo in silenzio**, e te ne accorgi ai fornelli.
   ⚠️ Il conto lo fa `quantoManca()`, lo stesso della spesa ovunque, e **tace quando non è
   sicuro** invece di inventare. ⚠️ L'annulla toglie anche quella riga di spesa — ma
   **solo se l'abbiamo messa noi**: una riga che c'era già non si tocca.
3. **Il tetto di 3 vale nell'avviso, non nel pannello** (`sostitutiPer(nome, serve, tutti)`):
   il muro da togliere era la riga dell'avviso, il pannello è dove stai **scegliendo**.
4. **A pari merito niente alfabeto**, che faceva sembrare la Mozzarella più adatta della
   Scamorza. Quattro gradini: basta di sicuro · non basta e si sa di quanto · quantità
   illeggibile · niente.

⚠️ **Un solo modo di dire «non basta»**: `ammanco(serve, voce)`. Lo usano l'ordine, la riga
del pannello e la lista della spesa. Tre conti separati si scollerebbero, e il pannello
finirebbe a scrivere «basta» su una cosa messa in fondo perché non bastava.

⚠️ **`serve` si porta dietro anche sui mancanti ASSENTI.** Veniva attaccato solo ai guai di
tipo «poco»; il fabbisogno però era già calcolato (`s.n`, `s.u`). Senza portarlo avanti il
pannello restava muto **proprio su merluzzo e provolone**, cioè i due casi per cui tutto
questo era nato. Trovato collaudando dal vivo, non leggendo il codice.

⚠️ **Doppioni FRA i candidati** (`chiaveAlias` in `sostitutiPer`): «Fesa di tacchino» e
«Fesa tacchino» sono due righe di dispensa ma una cosa sola, e sprecavano un posto dei tre.
Il controllo c'era già in `nomiSimili()` e mancava qui. ⚠️ **`stessoNome()` invece non
sbaglia**: `di` è una parola di servizio e viene scartata prima di contare, quindi per il
confronto quei due nomi sono identici. La fusione delle due righe resta lavoro del Giro 2,
ma è pulizia di dati, non una regola rotta.

#### 📌 DUE RIGHE PER LA STESSA COSA: l'app ne legge UNA SOLA (trovato il 20/08/2026)

Domanda dell'utente, verificata nel codice. In dispensa ci sono «Fesa di tacchino · 1 kg» e
«Fesa tacchino · 100 g»: per `stessoNome()` sono **lo stesso nome**, ma restano **due
righe**. E `cercaInDispensa()` fa `S.inv.find(...)`: **torna la prima e basta.**

⚠️ **Non somma, e non lo dice.** Conseguenze, tutte reali:

- **il controllo scorte sotto-conta**: se il piano chiede 450 g e le due righe fossero
  «400 g» e «100 g», l'app leggerebbe solo 400 e direbbe *«servono 450, ne hai 400»* mentre
  in frigo ce ne sono 500. ⚠️ Nel caso vero di oggi non dice nemmeno quello: la prima riga è
  in `kg` e il fabbisogno in `g`, unità diverse, quindi la prudenza fa **tacere l'avviso** —
  che è meno dannoso ma altrettanto cieco;
- **lo scalo di «Ho cucinato questo» tocca una riga sola** (`righeDaProposta()` →
  `cercaInDispensa()` → `calcolaRiga()`): scala il chilo e lascia i 100 g **fermi per
  sempre**. Le due righe restano scollate, ed è la parola giusta;
- **i valori per 100 g** (`ricordoDi()`) si leggono dalla prima riga, quindi scriverli
  sull'altra non serve a niente;
- ⚠️ e **quale sia «la prima» dipende dall'alfabeto**: `S.inv` è ordinato per nome, quindi
  oggi vince «Fesa **di** tacchino» perché *d* viene prima di *t*. Rinominando una voce il
  vincitore può cambiare **senza che niente lo segnali**. Una regola incidentale è peggio di
  una regola sbagliata: quella almeno è prevedibile.

⚠️ **Il rimedio NON è sommare dappertutto.** Per *leggere* («ne ho abbastanza?») sommare è
giusto. Per *scalare* no: quale confezione apri non lo può sapere l'app, ed è esattamente il
caso in cui la regola di casa dice di non indovinare — semmai si sceglie una riga e **si
dichiara quale**, o si chiede.

Da fare col **Giro 2**, insieme alla rinomina e alla fusione: lì la fusione delle due righe
è la cura, questo è il motivo per cui serve.

#### Un numero da solo: si chiede una volta (20/08/2026)

⚠️ **Nessun file SQL**: `settings`, chiave **`unita_note`**.

«Scamorza affumicata · 250» e «Ricottina · 2» sono 250 grammi e 2 pezzi. L'app le trattava
tutte e due come **conteggi** — non grammi e non illeggibili, ma «250 di unità vuota», che
si confronta solo con un'altra unità vuota.

⚠️ **È il caso peggiore, perché è giusto e sbagliato insieme senza che nessuno se ne
accorga**: fa funzionare «Uova: servono 5, ne hai 3» e allo stesso tempo impedisce di
sapere se 250 di scamorza bastano per 150 g di provolone. E siccome per spostare proteine e
calorie servono grammi veri (`grammiDi()` accetta solo `g` e `kg`), il ricalcolo non parte e
i numeri del pasto si svuotano.

Indovinare è vietato — *250 forme di scamorza?* — quindi si chiede.

⚠️ **La domanda compare SOLO su un numero nudo** (`numeroNudo()`) e sparisce appena smette
di esserlo: mostrarla sempre sarebbe chiederlo a chi ha già risposto scrivendo «250 g».

⚠️ **«Sono pezzi» NON riscrive niente** (`conUnita()`): il numero nudo è già la forma giusta
per i pezzi. È ciò che permette alla domanda di **solo aggiungere** informazione, senza mai
rompere i confronti che oggi funzionano — le uova continuano a combaciare.

⚠️ **Si può cambiare idea, ed è il punto**: la scelta si vede e si corregge **dalla matita
in dispensa**, accanto ai valori per 100 g. Una risposta sbagliata data una volta non deve
ripetersi in silenzio per sempre.

⚠️ **Se l'app completa il numero lo DICE**, in tutti e due i moduli: quello che si salva
dev'essere quello che si è scritto, o si deve poter vedere che non lo è.

#### «latticini» si è spaccato in due (20/08/2026) — ✅ deploy fatto

Con una categoria sola l'app proponeva **lo yogurt greco al posto del provolone**. Un
formaggio è un piatto e ne conta al massimo uno a settimana; uno yogurt è una colazione e
non conta niente. Erano due cose diverse tenute insieme da un nome — e la vecchia riga
delle frequenze lo diceva già **in una nota** («solo come PIATTO: yogurt, kefir e latte
non contano»), cioè con le parole invece che con lo schema.

- **formaggi** (il tetto di 1 a settimana resta qui): Mozzarella · Scamorza affumicata ·
  Stracchino · Ricottina · Parmigiano grattugiato · Cheddar 250)
- **latticini freschi** (nessun vincolo): Kefir · Yogurt greco

⚠️ **Burro e panna non stanno in nessuna delle due: sono «condimenti e grassi».** Deciso
dall'utente il 20/08/2026, e il motivo è preciso: sono grasso di cottura, e con «latticini
freschi» acceso fra i sostituibili tenerli di là voleva dire **proporre il kefir al posto
del burro**.

⚠️ **La scrittura sul database è già stata fatta** il 20/08 dall'app (8 voci di dispensa,
la riga delle frequenze rinominata e una nuova). `split-latticini.sql` la documenta ed è
rieseguibile senza danni, ma **non serve eseguirlo**.

✅ **Il deploy è stato fatto il 20/08.** Serviva perché l’elenco delle categorie è scritto anche nel prompt della
Edge Function (`categoria_principale`), e una parola fuori elenco non viene contata da
nessuna parte.

⚠️ `categorieSostituibili()` traduce una vecchia scelta salvata: se in `settings` c'è
ancora la parola `latticini`, si legge come le due categorie che ne sono nate — perdere in
silenzio una scelta già fatta sarebbe peggio che chiederla di nuovo.

#### ⚠️ Il secondo bug della sostituzione: il pannello non rispondeva (20/08/2026)

Nel pannello del pasto, toccare un'alternativa **non faceva niente**, e non era lo stesso
bug del salvataggio corretto poche ore prima: sono due punti diversi della stessa funzione
mai riuscita.

`apriSostitutiInRiga()` inserisce il riquadro delle alternative con
`insertAdjacentHTML('afterend')`, cioè come **fratello** della riga dell'ingrediente. Il
gestore però faceva `scelto.closest('.mano-riga')`, e `closest()` guarda **verso l'alto**
fra i genitori: non trovava niente, tornava `null`, e `applicaSostitutoInRiga()` andava a
vuoto in silenzio. Ora si prende `previousElementSibling` del riquadro, e se per qualunque
motivo non è la riga giusta **lo si dice** invece di non fare niente.

⚠️ **La regola che ne esce**: `closest()` sale, non scende e non guarda di fianco. Ogni
volta che un pannello viene inserito *accanto* a qualcosa, il legame fra i due va tenuto
esplicito — e un gesto che non produce nulla non deve mai finire in silenzio.

#### ⚠️ Il bug che teneva rotta la sostituzione da sempre (20/08/2026)

`sostituisciIngrediente()` scriveva con `.eq('id', r.id)` — ma **`plan_meals` non ha una
colonna `id`**: la chiave è `(day, pasto)`, ed è il motivo per cui si salva con
`upsert(..., { onConflict:'day,pasto' })`. `r.id` era sempre `undefined`, quindi **il
cambio falliva ogni singola volta**, dal giorno in cui è stato scritto (v8 Blocco 2). Lo
stesso errore stava nell'annulla. Ora è `.eq('day', …).eq('pasto', …)` in tutti e due.
⚠️ **Se serve indicare un pasto, si indica con giorno e pasto**: `chiavePasto(r)`.

#### I contorni liberi (20/08/2026)

⚠️ **Nessun file SQL**: `settings`, chiave **`contorni_liberi`**.

Nel campo ingrediente ogni tanto finisce della prosa — «Patatine fatte in friggitrice ad
aria» con quantità «a lato», «verdure di stagione». Non combacia con niente e resta
mancante **per sempre**, e *un avviso che non si può mai spegnere smette di essere un
avviso*. Dall'avviso si può rispondere **«è un contorno libero: non contarlo»**.

⚠️ **Toglie solo dal controllo scorte**: l'ingrediente resta scritto nel pasto, si legge e
si cucina. Si smette di CONTARLO, non di farlo.

⚠️ **Si propone per ultima, e solo quando non c'è altro da fare**: né un nome da appaiare
(`simili`) né qualcosa da usare al suo posto (`alt`). «Non contarlo più» è una rinuncia —
se esiste una risposta vera, la rinuncia non deve nemmeno comparire.

⚠️ Il controllo sta **in cima al ciclo** di `scorteMancanti()`, prima ancora della somma
delle quantità: contare a metà sarebbe peggio che non contare.

⚠️ **E spariscono anche dalla LISTA DELLA SPESA**, che è la seconda metà della stessa
promessa: se hai detto che di quella cosa non vuoi più sentir parlare, ricomparire al
supermercato sarebbe rimangiarsela da un'altra porta. Il filtro sta in `mancantiDaPasti()`
e nei `manca` di «Crea la ricetta» — cioè **dove la lista del modello diventa la tua**.
⚠️ Quello che scrivi **tu a mano** nella spesa non viene filtrato: lì la richiesta è tua e
comanda. La regola è: si filtra l'automatico, mai un gesto esplicito.

Si rimettono dal menu, e se ne possono aggiungere a mano — serve per i nomi che l'avviso
non mostra mai (per esempio quelli che `forseInCasa()` zittisce già).

#### ⚠️ Un totale metà completo e metà parziale è una bugia (20/08/2026)

Trovato sui dati veri: lunedì 24 diceva **«TOT Ciprian 153 g proteine · 470 kcal»**. Le
proteine erano complete (68 + 44 + 41 delle fisse); le 470 kcal erano **solo colazione e
shaker**, cioè zero dai due pasti, perché il piatto scritto a mano aveva le proteine e non
le calorie. 153 g di proteine da sole superano le 600 kcal: il numero era impossibile, e
la dichiarazione stava in piccolo sotto, dove sembrava riferirsi a tutti e due.

La causa: **un contatore solo**, `senzaNumeri`. Il 18/08 la «e» era diventata «o» per
*accorgersi* del buco, ma non per *dire quale*. Ora `totaleGiorno()`, `totaleFinora()` e
`fisseDelGiorno()` contano **`senzaProt` e `senzaKcal` separati**.

⚠️ **LA REGOLA, e vale ovunque si scriva un numero**: un numero parziale non si scrive mai
come uno completo, e **la differenza sta accanto al numero**, non in piccolo sotto — la
riga sotto la si legge dopo, e intanto la cifra grande è già stata creduta. Il numero resta
ma cambia mestiere: `numeroParziale()` scrive **«almeno 470 kcal»** in grigio, che è un
minimo ed è vero, dove «470 kcal» era un totale ed era falso. ⚠️ Se invece non si sa
niente **non si scrive nemmeno lo zero** («le kcal non ci sono ancora»): uno zero è una
bugia, un'assenza è un'assenza.

Vale in tutti e quattro i punti che sommano — il TOT di Ciprian, il TOT di Lorena,
«finora oggi» e il riepilogo della settimana, dove per lo spazio è un **`+`** attaccato al
numero, spiegato lì sotto. ⚠️ Se un giorno se ne aggiunge un quinto, si passa da
`numeroParziale()`: quattro copie della stessa regola si scollerebbero come è già successo.

`notaFisse()` di conseguenza non dice più «(senza numeri)» quando ne manca uno solo, ma
«(senza le kcal)» o «(senza le proteine)» (`cosaManca()`).

#### Le voci fisse di Ciprian: 41 g e 470 kcal (19/08/2026)

Il brief del 19/08 dichiara la base giornaliera fuori dai pasti del piano: porridge
overnight, shaker a metà mattina, frutta il pomeriggio — **470 kcal e 41 g**. L'app ne
dava per scontati 37 g e 390 kcal (colazione 20 · yogurt 17), e i totali del giorno
uscivano più bassi del conto vero. `FISSE_CIPRIAN` ora dice 19 g · 300 kcal la colazione
e 22 g · 170 kcal lo spuntino.

⚠️ **UNA VOCE SOLA PER TIPO DI PASTO**, e non è stile: `fisseDelGiorno()` sostituisce
ogni voce con le registrazioni di diario che hanno lo **stesso `pasto`**. Due voci con
`pasto:'spuntino'` (lo shaker e la frutta, che sarebbe stato più fedele) verrebbero
sostituite tutte e due dalle stesse righe, cioè **contate doppie**. Per questo shaker e
frutta stanno insieme in una voce sola, e il nome lo dice.

#### La barra in basso: la tastiera e il rullo (20/08/2026) — ⚠️ DA COLLAUDARE

Due richieste, fatte insieme perché toccano lo stesso elemento.

**1 · Il bug della tastiera.** Aprendo la tastiera nel pannello «scrivo io» la barra delle
5 tab **saltava in mezzo allo schermo**. Su Safari iOS un elemento `position:fixed` si
appoggia al *layout viewport*, che con la tastiera aperta **non si accorcia** — mentre
quello che si vede sì: la barra resta ancorata a un fondo che ormai sta sotto i tasti.
Ora `misuraTastiera()` se ne accorge e la barra sparisce mentre scrivi.

⚠️ **IL TOAST ERA LO STESSO IDENTICO DIFETTO**, e sistemare solo la barra avrebbe spostato
il bug invece di chiuderlo. Verificato che siano gli unici due: cercando `position:fixed`
in tutto il file, gli altri (velo, pannello del menu, sfondo) sono ancorati **in alto** o a
tutto lo schermo, e la tastiera non li tocca.

⚠️ **Il toast però NON sparisce: si sposta.** È lì che vive «Annulla», e farlo sparire
mentre la tastiera è aperta vorrebbe dire togliere il modo di tornare indietro proprio a
chi ha appena salvato. Sale di `--tastiera`, l'altezza misurata a runtime, e si appoggia
sopra i tasti.

⚠️ **La misura si fa su `documentElement.clientHeight`, non su `window.innerHeight`**: il
primo è il layout viewport e sta fermo, il secondo su iOS si muove anche quando la barra
degli indirizzi si rimpicciolisce — e avremmo scambiato uno scorrimento per una tastiera.
Si sottrae anche `visualViewport.offsetTop`, perché iOS mettendo a fuoco un campo sposta la
finestra visibile. Soglia a **120 px**: sotto, non è una tastiera.

**2 · Il nascondi-al-rullo.** In giù si toglie, in su torna.

⚠️ **Le etichette RESTANO** — richiesta esplicita: le icone da sole non bastano, «Cucino»
e «Ricette» non si indovinano. Qui non si è toccato il contenuto della barra, solo dove
sta. I bersagli restano a `min-height:52px` (sopra i 44 richiesti) e non c'è nessun colore
scritto a mano: solo token.

⚠️ **Tre soglie, e ognuna evita un difetto preciso:**
- **8 px** di movimento minimo: meno di così non è una decisione, è il tremolio del dito
  fermo sul vetro, e la barra sfarfallerebbe stando quasi immobili;
- **90 px** dall'alto: in cima la barra **c'è sempre**. È il posto in cui si torna quando
  ci si è persi, e trovarla nascosta proprio lì sarebbe la cosa peggiore;
- **col la tastiera aperta il rullo tace**: iOS scorre da solo per portare il campo in
  vista, e la barra si metterebbe a comparire e sparire mentre scrivi. Alla chiusura si
  riparte dal punto in cui la pagina è finita, o il primo movimento del dito verrebbe letto
  come un rullo lunghissimo.

⚠️ **Le due trappole che erano state annotate, e come sono state evitate:**
- si muove col **`transform`**, mai col `position`: `misuraTestata()` legge
  `getComputedStyle(nav).position` per decidere `--nav-alt`, che tiene ferme le
  intestazioni appiccicose di Dispensa e Piano. Cambiare posizionamento le sposterebbe
  tutte;
- il **`padding-bottom` del body resta**: lo spazio in fondo continua a essere riservato
  anche quando la barra non si vede, altrimenti la pagina sobbalzerebbe a ogni comparsa.

⚠️ **Sul computer non vale niente di tutto questo**: lì la barra sta in alto e scorre con
la pagina, e il blocco `@media (min-width:760px)` annulla tutte e due le regole. Nascondere
al rullo una barra che sta in cima vorrebbe dire farla sparire senza motivo.

⚠️ **Cambiando tab la barra torna** (`mostraLaBarra()`): una schermata appena aperta è in
cima, e trovarla nascosta dove non hai ancora scorso niente sarebbe inspiegabile.

Se `window.visualViewport` non c'è (browser vecchi) non succede niente e tutto si comporta
come prima: il nascondi-al-rullo funziona lo stesso, il pezzo della tastiera no.

#### Rimasto indietro, minore

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
| `tabelle-staffetta.sql` | la tabella `plan_jobs`: la settimana che il server genera da sé. ✅ eseguito |
| `tabelle-ricette-complete.sql` | il contenuto delle ricette (ingredienti, prot, kcal, tempo) e il filo `plan_meals.ricetta_id`. ✅ eseguito |
| `tabelle-spesa-blocco5.sql` | `shopping_list.serve_il`: la riga della spesa sa per quando serve. ✅ eseguito |
| `tabelle-costi.sql` | `generator_usage.tok_in/tok_out` e `registra_token()`: la stima di spesa. **Da eseguire** |
| `tabelle-nutrienti.sql` | `inventory_items.prot_100g/kcal_100g`, facoltativi. ✅ eseguito |
| `tabelle-kcal-lorena.sql` | `plan_meals.kcal_lorena`: le calorie della porzione di Lorena. ✅ eseguito (verificato il 20/08) |
| `tabelle-frequenze-v8.sql` | `frequenze_categorie` + `plan_meals.categoria_principale`: la griglia della nutrizionista. ✅ eseguito (verificato il 20/08) |
| `tabelle-categorie-v8.sql` | `inventory_items.categoria`: che COSA è un alimento, più la migrazione delle 59 voci. ✅ eseguito (verificato il 20/08) |
| `tabelle-blocco6.sql` | procedimento e sostituzioni sui pasti, procedimento sulle ricette, `plan_jobs.svuota_frigo`. ✅ eseguito |
| `split-latticini.sql` | «latticini» → *formaggi* + *latticini freschi*: 8 voci di dispensa e la griglia. ✅ **già applicato dall'app il 20/08**, sta nel repo come storia — non rieseguirlo |
| `import-settimana-22-28.sql` | i 14 pasti del 22-28 agosto, **prima versione (18/08)**. ✅ eseguito, poi superato |
| `import-spesa-22-28.sql` | lo spesone di quella prima versione. ✅ eseguito, poi superato |
| `import-settimana-22-28-v2.sql` | ⚠️ **la settimana che vale**, rifatta il 19/08. Sostituisce le 14 righe del 22-28 |
| `spesa-22-28-v2.sql` | ⚠️ **lo spesone che vale**, rifatto il 19/08. Toglie dieci voci del piano vecchio, aggiorna le altre |
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
