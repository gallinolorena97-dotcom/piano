# Piano & Dispensa — stato del progetto

> Promemoria per le sessioni future di Claude Code. Leggilo prima di toccare qualsiasi cosa.

> 📚 **La cronologia completa sta in `STORIA.md`**, che non si legge a ogni sessione: com'è
> andata, in che ordine, quali guasti sono stati chiusi e perché una decisione è stata presa
> così. Qui restano **solo le regole che valgono sempre** e i passaggi che deve fare l'utente.
> Se una regola qui sotto sembra strana o eccessiva, il suo perché è là.

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

Su ogni tabella c'è **una sola policy**, `"accesso libero"`:
`for all to anon, authenticated using (true) with check (true)`. RLS resta accesa ma dice
sì a tutti: **chiunque apra l'URL legge e scrive**. Nel frontend non c'è nessun codice di
autenticazione; l'unico resto è `auth:{ persistSession:false }` nella `createClient`, che
serve proprio a tenere spenta la gestione utenti della libreria.

⚠️ **È una decisione dell'utente, presa l'11/08/2026 dopo aver provato la strada del login
e dopo che il rischio le era stato spiegato. Non rimetterla in discussione a ogni sessione.**
Il perché — magic link, codici a 6 cifre, template email — sta in `STORIA.md`.

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

### Le regole di prudenza dello scalo

- **Si calcola solo quando il calcolo è sicuro.** Quantità come `~1 kg`, `sì`, `2×100 g`,
  `? da verificare` non vengono mai stimate: si chiede il valore.
- `leggiQta()` conserva la **coda** del testo (`110 g · scad. 29/8` → `30 g · scad. 29/8`):
  **le scadenze non devono sparire scalando.**
- Ogni conferma lascia un **annulla** che ripristina dispensa, ricetta e diario.
- La function può proporre piatti con **max 2 ingredienti mancanti, mai la fonte proteica**,
  e **almeno una delle 3 proposte dev'essere fattibile** con quello che c'è.
- Il diario è **un registro, non una pagella**: niente punteggi, streak o grafici.

### I due profili

Tabella `profiles`, due righe. La riga sotto il titolo **segue il profilo selezionato**:
mostra il suo nome e i **suoi** obiettivi, e per chi non ne ha scrive «nessun obiettivo»
senza numeri. ⚠️ **I target non sono universali e non vanno letti da `settings`.**

⚠️ Il selettore «su questo telefono sono» sta in `localStorage` con chiave `piano-io`.
**Non è un login e non protegge nulla**: entrambi i profili sono modificabili da entrambi.

⚠️ **Il frontend manda solo `chi` e `io_slug`: i profili li rilegge la function dal
database**, non arrivano dal telefono. Le tre voci sono `io` · `io_e_x` · `solo_x`, gli
stessi valori accettati da `meals_log.chi`.

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

### Il design — ⚠️ regola per ogni schermata futura

**Si usano i token, non si inventano colori.** Stanno in cima al `<style>` di `index.html`,
sezione «1 · TOKEN». Se serve un colore che non c'è, **si aggiunge un token lì e lo si usa**:
mai un valore scritto a mano dentro una regola.

- **Palette** lavanda e menta. Il pastello sta su sfondi e superfici, **mai sul testo**:
  `--viola-testo` esiste apposta, perché il viola pieno su `--lavanda-soft` dà 4.43, sotto
  la soglia AA. Ogni combinazione in uso è stata misurata: la più bassa è 5.18.
- **Tipografia**: Fraunces per i titoli, Outfit per l'interfaccia. Due famiglie, basta.
- **Navigazione**: su telefono in basso, su desktop in alto (`@media (min-width:760px)`).
  `misuraTestata()` misura le altezze a runtime ed è ciò che tiene giuste le intestazioni
  appiccicose della Dispensa.
- **Icone e illustrazioni**: tutte SVG dentro `index.html`, in `<defs>`. Nessuna immagine
  esterna, nessun download.
- **Icona dell'app**: barattolo col germoglio, rigenerabile con `scratchpad/icona.ps1`.

#### Le conseguenze dell'inventario grafico

⚠️ **Nel corpo del CSS ci sono zero colori scritti a mano**: è il modo per accorgersene se
ne rientra uno. **L'unica eccezione** sono i colori dentro i `data-URI` SVG (lo scarabocchio,
le stelline, la freccia del menù a tendina, il bordo della testata): un data-URI **non legge
le variabili CSS**, quindi lì il valore va cambiato anche a mano. Dove capita c'è
l'avvertenza sul posto.

⚠️ **Se serve un simbolo si passa da `ico(nome, misura)`**, mai da un'emoji: un'emoji la
disegna il sistema, cambia forma fra iPhone e computer e non prende il colore che le si dà.
Il tratto di tutte le icone è dichiarato 1.8 sul `<g>`.

⚠️ **`.avviso` ha due toni e non sono intercambiabili**: `.attenzione` (pesca) = qualcosa non
torna e tocca a te; `.info` (lavanda) = ti sto raccontando cosa succede. A furia di vedere
l'ambra per cose normali non la si guarda più quando serve davvero.

⚠️ **L'icona del calendario resta** (si tinge soltanto): toglierla renderebbe le date
impossibili da inserire su iPhone.

⚠️ **Gli stati vuoti sono illustrati**, e la pentola di Cucino non bolle:
`.vuoto-ill .vapore path{animation:none}` — in uno stato vuoto non sta cuocendo niente.

#### La firma: la testata

⚠️ **Una firma timida non è una firma prudente, è una firma che non c'è.** Se una cosa deve
essere riconoscibile, o ha peso o non vale il posto che occupa. Il primo tentativo fu bocciato
proprio per questo: il racconto sta in `STORIA.md`.

La testata **non è una barra sopra l'app, è l'etichetta del barattolo**: un colore solo,
`--lavanda-soft` piatto, lo stesso quadrato su cui sta il barattolo dell'icona. Il barattolo
è a 54px e senza riquadro; l'onda è un **segno** di 4.6px di `--viola` pieno, lo stesso gesto
dello scarabocchio sotto i titoletti di sezione.

⚠️ Tre conseguenze da non disfare:
- il token `--grad-testata` è **cancellato**: ⛔ non rimetterlo, e non rimettere il vecchio
  `.arco-testata`;
- pillola e tasto del menu hanno fondo **bianco**: su una testata lavanda un oggetto lavanda
  sparisce;
- `.h-title em` usa `--viola-testo`, **non** `--viola`; e `<meta name="theme-color">` è
  lavanda come la testata, altrimenti su iPhone la barra di stato taglia in due la testata
  invece di continuarla.

⚠️ Se cambia `favicon.svg`, cambia anche `#i-marchio`: il senso è che siano la stessa cosa.

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

### Il calendario — tab Piano

Legge **`plan_meals`**, una riga per pasto. Lo schema sta in `tabelle-piano-v5.sql`.

- **Striscia dei 7 giorni** appiccicata sotto la testata. I chip sono `flex:1 0 42px`:
  **sette devono starci tutti sullo schermo di un iPhone**.
- **Tre trattamenti**: `passato` (mostra il **diario**, non il piano) · `confermato` (oggi e
  domani) · `bozza` (da dopodomani). Lo stato scritto nel database vince; se manca lo deduce
  `statoGiorno()`. ⚠️ Il trattamento cambia **bordo ed etichetta, mai il contrasto del testo**.
- ⚠️ **I numeri sono solo di Ciprian**, voci fisse comprese. Le fisse sono **scritte sotto il
  totale**: un numero non deve mai arrivare dal nulla. Nei pasti di sola Lorena non compare
  nessun numero. Nei giorni con Fuori/Libero il totale scende e lo si dichiara:
  **non si compensa mai** nei giorni vicini.
- ⚠️ **`chi` usa i nomi veri** (`ciprian`/`entrambi`/`lorena`), non gli slug. La traduzione
  verso `profiles` sta nella costante `SLUG_DI_CHI` **e in nessun altro posto**.
- ⚠️ **`dolce` ha un riquadro suo** (`.nota.dolce`), non si mescola agli ingredienti.
- ⚠️ **Gli scongelamenti si mostrano su `scongelare_il`**, non sul giorno del pasto
  (`promemoriaDi()`). È il motivo per cui la tabella ha una riga per pasto e non per giorno.
- Se la tabella non esiste, la tab lo dice e **il resto dell'app continua a funzionare**
  (`S.pianoErr`): il calendario è facoltativo come spesa e profili.
- Si cambia giorno **strisciando col pollice** sulla scheda e con le **frecce ← →**. Il gesto
  si ascolta solo sulla scheda, e serve un movimento di almeno 55 px chiaramente orizzontale,
  altrimenti si rovinerebbe lo scorrimento normale.

### «Genera la settimana»

Tre schermate: la **passata** (sette giorni × due pasti, tutta precompilata su «A casa ·
Tutti e due»), la **generazione**, il **riepilogo**.

⚠️ **Una settimana costa 7 tacche, non 1.** Le chiamate al modello sono sette vere:
contarne una lascerebbe le altre senza freno, e il freno è l'unica cosa fra l'indirizzo
pubblico e la carta di credito. Con 30/giorno restano 4 settimane al giorno. Sulla prima
chiamata la function controlla che il margine basti per tutte (`generazioniUsateOggi()`):
meglio fermarsi prima che a metà settimana.

⚠️ **Il campo data ha `min = oggi`: il passato non si riscrive mai.**

⚠️ Ogni tocco nella passata ridisegna **solo quel pasto** (`ridisegnaPasto`), altrimenti il
testo della nota che stai scrivendo sparirebbe.

Ogni chiamata riceve `gia_pianificato`, `resta_prima` e `settimana` (la passata intera): i
primi due tengono in piedi la **coerenza di magazzino**, il terzo la **catena degli avanzi**.
Fuori e liberi non si generano.

#### ⚠️ `max_tokens` è pensiero + risposta

Con il ragionamento adattivo quel numero è un tetto su **pensiero e risposta messi insieme**,
non solo sulla risposta.

⚠️ **`MAX_TOKENS_SETTIMANA` è 32000 e non va riabbassato**: è un tetto, non una spesa —
alzarlo non costa di per sé. Il massimo di Sonnet 5 è 128000.

⚠️ **`troncato` non è un errore e non va trasformato in uno**: se la function mandasse
`{tipo:'errore'}`, la settimana si fermerebbe e il lavoro tornerebbe sulle spalle di chi
guarda. Il client rifà da sé i pasti mancanti un giorno alla volta
(`rigeneraGiornoPerGiorno()`), senza chiedere niente: è un intoppo tecnico, non una decisione.

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

### L'avviso delle scorte

⚠️ **È TUTTO TESTO CALCOLATO: zero generazioni.** Un riassunto scritto dal modello
costerebbe una tacca a ogni ridisegno — cioè a ogni tocco — e direbbe cose che l'app sa già
contare da sé.

- **una riga di sintesi**; i gruppi vuoti non si nominano, «0 da comprare» è rumore;
- **tre gruppi**: *Da comprare* · *Ce l'hai, scritto diverso* · *Ne hai poche*.
  ⚠️ **La frase la dice il TITOLO del gruppo, non ogni riga**: è tutta la differenza fra un
  avviso e una tabella;
- **la conseguenza su ogni voce**: non «Provolone» ma «Provolone — lunedì 24/08 · Torta
  salata»;
- **ordine per data** del pasto che si ferma per primo: l'alfabeto non dice niente su cosa
  fare stasera.

⚠️ **Quattro per gruppo e non sei in tutto**: con un tetto unico un gruppo lungo si mangia
gli altri, e spariscono proprio i tipi di problema che la sintesi ha appena annunciato.

⚠️ **«Te la indico io» sta su TUTTI i mancanti, anche in «Da comprare».** Quel gruppo
contiene proprio i casi che l'app non sa riconoscere: toglierlo di lì vorrebbe dire
nasconderlo dove serve di più, lasciando come unica uscita la rinuncia.

⚠️ **«Non ora» nasconde l'avviso fino a ricaricare** (`S.avvisoVia`, non `localStorage`):
il problema è vero e non va dimenticato.

⚠️ **Prudenza**: `scorteMancanti()` si allarma solo quando il conto è sicuro. Quantità non
numeriche, unità diverse, voci segnate «?» non producono avvisi — meglio tacere che gridare
al lupo.

**Tre guai, tre parole diverse** (`comeManca()`): `poco` → «servono 5, ne hai 3»; `assente` →
«non ce l'hai in dispensa»; `nome` → «non l'ho riconosciuto in dispensa».
⚠️ Quando sono **tutti** di tipo `nome`, il titolo cambia e **il tasto «Rigenera da…»
sparisce**: non manca niente da rifare, e una settimana costa sette generazioni — un tasto
che non serve, lì, costa soldi. Sui guai di tipo `nome` non si offrono nemmeno i sostituti.

⚠️ **Ogni riga è toccabile e porta al primo pasto che la richiede**, col pannello già aperto
(`portaAllIngrediente`). Serve soprattutto quando il mancante non manca davvero, cioè quando
il nome è scritto diverso. Le righe sono alte **36 px e non 44**, contro la regola: sei righe
da 44 spingerebbero la striscia dei giorni fuori schermo proprio mentre l'avviso chiede di
guardare il piano — e la riga è larga quanto l'avviso, quindi il bersaglio orizzontale è tutto.

### ⚠️ «Non seguire più» è per il NOME, mai per il pasto

`contorni_liberi` è **una chiave sola** e `contornoLibero(nome)` è interrogata in tre punti
— il controllo scorte, la lista della spesa, i mancanti di «Crea la ricetta» — e **in
nessuno c'è traccia del pasto**.

⚠️ Una esclusione **per singolo pasto** resterebbe da costruire ex novo (vivrebbe su
`plan_meals`, non in `settings`): **non è stata fatta, e non va data per esistente.**

⚠️ **Regola generale**: quando un'etichetta descrive uno scopo, quello scopo dev'essere vero
nel codice. Un nome che promette più di quello che fa è un guasto che non dà errori.

### La guardia prima di una rinuncia

Se la categoria dell'ingrediente ha un **minimo settimanale** nella griglia,
`guardiaContorno()` si mette in mezzo e rimanda a «te la indico io».

⚠️ **Solo i minimi, non i massimi**: rinunciare all'avviso su una cosa di cui bisogna
mangiare *almeno* tot fa saltare un obiettivo; su un massimo, al più non si dice che ce n'è
troppa — guaio più piccolo e di segno opposto.

⚠️ **«Lascia stare» è il bottone PIENO**: il primo tocco che capita dev'essere quello che
non rompe niente.

⚠️ **Il silenzio di un avviso che non arriva più è la cosa più difficile da vedere che
esista**: per questo si dice prima, non si scopre dopo.

### Gli attriti d'uso

- **Il contenuto dietro la striscia dei giorni**: la striscia è una pillola con i margini, e
  il contenuto le passava dietro riapparendo negli spazi ai lati. C'è una fascia opaca larga
  quanto lo schermo (`.settimana::before`), e tutto ciò a cui si salta ha
  **`scroll-margin-top`**: il browser si ferma più in basso da solo, ovunque, senza conti da
  rifare in dieci punti del JavaScript.
  ⚠️ `misuraTestata()` misura anche la striscia (`--striscia-alt`) **ma quel valore non entra
  in nessuna posizione appiccicosa**: Dispensa e Piano restano dove sono sempre stati.
- **Il campo del nome** è un `textarea` di una riga che va a capo e cresce
  (`aggiustaAltezza()`), con una **×** dentro che compare solo quando c'è testo. Invio non va
  a capo: un nome su due righe non combacerebbe con niente.
  ⚠️ **Il cursore non si forza a fine parola**: forzarlo romperebbe proprio il caso da
  salvare — toccare in mezzo per correggere una lettera. La × copre il bisogno vero.
- **La dispensa**: filtri per categoria col conteggio, e ricerca che usa `stessoNome()` **più**
  il vecchio «contiene», perché scrivendo «moz» si vuole arrivare a Mozzarella.
  ⚠️ Compaiono **solo le categorie che hanno qualcosa dentro**: un filtro che dà zero
  risultati è un modo di perdere tempo. ⚠️ Il filtro **non sta in `localStorage`**: è una cosa
  che si fa adesso per trovare una voce, non un'impostazione — ritrovarla accesa domani
  vorrebbe dire aprire la dispensa mezza vuota senza capire perché.
- ⚠️ **`restaDovEri()` va DOPO il ridisegno**: prima la pagina ha ancora l'altezza vecchia e
  il browser non lascerebbe scorrere fin lì.

### La memoria fra le settimane

Quante volte un piatto è tornato nell'ultimo mese, e che cosa non compare da troppo.
Si guarda dal menu, **«Nell'ultimo mese»**, e **il generatore legge la stessa cosa da sé**.

⚠️ **DUE FONTI, E NON SI SOMMANO.** `plan_meals` dice che cosa era in tavola ed è **completo**
per i giorni che copre; `meals_log` dice che cosa è stato registrato ed è **sparso**. Un
pasto verificato sta in tutti e due: sommarli lo conterebbe **due volte**. Il piano comanda
e il diario riempie solo i buchi — la stessa regola delle voci fisse, dove la registrazione
vera **sostituisce** quella data per scontata invece di aggiungersi.

⚠️ **LA MEMORIA DICHIARA FINO A DOVE ARRIVA.** La schermata scrive l'orizzonte in cima, dice
quanti pasti ha davvero, e avverte quando sono pochi. ⚠️ Sotto gli **8 pasti** il prompt dice
al modello di **ignorarla**: *meglio nessuna preferenza che una preferenza costruita sul
nulla.*

⚠️ **«Non compare da un po'» vale SOLO per quello che è comparso almeno una volta**
nell'orizzonte: di quello che non c'è mai stato non si può dire da quanto manca.

⚠️ **Al modello si dà il CONTEGGIO, non i trenta giorni di righe** (`descriviMese()`): dargli
l'elenco vorrebbe dire trenta giorni di token a ogni chiamata, per sette chiamate a settimana.

⚠️ **La regola viene per ULTIMA** (`MEMORIA`, interpolata nei due mestieri come `CONDIMENTI`):
non tocca proteine, divieti, frequenze né fattibilità. Se per ripescare un piatto dimenticato
si dovesse sforare un massimo o comprare qualcosa, si lascia perdere — è una preferenza fra
pari, non un vincolo. E **l'avanzo previsto non conta come ripetizione**.

⚠️ **Niente punteggi e niente confronti**: il numero a destra è grigio e non colorato —
*un conteggio in rosso o in verde diventa un voto.*

I nomi si raggruppano con `stessoNome()`: «Riso alla cantonese» e «riso cantonese» sono lo
stesso piatto, e contarli come due vorrebbe dire non accorgersi di averlo fatto due volte.

#### ⚠️ Come si verifica se una colonna esiste, invece di chiederlo

La chiave publishable sta in `index.html` e le policy sono «accesso libero», quindi basta
chiedere al database se una colonna c'è, **senza leggere nessun dato**:
`GET /rest/v1/<tabella>?select=<colonna>&limit=0` con gli header `apikey` e `Authorization`.
Risponde **200 se la colonna c'è, 400 se manca**.

⚠️ È più onesto che chiedere due volte la stessa cosa a chi ha già risposto.
⚠️ Non funziona su `generator_usage`, che non ha policy ed è invisibile alla chiave pubblica.

#### ⚠️ Non chiedersi PERCHÉ manca, chiedersi SE manca

Un ripiego agganciato alla causa copre solo la causa che conosce. Dopo ogni blocco gira
`completaMancanti()`, che confronta i pasti chiesti con quelli arrivati e rifà i mancanti un
giorno alla volta, **qualunque sia stata la causa**. Quando non manca niente non costa nulla.

⚠️ **Si prova una volta sola**: un buco dichiarato è meglio di una rincorsa infinita. I pasti
scartati perché non erano stati chiesti finiscono in `console.warn`.

### La verifica del giorno

In cima alla tab Piano: **«Ieri hai mangiato questo?»**, con tre risposte per pasto — sì ·
no, altro · saltato — più la correzione di chi c'era davvero.

⚠️ **Un pasto è verificato quando nel diario c'è la sua riga** (`giaNelDiario`). Lo stato sta
nel database, non nel telefono: chi risponde per primo evita all'altro di scalare la dispensa
una seconda volta. Per questo anche **«saltato» scrive nel diario**.

⚠️ Si guarda indietro **al massimo tre giorni**, e c'è un «Più tardi» che rinvia a domani.
Oltre i tre giorni non è più una verifica, è un debito da riscuotere: **e i giorni saltati non
sono colpe.**

⚠️ **Il «sì» non ha un pannello suo**: riusa quello di «Ho cucinato questo». `apriCucinato` ha
un quarto argomento `opz` — `quando` (la verifica registra *ieri*, non oggi), `titolo`,
`conRicetta`, `dopo`. Senza `opz` tutto si comporta esattamente come prima.

⚠️ **`conRicetta:false` nella verifica**: confermare di aver mangiato quel che era previsto
non vuol dire mettere il cuore a quel piatto. Altrimenti i ♥ si riempirebbero da soli e non
vorrebbero più dire niente.

⚠️ **«No, altro»** registra nel diario e **non tocca la dispensa** — non si sa con che cosa
sia stato fatto — **e lo dice**.

⚠️ **Due vocabolari per `chi`**: `plan_meals.chi` usa i nomi veri, `meals_log.chi` usa le voci
relative a chi usa l'app. La traduzione sta in `chiPerDiario()` **e in nessun altro posto**.

### I numeri del giorno

Il diario accetta **colazione · spuntino · pranzo · cena**, in quest'ordine.

⚠️ **La regola contro il doppio conteggio.** Se per quel giorno una colazione o uno spuntino
vero finisce nel diario, la voce data per scontata viene **SOSTITUITA, mai sommata**
(`fisseDelGiorno()`), e `notaFisse()` scrive sotto il totale quale delle due si sta usando.
**Un numero non deve mai arrivare dal nulla.** Se la registrazione vera è senza numeri, entra
come 0 e **il totale si dichiara parziale**: non si inventa niente.

⚠️ **UNA VOCE SOLA PER TIPO DI PASTO**, e non è stile: `fisseDelGiorno()` sostituisce ogni
voce con le registrazioni che hanno lo **stesso `pasto`**. Due voci con `pasto:'spuntino'`
verrebbero sostituite tutte e due dalle stesse righe, cioè **contate doppie**.

⚠️ **«Finora oggi» non è legato a una persona: è legato all'obiettivo.** La riga compare per
i profili con `prot_target` o `kcal_target` compilati (`haObiettivo()`), chiunque siano.
Le **voci fisse restano di Ciprian** (`fisseDi()`): sono la sua colazione e il suo yogurt, un
altro profilo non le eredita — sarebbero numeri arrivati dal nulla.

⚠️ **Limite noto**: «finora oggi» somma tutte le righe di diario del giorno **senza
distinguere chi**, perché `meals_log.chi` è relativo a chi sta usando l'app. Finché conta una
persona sola va bene; se anche Lorena si desse un obiettivo, andrebbe prima spostato
`meals_log.chi` sui nomi veri.

#### ⛔ Fuori per scelta, deciso il 13/08/2026 — non riproporlo

**Database alimenti · codici a barre · streak.** I numeri restano **dichiarati o
stimati**. La precisione, quando servirà, arriverà dai campi facoltativi `kcal_100g` e
`prot_100g` sulle voci di dispensa (punto C del blocco «dopo i Blocchi 3 e 4»), non da
un archivio esterno né da uno scanner.

### Modifica a mano e rigenerazione

**Il quarto modo della passata, «Lascia»**, vuol dire *non toccare questo pasto*: in una
settimana nuova non scrive niente nel calendario, in una rigenerazione tiene quello che c'è.
Di conseguenza **il salvataggio non cancella più il giorno intero**: cancella pasto per pasto
solo quello che sta per riscrivere.

**Modifica a mano.** Due ingressi: la matita **✎ su ogni pasto** (anche su un pasto che non
c'è: è così che si riempiono i buchi) e il tocco sul pasto. Solo da **oggi in avanti**
(`modificabile()`): sul passato c'è il diario.

Le tre regole:

1. ⚠️ **Proteine/kcal vuote → mai inventate.** `salvaPastoAMano()` scrive `null` e il totale
   del giorno si dichiara **parziale**. I due campi spariscono del tutto sui pasti di sola
   Lorena.
2. ⚠️ **Può rompere i giorni dopo**: dopo il salvataggio gira `scorteMancanti()` e, se
   qualcosa non torna, il messaggio rimanda all'avviso in cima. **Non si rigenera mai niente
   da soli.**
3. ⚠️ **È `confermato` e `a_mano:true`, mai bozza**, e nella passata di una rigenerazione
   parte su «Lascia»: non si rifà senza che tu lo chieda.

**La rigenerazione** non ha un motore nuovo: riapre la stessa passata precompilata da
`S.piano` (`apriPassata({dal, quanti, daPiano, titolo})`). Tre ingressi: ↻ nella fascia del
giorno (**solo giorni futuri, mai oggi**), «Rigenera da …» nell'avviso delle scorte, e
«Allunga il piano» quando il piano copre meno di 7 giorni da oggi.

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

### ⚠️ Il database è la verità, il telefono è una finestra

Ogni blocco finito si scrive **subito** in `plan_meals` (`salvaBlocco()`), non alla fine.
Se il filo cade, quello che c'era prima è già al sicuro e **ricaricando si vede lo stato
reale**. `scriviRighe()` è il pezzo condiviso col salvataggio finale, e `PS.salvati` tiene il
conto di cosa è già scritto perché non si riscriva due volte.

Conseguenze da non disfare:
- il riepilogo **non è più il momento in cui si salva**. Per questo «Butta via» diventa
  «Chiudi» quando qualcosa è già stato scritto: ⚠️ **un tasto non deve promettere di
  cancellare una cosa che non cancella**;
- `chiudiPassata()` **rilegge dal database** se qualcosa è stato scritto, altrimenti si
  vedrebbe la settimana di prima;
- la **ricevuta** (`ricevuta()`) conta su `S.piano` appena riletto, non sulla schermata:
  «nel calendario ci sono 11 pasti su 14» è una verifica, «salvato» era una promessa.

⚠️ **`guastoDiRete()` conosce le frasi di più browser** (Chrome dice `Failed to fetch`,
Safari `Load failed`): se salta fuori un altro browser con parole sue, **si aggiunge lì** e la
capiscono tutti. ⚠️ **Dentro solo frasi dei browser, mai parole italiane generiche**: bastava
la parola «connessione» perché un messaggio utile venisse scambiato per un filo caduto e
sostituito da uno fuorviante. Chi è davvero senza rete lo dice `navigator.onLine`.

**Il battito** manda `{tipo:'battito'}` ogni 10 secondi mentre il modello pensa. ⚠️ **Non
basta da solo** — con lo schermo spento il filo cade lo stesso — ed è per questo che la difesa
vera è il salvataggio blocco per blocco.

#### ⚠️ Una difesa si applica a TUTTI i posti che hanno la stessa forma

Il modo `ricetta` era l'unico dei tre mestieri a non mandare niente prima del battito, cioè
per dieci secondi: misurato, il primo byte usciva dopo 11 secondi, e su un telefono quella è
la finestra in cui il filo cade. La difesa era già stata costruita due volte, e al terzo
mestiere non era mai stata messa.

⚠️ **Ogni mestiere che chiama il modello apre con un `{tipo:'stato'}` immediato**, e ha il
**battito protetto** da un `try/catch`: dentro un `setInterval` un errore non lo prende il
`try` che sta lì accanto, è un'altra battuta.

⚠️ **Una frase buona per tutto manda a controllare la cosa sbagliata.** Due punti diversi
dicevano la stessa frase su guai opposti — la risposta che non arriva e la ricetta che non si
salva — e la frase parlava di una terza cosa ancora. Ogni guasto dice **quale** cosa non è
riuscita.

⚠️ **I toast si sostituiscono**: le brutte notizie viaggiano **dentro** il messaggio finale,
non in un toast loro, altrimenti quello di fine copre quello del guasto un istante dopo
averlo mostrato. E «pronto» su una cosa non salvata **è una bugia**.

#### Come si legge la versione DAVVERO deployata, invece di chiederlo

Supabase → Edge Functions → cosa-cucino → **Code**: nella console della pagina,
`monaco.editor.getModels()[0].getValue()` restituisce la sorgente online intera. Il numero
di righe identifica il commit (`git show <commit>:edge-function-cosa-cucino.ts | wc -l`;
Monaco ne conta una in più per il fine-file), e da lì si rilegge quella versione in locale.

⚠️ Serve perché il deploy è manuale e la domanda «è stato fatto?» è quella che in questo
progetto si è ripetuta di più. **Il pannello lo sa già: si guarda invece di chiedere.**


### ⚠️ Il tetto vero di Supabase: 150 secondi

Wall clock **150 s sul piano gratuito** (400 s a pagamento), CPU 2 s — ma l'attesa della
risposta del modello **non conta**, è rete. ⚠️ **Lo stesso tetto vale per i lavori in
sottofondo** (`EdgeRuntime.waitUntil`): è il motivo per cui «spostare tutto sul server» da
solo non basta e la staffetta deve spezzare per giorno.

- **Un giorno per chiamata** (`blocchiDa()`), sette chiamate a settimana. Due giorni
  viaggiavano all'85% del tetto: bastava una dispensa più grande ed era Supabase a spegnere
  la funzione, il flusso si troncava e sul telefono usciva «Load failed».
- ⚠️ **Sotto il giorno singolo non conviene scendere**: il pensiero non si dimezza dimezzando
  il lavoro, c'è un costo fisso di ~65 s per leggere dispensa e vincoli, e si pagherebbe due
  volte per lo stesso lavoro.

### La staffetta — la settimana si genera sul server

⚠️ Se `tabelle-staffetta.sql` non è eseguito l'app non se ne accorge: `S.staffetta` resta
falso e si genera col modo vecchio, senza errori.

| Anello | Cosa fa |
|---|---|
| `settimana-avvia` | scrive subito i pasti fuori/liberi, crea la riga in `plan_jobs`, **risponde subito** e in sottofondo lancia il primo passo |
| `settimana-passo` | genera **un giorno**, lo scrive, aggiorna la riga di lavoro, **sveglia l'anello dopo** e si spegne |
| `settimana-riprendi` | rimette in corsa una staffetta ferma, dal primo giorno mancante |

⚠️ **Perché a staffetta e non un unico lavoro in sottofondo**: `EdgeRuntime.waitUntil()` tiene
viva la funzione dopo la risposta, **ma resta dentro gli stessi 150 secondi**. Ogni anello
riparte col budget pieno.

⚠️ **Nessun anello si fida del precedente**: rilegge `plan_jobs` dal database.

⚠️ **Una staffetta ferma NON riparte da sola**: l'app offre «Riprendi». Una catena che si
rincorre consumerebbe credito senza che nessuno guardi. Se muore così male da non riuscire
nemmeno a dirlo, l'app se ne accorge dal tempo (`sembraFermo()`: più di 4 minuti senza
aggiornamenti, mentre un giorno ne impiega ~1,5).

⚠️ `inSottofondo()` prende `EdgeRuntime` da `globalThis` invece di dichiararlo: una
dichiarazione nostra si scontrerebbe con quella del runtime al deploy.

⚠️ **Lato app non c'è nessun motore, solo una finestra**: `avvisoLavoroHtml()` dice cosa sta
facendo il server e `guardaLavoro()` ricontrolla ogni 6 secondi. Se chiudi non cambia niente.

⚠️ **Il gemello da tenere allineato**: `rigaDiPasto()` nella function fa lo stesso mestiere
di `righeDaSalvare()` nel frontend. **Se cambia lo schema, si toccano tutte e due.**

⚠️ Il contesto del prompt è scritto **una volta sola** (`costruisciContestoSettimana()`) e lo
usano il modo staffetta e il modo vecchio: due copie si sarebbero scollate alla prima modifica.

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

#### ⛔ Decisioni chiuse — non riaprirle

- **Database alimenti, codici a barre, streak: fuori.** Deciso il 13/08/2026.
  I numeri sono dichiarati o stimati; la precisione arriverà dai campi `kcal_100g` e
  `prot_100g` sulle voci di dispensa.
- **Mascotte: cancellata.** Provata (un pancake) e scartata. Gli stati vuoti e
  l'attesa usano **oggetti**, mai personaggi. Non riproporla.
- **Icona: la B, il barattolo.** Definitiva. È già nel repo, non va rigenerata.
- **Stile: la passata ricca è approvata** nella versione attualmente online.

#### ▶️ PROSSIMO PASSO

**Aggiornato il 22/08/2026.**

⚠️ **SERVE UN DEPLOY**, e ora sono **due cose insieme** — è il motivo per cui le modifiche
alla function si raggruppano:

1. aperto il 20/08 la sera: la **memoria fra le settimane** tocca il `.ts` — la lettura
   dell'ultimo mese, `descriviMese()` e la costante `MEMORIA` nei due mestieri. Finché non
   è fatto, l'app mostra la pagina «Nell'ultimo mese» ma **il generatore non la usa**:
   genera esattamente come prima, senza errori;
2. aperto il 22/08: il **silenzio di undici secondi** del modo `ricetta` (qui sotto).
   Finché non è fatto, «Crea la ricetta» continua a cadere sul telefono — i messaggi
   dell'app sono già corretti e dicono cosa è successo, ma la causa resta.

✅ Il deploy **precedente** era in pari. Fatto dall'utente il **20/08/2026**, subito dopo
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

### La spesa collegata al piano

**A · La riga sa per quando serve.** I mancanti si portano dietro il giorno che li aspetta
(`mancantiDaPasti()`), e la lista si ordina per quello; le voci scritte a mano vanno in fondo.
Su una riga si legge «serve domani», in ambra se è oggi o domani.
⚠️ Se la stessa cosa serve per due giorni, **vince il primo**: è quello che decide quando
conviene averla in casa. La deduplica confronta i nomi con `stessoNome()`.

**B · Spuntare un acquisto propone di metterlo in dispensa.**
⚠️ **Si propone, non si fa**: quanto ne hai preso e dove lo metti non si può sapere, e qui non
si inventano numeri. Vuota → `?`, cioè da verificare.
⚠️ Se quella cosa **in dispensa c'è già** non si propone niente: si dice cosa c'è e si lascia
decidere. Confermando, la riga **esce dalla lista**: una cosa entrata in dispensa non è più da
comprare. L'annulla rimette tutto.
⚠️ **Il fuoco si mette SOLO se il campo è vuoto**: con la quantità già scritta, il cursore
aprirebbe la tastiera dell'iPhone, che si mangia mezzo schermo e spinge fuori il bottone da
premere. La mano serve per correggere, non per confermare.

**C · «Dipende dalla spesa» sparisce quando è coperto** (`riquadroSpesa()`): ⚠️ **un avviso
che resta acceso quando il problema non c'è più smette di essere un avviso.** Si nomina
mancante solo ciò che non si trova né con `cercaInDispensa()` né con `forseInCasa()`.

⚠️ **`toast()` ha un quarto parametro, l'etichetta del bottone**, e torna sempre ad «Annulla»
se non la si passa: un toast che si tenesse addosso la scritta del precedente prometterebbe
la cosa sbagliata.

### Procedimento, sostituzioni, svuota-frigo

**1 · Il procedimento.** Passi numerati, coi tempi veri **dentro** i passi: chi cucina ha le
mani sporche e legge una riga per volta.
⚠️ **La lunghezza la decide il piatto**: due o tre righe se è banale. Chi salta un
procedimento lungo per una cosa ovvia si abitua a saltarli tutti. Tetto a dieci passi,
applicato lato codice (`passiPuliti()`), non solo chiesto nel prompt.
⚠️ **Sta su `plan_meals` E su `recipes`, e non è una svista**: sulla ricetta è la versione che
resta e si riusa (per una persona), sul pasto è come si fa **quel** giorno. Un pasto generato
dalla settimana non ha una ricetta collegata: se il procedimento vivesse solo sulle ricette,
quei pasti resterebbero muti proprio dove serve di più.
⚠️ **Nel calendario è CHIUSO** (`<details class="proc">`): il piano si guarda dieci volte al
giorno per sapere cosa si mangia e si apre due volte per cucinare.

**2 · Le sostituzioni.** ⚠️ **Non sono «manca», sono il contrario di «manca»**: stanno nel
riquadro **menta** delle buone notizie, non nell'ambra degli avvisi — sono una spesa
risparmiata.
⚠️ **Mai sulla fonte proteica.** Il pollo non si sostituisce col tonno «perché tanto sono
proteine»: quello cambia il piatto. Valgono per erbe, aromi, contorni, latticini di rifinitura.

**3 · Lo svuota-frigo.** Un chip nella passata, **spento di default e senza memoria**: è una
scelta per *questa* settimana, non un'impostazione.
⚠️ **Non è una modalità diversa: è una priorità in più**, davanti alla varietà e ai gusti ma
**dietro** alle proteine e ai divieti. Il minimo di 55 g nei pasti principali di Ciprian resta:
svuotare il frigo non è una scusa per dargli un piatto di verdure.
⚠️ **Il flag vive su `plan_jobs`**, non in un parametro di passaggio: ogni anello riparte da
zero rileggendo la riga di lavoro, e se il flag stesse solo nella prima chiamata dal secondo
giorno in poi il piano tornerebbe normale **e nessuno se ne accorgerebbe**.

⚠️ **Altri due gemelli da tenere allineati**: `passiPuliti()` e `sostPulite()` esistono **due
volte**, nella function e nel frontend.

#### ⚠️ Un ingrediente, un nome solo

Due nomi per la stessa cosa vorrebbero dire che l'app **non riconosce di averla**. Il nome è
la **chiave** con cui `stessoNome()` collega spesa, piano e dispensa: si sceglie il nome
esatto della dispensa e si usa quello dappertutto.

⚠️ **E la quantità non può stare dentro al nome.** «Pane 1 kg» non è più il «Pane» che il
piano aspetta: il piano continuerebbe a segnalarlo mancante, e spuntandolo finirebbe in
dispensa una voce che non corrisponde a niente. Per questo `shopping_list.qta` è una colonna
a sé, e la riga la mostra **accanto** al nome.

#### ⚠️ Un pasto scritto a mano non si sovrascrive senza chiedere

`costruisciPassata()` mette su «Lascia» i pasti `a_mano` **anche in una «Genera la settimana»
partita da zero**, non solo rigenerando. Prima sparivano senza che niente lo chiedesse, e chi
li aveva scritti se ne accorgeva quando non c'erano più.

⚠️ **È un punto di partenza, non un lucchetto**: basta toccare «A casa» per rigenerarli
davvero. Deve restare così — decidere di buttare via quello che si è scritto è una scelta di
chi guarda, non una porta chiusa.

⚠️ E la passata **lo dice**: «ci sono 3 pasti scritti da te in questi giorni, sono su Lascia e
non li tocco». Un «Lascia» comparso da solo, se non si sa perché, sembra un errore.

#### La grafica è CHIUSA (18/08/2026) — non si riapre da soli

Giudizio dell'utente sul secondo giro: **«promossa per questo giro — meglio del primo,
non definitiva»**. Il cantiere è chiuso: niente illustrazioni come firma, la firma
**resta la testata**, e ogni schermata futura eredita i token.

⚠️ **Si riapre solo su una critica puntuale dell'utente.** Non rimettere mano alla
grafica di propria iniziativa, e non riproporre le illustrazioni come firma: due firme
insieme sono zero firme.

### Il piatto a mano nasce completo

⚠️ **Tutto quello che sta in `recipes` è PER UNA PERSONA.** Una ricetta è una cosa sola, il
pasto invece cambia con quanti sono a tavola. È ciò che permette di riusare la stessa ricetta
per uno o per due **senza che l'app moltiplichi niente da sé**: raddoppiare «un cucchiaio di
olio» o «mezza cipolla» darebbe risultati sbagliati, e la regola di questa casa è che si
calcola solo quando il calcolo è sicuro.

**«Crea la ricetta»** costa **una tacca**. ⚠️ **Parte solo se lo si tocca**: mai automatico,
mai al salvataggio. Il terzo mestiere (`modo:'ricetta'`) restituisce **due misure in una
chiamata sola**: `ricetta_*` per una persona, `pasto_*` per chi mangia davvero quel giorno.

⚠️ **Le tre regole anti-doppione** (`ricettaPerNome()` + `haContenuto()`, confronto con
`stessoNome()`):
1. esiste con quel nome **e con dentro qualcosa** → si **collega** quella e **non la si
   tocca**: qualcuno l'aveva approvata. Viene anche mandata al generatore perché la riusi;
2. esiste ma è **vuota** → si **riempie quella riga**, e il nome resta il suo;
3. non esiste → se ne crea una.

⚠️ `eraPiena` si legge **prima** di scrivere: nel caso 2 la riempiamo noi, e dopo sembrerebbe
che ci fosse già — il messaggio finale direbbe una bugia.
⚠️ **Il bottone riempie il modulo, NON salva il pasto**: salvare resta un gesto dell'utente.
⚠️ **E non mette nessun cuore**: se i ♥ si mettessero da soli smetterebbero di voler dire
qualcosa.
⚠️ `ricetta_id` si scrive nel pasto **solo se c'è davvero**: mandarlo sempre, anche vuoto,
farebbe fallire il salvataggio su un database dove il file SQL non è stato eseguito.

⚠️ **«Parziale» basta che manchi UN numero solo**, non tutti e due (`||`, non `&&`): le
proteine uno se le ricorda, le kcal no. Vale su `totaleGiorno()`, `totaleFinora()` e
`fisseDelGiorno()`. **Un buco che non si dichiara è peggio del buco.**
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

### Menu, costi e valori per 100 g

**Il menu.** «Quanto sto spendendo» e «Scarica un backup dei dati» (un file `.json`, da
tenere, non da incollare). ⚠️ Il **copia-riepilogo del Diario resta**: quello serve ancora.
⚠️ `scaricaBackup()` prende quello che è **già in memoria** e, se qualcosa non si era
caricato, **lo scrive nel file** invece di far finta: **un backup che mente è peggio di
nessun backup.**

**I costi.** I token si contano in **un punto solo**, dentro `pezziDiTesto()`, perché di lì
passa ogni chiamata di tutti e tre i mestieri: contarli nei singoli mestieri vorrebbe dire
dimenticarsene al quarto.
⚠️ **Come arrivano, e non è ovvio**: `message_start` porta gli input (già definitivi),
`message_delta` porta gli output **cumulativi**. L'uscita si **sostituisce** a ogni delta,
non si somma — sommarla gonfierebbe la stima di parecchie volte. La scrittura sta in un
`finally`: quello che è stato speso è stato speso lo stesso.
⚠️ **`generator_usage` resta invisibile alla chiave pubblica** (RLS accesa, zero policy): è
ciò che la rende non manomettibile. Per mostrarne il contenuto **non si aggiunge una policy**
— c'è il modo `costi` della function, che ha la chiave di servizio. E quel modo **non consuma
una tacca**: guardare quanto spendi non deve farti spendere.
⚠️ **La cifra è una STIMA e l'app lo scrive ogni volta.** `COSTO_IN`/`COSTO_OUT` sono prezzi
scritti a mano: quando cambiano diventano sbagliati **in silenzio**. Per il conto vero si
rimanda alla Console di Anthropic.

**I valori per 100 g.** `inventory_items.prot_100g` e `kcal_100g`, **facoltativi**.
⚠️ Tutti e tre i prompt dicono la stessa cosa: **dove il valore è dichiarato non si stima**,
dove non c'è si stima come sempre.
⚠️ **`nutriente()` non è `numeroONull()`**: qui **lo zero si accetta**, perché esiste davvero
(l'acqua ha 0 kcal). `numeroONull()` lo butta via apposta. Sono due regole diverse e **non
vanno unificate**.
⚠️ **L'editor della dispensa è un pannellino con Salva**, non un campo che si salva perdendo
il fuoco: con più campi il «salva quando esci dal campo» sarebbe una trappola. **Invio salva
ancora.**
⚠️ **Tutte le colonne facoltative lo sono anche per il DATABASE**: se il file SQL non è stato
eseguito, la scrittura **riprova senza** e lo dice, invece di far fallire un'azione che
funzionava da sempre.

### La categoria alimentare

⚠️ **CATEGORIA ≠ POSIZIONE, e non vanno mai confuse.** `cat` (frigo/freezer/dispensa) dice
**dove** sta una cosa e comanda scongelamenti e deperibili; `categoria` dice **che cosa è** e
comanda sostituzioni e frequenze. Il salmone sta in freezer oggi e in frigo domani, ma resta
pesce.

**Le quattordici**: pesce · carne bianca · carne rossa · salumi · uova · **formaggi** ·
**latticini freschi** · legumi · cereali e carboidrati · verdura · frutta · frutta secca e
semi · condimenti e grassi · dolci · altro.

⚠️ **Nessun vincolo sui valori nel database**, ed è voluto: aggiungere una categoria un domani
non deve costringere a una migrazione. A tenerle pulite pensa il menu a tendina.

⚠️ **Vuota resta vuota.** La prima voce del menu è «— che cos'è? —», non «altro»: un «altro»
messo d'ufficio è una risposta inventata, e le frequenze ci conterebbero sopra.

**La proposta automatica** (`categoriaProposta()`) guarda in quest'ordine: ⓵ una voce di
dispensa con lo stesso nome che ha già una categoria — ⚠️ **una scelta tua vince sempre sul
dizionario**; ⓶ `DIZIONARIO_CATEGORIE`; ⓷ un nome conosciuto che sta **dentro** questo
(`nomeDentro()`), e vince **il più specifico**; ⓸ niente, e il campo resta da scegliere.
Si propone in tutti e tre i punti d'ingresso.

⚠️ **Il passo ⓷ non è un di più: senza, mezzo piano resta senza categoria** — e senza
categoria non c'è nessun sostituto da proporre. **I nomi che il generatore scrive sono
descrizioni** («straccetti di tacchino al limone»), non etichette di scaffale.
⚠️ **Qui si può essere più larghi che in `stessoNome()`, e non è una contraddizione**:
sbagliare qui propone un sostituto che si rifiuta con un tocco, sbagliare là **scala la
dispensa sbagliata**.
⚠️ `patatine` è scritto a parte nel dizionario: per l'app non è il plurale di `patate`.

⚠️ **Il tasto ↻ vive dentro il pannello del pasto**, non sulla scheda: sulla scheda gli
ingredienti sono in sola lettura, e un secondo posto da cui scambiare sarebbe un secondo posto
da tenere allineato.

⚠️ **Scelte di merito già discusse e approvate**: le patate stanno in *cereali e carboidrati*
(nel piatto sostituiscono pasta e riso); passata e pesto in *condimenti*; il maiale in *carne
rossa*; salmone e tonno affumicati in *pesce* e non in *salumi*. **Burro e panna sono
condimenti e grassi**, non latticini — altrimenti si proporrebbe il kefir al posto del burro.
⚠️ Il tetto di **1 a settimana è sui *formaggi***, non sui latticini freschi: un formaggio è
un piatto, uno yogurt è una colazione. `categorieSostituibili()` traduce una vecchia scelta
salvata come `latticini` nelle due categorie che ne sono nate.

### Le calorie di Lorena

⚠️ **Solo le calorie, non le proteine.** Le proteine sono il vincolo di Ciprian e restano sue:
metterle anche di là vorrebbe dire tirare su un obiettivo che nessuno ha chiesto.

⚠️ **Colonna nuova (`plan_meals.kcal_lorena`), non campo riusato.** Lo stesso piatto vale 620
kcal per lui e 430 per lei: un numero solo non può dire due cose. E le **aggiunte a lato di
Ciprian** (ingredienti con `per: "ciprian"`) non entrano nel numero di lei.

⚠️ **NIENTE OBIETTIVO, ed è scritto anche nel prompt in tutti e due i mestieri.** Il numero si
mostra e basta: nessun tetto, nessuna percentuale, nessun «ti restano». Al modello è vietato
commentare il suo totale o ridurle le porzioni per far tornare un conto. *Un numero accanto a
un tetto diventa un voto*, e qui non si danno pagelle.
Se un giorno vorrà contare, le basterà compilare `kcal_target` nel suo profilo.

⚠️ **Il totale di giornata di Lorena non somma le voci fisse**: colazione e yogurt sono di
Ciprian. Se manca anche un solo numero il totale si dichiara parziale; se mancano tutti **non
si scrive niente** — uno zero sarebbe una bugia, un'assenza è un'assenza.

⚠️ Nel pannello «scrivo io» il campo sta **fuori** da `[data-numeri]`, che sparisce nei pasti
di sola Lorena.

**L'interruttore nel menu** — «Mostra le calorie anche per Lorena», **acceso di default**.
⚠️ **Governa solo la vista, ed è CSS apposta** (`body.no-kcal-lorena`): i numeri continuano a
essere calcolati, scritti e salvati. Farlo in CSS invece che con un ramo nel codice rende
**impossibile** che «non mostrarli» diventi per sbaglio «non scriverli».
⚠️ Sta in `localStorage`, non nel database: i telefoni sono due. **Solo uno «0» scritto
spegne**, così una modalità privata che non salva non lo spegne per sbaglio.
⚠️ **Non chiama `renderPlan()`**: ridisegnare farebbe credere che l'interruttore tocchi i dati.

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

### I sostituti della stessa categoria

⚠️ **Solo dentro la stessa categoria, mai fra categorie diverse, nemmeno come proposta.**
Il merluzzo si sostituisce col nasello, non con le lenticchie «perché tanto sono proteine».

⚠️ **Si scarta solo quello che si SA non bastare.** Se la quantità che serve o quella che c'è
non sono due numeri confrontabili, la voce resta in elenco **con scritto quanto ce n'è**:
davanti al frigo si giudica meglio che con una regola.
⚠️ E **non si scarta nemmeno quello che non basta**: resta in elenco **dicendo quanto ne
manca**. Tre pesci in freezer non sono «niente».
⚠️ **Se lo scegli lo stesso, la differenza va in LISTA SPESA** con la data del primo pasto che
lo aspetta: lasciar scegliere un candidato insufficiente senza dire altro fa **nascere il
pasto zoppo in silenzio**. Il conto lo fa `quantoManca()`, e **tace quando non è sicuro**.
L'annulla toglie anche quella riga di spesa — ma **solo se l'abbiamo messa noi**.

⚠️ **I numeri si spostano della DIFFERENZA, non si ricalcola il pasto da zero**
(`numeriDopoIlCambio()`): il totale di un pasto è una stima fatta sul piatto intero, e rifarla
sommando gli ingredienti darebbe un numero peggiore.
⚠️ **Se i valori per 100 g non si sanno, i numeri si AZZERANO** invece di restare quelli di
prima, e il pannello lo dice **prima** di confermare. Un cambio che lascia i numeri vecchi è
una bugia; un totale che si dichiara parziale è la verità.
⚠️ **IL DELTA HA DUE ESTREMI, E VALE PER TUTTI E DUE**: il conto salta anche quando l'ignoto è
l'ingrediente che **esce**, perché la base da cui sottrarre non si sa. Il messaggio deve dire
**di chi** non si sanno i valori: se è quello che esce, lo si dice **una volta sola in cima**;
se è il candidato, lo dice la sua riga; se è la quantità, lo dice quella. **Un'informazione
che indica la cosa sbagliata è come un numero che arriva dal nulla.**

⚠️ **Il cambio vale su tutti i pasti futuri che usano quell'ingrediente**, non solo sul primo.
L'annulla riporta indietro **tutti** insieme.
⚠️ Il bottone è **menta e non pesca**: una sostituzione vuol dire «non devi andare da nessuna
parte».

#### ⚠️ Un dato scritto e mai riletto è un dato perso

`inventory_items` si leggeva con un **elenco fisso di colonne**, e quando ne sono arrivate di
nuove il lato che scrive è stato aggiornato e **quello che legge no**: i valori finivano nel
database e non tornavano più indietro, senza nessun errore da nessuna parte.

⚠️ **Si legge con `select('*')`**, per la stessa ragione per cui lo fa la Edge Function.
⚠️ **I lati che scrivono e che leggono si toccano insieme.**

#### Dal mancante al pasto

Nell'avviso delle scorte ogni riga è **toccabile** e porta al **primo pasto che la richiede**,
col pannello di modifica già aperto. `scorteMancanti()` tiene `dove` (giorno **e** pasto) e ne
espone il primo in `primo`, col pranzo prima della cena.

⚠️ **Non c'è un secondo modo di aprire quel pannello**: l'handler chiama `vaiAlGiorno()` e poi
**preme la matita vera** (`b.click()`). Riscrivere la stessa apertura sarebbe un secondo posto
da tenere allineato, e si scollerebbe.

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

#### Le ricette che usano quell'ingrediente

Scrivere i valori per 100 g di un alimento cambia il conto di **ogni ricetta che lo contiene**
— ma quelle ricette le ha approvate una persona.

⚠️ **Si propone, non si riscrive.** Il messaggio dice quante ricette sono coinvolte e offre
«Rivedi i numeri»; il pannello mostra **vecchio e nuovo affiancati** e aspetta. C'è l'annulla.

⚠️ **O si sa tutto, o non si sa niente.** `ricalcolaRicetta()` rifà il conto **solo** se *ogni*
ingrediente ha i valori per 100 g e una quantità pesabile. Sommare i pezzi conosciuti darebbe
un totale più basso del vero e **dall'aria precisa**, che è il modo peggiore di sbagliare.
Quando non si può, il pannello **dice quali ingredienti mancano**.

⚠️ **`grammiDi()` accetta solo massa**, `g` e `kg`. «200 ml» non si converte (servirebbe la
densità) e «2 fette» non è un numero. **Fuori dai grammi non si stima.**

⚠️ Il messaggio dice **prima** che il salvataggio è andato bene e **poi** la notizia delle
ricette: la notizia non deve mangiarsi la conferma di quello che hai appena fatto.

#### La spesa si completa da sola

`serveInTutto()` somma il fabbisogno di un nome su tutti i pasti futuri, `quantoManca()` ci
toglie quello che c'è in dispensa, e `aggiungiAllaSpesa()` scrive il risultato in `qta`.

⚠️ **`null` non è un errore, è la risposta onesta.** Basta una quantità non numerica («q.b.»,
«~1 kg», «2×100 g»), un'unità diversa fra due pasti, o un «?» sulla voce di dispensa, e la
quantità resta vuota invece di essere verosimile. Una riga senza quantità si compra a occhio;
**una riga con la quantità sbagliata fa comprare la cosa sbagliata.**

⚠️ La quantità si calcola sui **pasti che si stanno salvando**, non su `S.piano`: mentre la
settimana si genera, il piano nuovo non è ancora quello che l'app ha in mano.

⚠️ `mancantiDaPasti()` accetta **già** sia un nome scritto sia un oggetto `{nome, qta}`: quando
la function imparerà a dire anche quanto ne serve, non ci sarà da tornare qui.

#### I valori per 100 g: l'app se li ricorda

⚠️ **NON è un database alimenti**, e la decisione che li vieta resta in piedi: qui dentro
finiscono **solo i nomi passati da questa cucina**, coi numeri copiati da una persona
dall'etichetta. Nessun archivio importato, nessuno scanner.

⚠️ **Sta in `settings` (chiave `nutrienti_noti`), non in `localStorage`, e non è un ripiego:
i telefoni sono due.** Un ricordo che vive sul telefono lo avrebbe uno solo dei due.

⚠️ **La chiave si cerca con `stessoNome()`**, come ogni confronto fra nomi di cibo.

⚠️ **`ricordoDi()` guarda anche la dispensa vera**, non solo la memoria: è ciò che fa
funzionare la cosa **dal primo giorno** invece che dalla seconda volta in poi.

⚠️ **Quello che scrivi vince su quello che l'app ricorda.** I campi si riempiono da soli solo
se sono vuoti o se li aveva riempiti l'app; appena ci si scrive dentro, non li tocca più.
**E lo dichiara**: sotto i campi compare da dove vengono quei numeri.

⚠️ **Entra anche dalla spesa** (`confermaAggiuntaDispensa()`): è da lì che le voci entrano
davvero dopo la spesa. Se il ricordo non si salva **non si dice niente e non si ferma niente**:
la voce di dispensa è già salvata, e quello è solo un promemoria.

#### «Svuota la lista» nella Spesa

⚠️ **Due tocchi, e il primo dice quante voci porta via.** È l'unica azione della lista che
cancella anche ciò che **non** è spuntato: un tocco per sbaglio col telefono in tasca
butterebbe via la settimana. Il primo tocco mostra il numero e aspetta cinque secondi; poi il
bottone si disarma da sé. `renderSpesa()` chiama `disarmaSvuota()`: se la lista cambia mentre
il bottone aspetta, il numero scritto sopra non è più vero.

⚠️ **Sta su una riga sua**, non di fianco a «Copia la lista»: un'azione che cancella tutto non
deve stare a un dito di distanza da una che non cancella niente.

⚠️ **Un annulla che restituisce una cosa diversa da quella tolta non è un annulla.** Tutte e
due le cancellazioni in blocco annullano da `rimettiTutte()`, che passa da `rimettiInLista()`
— l'unico posto che sa riportare indietro una riga **intera**, quantità e `serve_il` compresi.

#### Il diario dice chi ha mangiato

⚠️ **La traduzione si fa solo al momento di mostrare, mai una volta per tutte.**
`meals_log.chi` è scritto dal punto di vista di **chi ha in mano il telefono**: `io` non è una
persona, è «io che sto usando l'app». La stessa riga letta dall'altro telefono parla di
qualcun altro. `chiDalDiario()` è il gemello all'incontrario di `chiPerDiario()` e passa sempre
dal profilo selezionato **qui**. Per lo stesso motivo `cambiaIo()` richiama `renderDiario()`.

⚠️ **Campo vuoto → non si scrive niente.** Le righe scritte prima che il campo esistesse non
dicevano chi, e far comparire un nome sarebbe raccontare una cosa che nessuno ha detto.

⚠️ **`finora oggi` non è stato toccato**, e il limite resta: somma tutte le righe del giorno
senza distinguere chi. **Mostrare il nome è una cosa, contarci sopra è un'altra.**

#### I nomi appaiati: l'app impara

La memoria sta in `settings`, chiave **`alias_nomi`**, un JSON di gruppi. Quando un ingrediente
del piano non si riconosce in dispensa ma c'è una voce che gli somiglia, l'avviso lo chiede;
rispondendo di sì l'app **impara l'appaiamento**.

⚠️ **IL PIANO NON SI RISCRIVE.** È la dispensa che cambia col tempo — la confezione nuova, il
nome sulla busta — non il modo in cui una persona chiama le cose. Riscrivere il piano sarebbe
farla parlare come il frigo. Si tocca solo `settings`, mai `plan_meals`, e prot/kcal mai.

⚠️ **Da lì in avanti vale OVUNQUE**, perché entra in `stessoNome()` come prima cosa, prima di
qualunque regola di grammatica: è la risposta di una persona. Un appaiamento che valesse in un
punto solo lascerebbe l'app a sapere una cosa in una schermata e a ignorarla in quella accanto.

⚠️ **Proprio perché vale ovunque, un appaiamento sbagliato SCALA la dispensa sbagliata.**
Quindi: si conferma **rispondendo a una domanda**, mai da soli; ogni conferma lascia un
**annulla**; e si toglie in un posto solo — ☰ menu → «I nomi che ho appaiato». L'annulla
**rimette il testo di prima**, non toglie il gruppo: toglierlo separerebbe anche quello che era
già appaiato da prima.

⚠️ **`nomiSimili()` è STRETTA APPOSTA**: le parole che contano di un nome devono essere **tutte
dentro** quelle dell'altro. «Filetti di merluzzo» vs «Filetti di pollo» **tace**. *Una domanda
sbagliata fatta con sicurezza è peggio del silenzio.*
⚠️ Per lo stesso motivo nel menu c'è **«Appaiane due tu»**: senza quei due campi la prudenza
smetterebbe di essere prudenza e diventerebbe un muro.

⚠️ **`forseInCasa()` resta com'era e continua a zittire per primo**: le somiglianze si cercano
**dopo**, altrimenti l'avviso si riempirebbe di «forse è questo» e spingerebbe fuori i guai
veri. Costo dichiarato: qualche nome resta silenzioso e per appaiarlo si passa dal menu.

⚠️ **E il messaggio dopo il salvataggio dice COSA** (`cosaNonTorna(iso, pasto)`), nominando
**prima i guai del pasto appena salvato**: rispondere del merluzzo di venerdì a chi ha appena
salvato lunedì è come non rispondere.

#### Rinominare una voce di dispensa

⚠️ **Rinominando, il vecchio nome diventa un alias del nuovo DA SOLO e SENZA CHIEDERE.** Non è
una comodità: il nome è la **chiave** con cui la voce si incontra col piano, con la spesa e con
le ricette. Cambiandolo, tutti i pasti già scritti col nome di prima smetterebbero di combaciare
**in silenzio**. Chiedere non avrebbe senso: non è una preferenza, è ciò che tiene in piedi
quello che era già scritto. Resta togliibile dal menu.

⚠️ **L'alias si scrive solo se serve**: da «uova» a «Uova» `stessoNome()` li appaia già da sé.
⚠️ **Nome vuoto: si rifiuta.** Una voce senza nome sparirebbe dalla lista.
⚠️ **Se l'alias non riesce a salvarsi, il nome resta cambiato e lo si dice.** È l'unica volta in
cui un'operazione accessoria che fallisce va gridata: qui il danno non è una comodità mancata,
è il piano che si scolla dalla dispensa.

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

#### Il punto di ripristino

Sta in `settings`, chiave **`piano_ripristino`**. Prima di riscrivere giorni già decisi,
`segnaRipristino()` fotografa i pasti che stanno per sparire; il menu ha «Torna a com'era ›».

⚠️ **La fotografia si fa PRIMA di scrivere e prima di TUTTI E DUE i modi** — la staffetta
scrive dal server, il ripiego dal telefono, ma quello che cancellano è lo stesso. Il punto
d'aggancio è uno solo, subito prima del bivio in `avviaGenerazione()`.

⚠️ **Se la fotografia non riesce e c'era qualcosa da perdere, NON SI GENERA.** È l'unico posto
dell'app in cui un'operazione accessoria che fallisce ferma quella principale: qui non è una
comodità, è la rete sotto il trapezio.

⚠️ **`ambito` è separato da `righe`**: rimettendo a posto bisogna cancellare anche i pasti che
PRIMA non c'erano. Se si cancellasse solo dove si riscrive, un pasto inventato sopravviverebbe
al ripristino. I pasti su «Lascia» restano **fuori** dall'ambito.

⚠️ **SE NE TENGONO TRE** (`MAX_RIPRISTINI`). Uno solo non basta: il guaio non si vede quasi mai
subito. Dieci sarebbero peggio di tre, perché **scegliere fra dieci date è un lavoro nuovo per
chi guarda** proprio nel momento in cui si ha fretta. C'è anche un tetto di **peso**: se la pila
cresce troppo cadono i **più vecchi**.

⚠️ **È reversibile**: `tornaComEra(i)` fotografa com'è *adesso* prima di rimettere, e la mette
**in cima** alla pila. `updated_at` non si rimette indietro: la riga è stata toccata adesso.

⚠️ **Vale anche per «Sostituisci e salva»**, che riscrive il piano quanto una rigenerazione. Lì
però, se il punto non riesce a salvarsi, **il cambio si fa lo stesso**: l'annulla immediato c'è
comunque, e il danno possibile è un ingrediente in due o tre pasti, non la settimana intera.

⚠️ `sovrascriviPasti(ambito, righe)` è il **posto unico** che cancella e riscrive: ci passano
sia le generazioni sia il ripristino.

#### La conferma che NOMINA i pasti scritti a mano

Prima di aprire la passata, se in quei giorni c'è anche **un solo** pasto `a_mano`, si mette in
mezzo una schermata che li elenca: giorno, pasto e **nome del piatto**.

⚠️ **Non è un «sei sicura?»**: un avviso che chiede solo conferma si impara a scacciare.
«3 pasti» non fa riconoscere la settimana costruita a mano, «sabato 22 · pranzo — Pane,
prosciutto crudo e mozzarella» sì.

⚠️ **E dice la verità intera, non un pericolo gonfiato**: quei pasti partono su «Lascia» e
**non vengono riscritti**, a meno che non sia una persona a toccarli nella schermata dopo.
Spaventare per una cosa che non succede è lo stesso difetto dell'ambra usata a sproposito.

⚠️ Sta in `apriPassata()` e **non nei singoli tasti**: gli ingressi sono tre, e una regola
scritta tre volte si scolla al primo cambiamento.

#### Il backup sa quanto è vecchio

`avvisoBackup()` scrive quanto è vecchio l'ultimo backup e quante volte da allora il piano è
stato riscritto. Il conto sono i punti di ripristino più recenti dell'ultimo scaricamento.

⚠️ **Un backup è utile solo se si sa quanto è vecchio.** Un file scaricato prima di due
rigenerazioni racconta un calendario che non esiste più, e chi lo tiene da parte crede di
essere al sicuro.

⚠️ **Sta in `localStorage` e non in `settings`**: è un fatto di QUESTO telefono. Il file è nella
cartella Download di chi l'ha scaricato.

⚠️ **E il tasto dice quanto pesa premerlo** (`pesoRigenerazione()`): «riscrive 5 giorni
(9 pasti) · 2 pasti scritti da te, che lascio stare», **dentro il tasto e non accanto** — la
riga accanto la si legge dopo aver già premuto. I pasti a mano si contano **a parte** perché non
vengono riscritti: dirlo insieme al resto distingue un avvertimento da una promessa.

#### La proposta di sostituto non deve diventare rumore

⚠️ **Massimo tre nell'avviso, ordinate per quantità utile.** `sostitutiPer()` calcola quanto
ogni voce **copre** di quello che serve e mette davanti le più abbondanti. Le voci di cui non si
può sapere la quantità restano in elenco — davanti al frigo si giudica meglio che con una regola
— ma **dopo** quelle che si sanno bastare.

⚠️ **Niente conteggi.** «Hai 8 cose simili» non dice se sono utili né quali sono: la riga nomina
la più abbondante, «hai Nasello e altro: ne uso uno?».

⚠️ **L'interruttore «sostituibile» per categoria** (`CHIAVE_SOSTITUIBILI`, in `settings`) **non
è una preferenza estetica**: dove l'ingrediente è la **fonte proteica** scambiarlo è ragionevole;
dove l'ingrediente **È il piatto** — cereali, verdura, frutta — scambiarlo non è una
sostituzione, è un altro piatto, e quello si decide dalla matita.
Accesi di partenza: pesce · carne bianca · carne rossa · salumi · uova · formaggi · latticini
freschi · legumi. I **salumi** stanno fra gli accesi, la **frutta secca** fra gli spenti.

#### ⚠️ La proposta funzionava solo dove l'app non sapeva contare

Dove l'app sapeva fare il conto, buttava via la risposta; dove non lo sapeva fare, funzionava
per caso. Quattro regole ne sono uscite:

1. **Non si scarta quello che non basta**: resta in elenco **dicendo quanto ne manca**.
2. **Se lo scegli lo stesso, la differenza va in lista spesa** con la data del primo pasto che
   la aspetta. L'annulla la toglie **solo se l'abbiamo messa noi**: una riga che c'era già non
   si tocca.
3. **Il tetto di 3 vale nell'avviso, non nel pannello** (`sostitutiPer(nome, serve, tutti)`): il
   muro da togliere era la riga dell'avviso, il pannello è dove stai **scegliendo**.
4. **A pari merito niente alfabeto.** Quattro gradini: basta di sicuro · non basta e si sa di
   quanto · quantità illeggibile · niente.

⚠️ **Un solo modo di dire «non basta»**: `ammanco(serve, voce)`. Lo usano l'ordine, la riga del
pannello e la lista della spesa. Tre conti separati si scollerebbero.

⚠️ **`serve` si porta dietro anche sui mancanti ASSENTI**, non solo su quelli di tipo «poco»:
senza, il pannello resta muto proprio sui casi per cui tutto questo è nato.

⚠️ **Doppioni FRA i candidati** (`chiaveAlias`): due righe di dispensa che sono la stessa cosa
sprecavano un posto dei tre.

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

#### Un numero da solo: si chiede una volta

Sta in `settings`, chiave **`unita_note`**. «Scamorza affumicata · 250» e «Ricottina · 2» sono
250 grammi e 2 pezzi, e l'app le trattava tutte e due come **conteggi**.

⚠️ **È il caso peggiore, perché è giusto e sbagliato insieme senza che nessuno se ne accorga**:
fa funzionare «Uova: servono 5, ne hai 3» e allo stesso tempo impedisce di sapere se 250 di
scamorza bastano per 150 g di provolone. Indovinare è vietato — *250 forme di scamorza?* —
quindi si chiede.

⚠️ **La domanda compare SOLO su un numero nudo** (`numeroNudo()`) e sparisce appena smette di
esserlo: mostrarla sempre sarebbe chiederlo a chi ha già risposto scrivendo «250 g».

⚠️ **«Sono pezzi» NON riscrive niente** (`conUnita()`): il numero nudo è già la forma giusta per
i pezzi. È ciò che permette alla domanda di **solo aggiungere** informazione, senza rompere i
confronti che oggi funzionano.

⚠️ **Si può cambiare idea**: la scelta si vede e si corregge **dalla matita in dispensa**. Una
risposta sbagliata data una volta non deve ripetersi in silenzio per sempre.

⚠️ **Se l'app completa il numero lo DICE**, in tutti e due i moduli: quello che si salva
dev'essere quello che si è scritto, o si deve poter vedere che non lo è.

#### Formaggi e latticini freschi sono due categorie

Con una categoria sola l'app proponeva **lo yogurt greco al posto del provolone**. Un formaggio
è un piatto e ne conta al massimo uno a settimana; uno yogurt è una colazione e non conta niente.

- **formaggi** (il tetto di 1 a settimana è qui): Mozzarella · Scamorza affumicata · Stracchino ·
  Ricottina · Parmigiano grattugiato · Cheddar
- **latticini freschi** (nessun vincolo): Kefir · Yogurt greco

⚠️ **Burro e panna non stanno in nessuna delle due: sono «condimenti e grassi».** Sono grasso di
cottura, e tenerli fra i latticini freschi voleva dire **proporre il kefir al posto del burro**.

⚠️ `categorieSostituibili()` traduce una vecchia scelta salvata: se in `settings` c'è ancora la
parola `latticini`, si legge come le due categorie che ne sono nate — perdere in silenzio una
scelta già fatta sarebbe peggio che chiederla di nuovo.
#### ⚠️ `closest()` sale, non scende e non guarda di fianco

Un pannello inserito con `insertAdjacentHTML('afterend')` è un **fratello**, non un genitore:
`closest()` non lo trova, torna `null`, e il gesto va a vuoto **in silenzio**.

⚠️ Ogni volta che un pannello viene inserito *accanto* a qualcosa, il legame fra i due va tenuto
esplicito (`previousElementSibling`). ⚠️ **E un gesto che non produce nulla non deve mai finire
in silenzio**: se l'elemento non è quello atteso, lo si dice.

#### ⚠️ `plan_meals` non ha una colonna `id`

La chiave è **`(day, pasto)`**, ed è il motivo per cui si salva con
`upsert(..., { onConflict:'day,pasto' })`. Scrivere `.eq('id', …)` fallisce **ogni singola
volta**, in silenzio.

⚠️ **Se serve indicare un pasto, si indica con giorno e pasto**: `chiavePasto(r)`.

#### I contorni liberi

Sta in `settings`, chiave **`contorni_liberi`**. Nel campo ingrediente ogni tanto finisce della
prosa — «Patatine fatte in friggitrice ad aria» — che non combacia con niente e resta mancante
**per sempre**, e *un avviso che non si può mai spegnere smette di essere un avviso*.

⚠️ **Toglie solo dal controllo scorte**: l'ingrediente resta scritto nel pasto, si legge e si
cucina. **Si smette di CONTARLO, non di farlo.**

⚠️ **Si propone per ultima, e solo quando non c'è altro da fare**: né un nome da appaiare né
qualcosa da usare al suo posto. «Non contarlo più» è una rinuncia — se esiste una risposta vera,
la rinuncia non deve nemmeno comparire.

⚠️ Il controllo sta **in cima al ciclo** di `scorteMancanti()`, prima ancora della somma delle
quantità: contare a metà sarebbe peggio che non contare.

⚠️ **E spariscono anche dalla LISTA DELLA SPESA**, che è la seconda metà della stessa promessa.
Il filtro sta in `mancantiDaPasti()` e nei `manca` di «Crea la ricetta» — cioè **dove la lista
del modello diventa la tua**. ⚠️ Quello che scrivi **tu a mano** nella spesa non viene filtrato:
**si filtra l'automatico, mai un gesto esplicito.**

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

#### La barra in basso: la tastiera e il rullo

**Il guasto della tastiera.** Su Safari iOS un elemento `position:fixed` si appoggia al *layout
viewport*, che con la tastiera aperta **non si accorcia** — mentre quello che si vede sì.
`misuraTastiera()` se ne accorge e la barra sparisce mentre scrivi.

⚠️ **Il toast aveva lo stesso identico difetto**, e sistemare solo la barra avrebbe spostato il
guasto invece di chiuderlo. Gli altri `position:fixed` sono ancorati **in alto** o a tutto lo
schermo, e la tastiera non li tocca.
⚠️ **Il toast però NON sparisce: si sposta.** È lì che vive «Annulla», e farlo sparire mentre la
tastiera è aperta vorrebbe dire togliere il modo di tornare indietro proprio a chi ha appena
salvato.
⚠️ **La misura si fa su `documentElement.clientHeight`, non su `window.innerHeight`**: il primo
sta fermo, il secondo su iOS si muove anche quando la barra degli indirizzi si rimpicciolisce.
Si sottrae anche `visualViewport.offsetTop`. Soglia a **120 px**.

**Il nascondi-al-rullo.** In giù si toglie, in su torna.
⚠️ **Le etichette RESTANO** — richiesta esplicita: le icone da sole non bastano, «Cucino» e
«Ricette» non si indovinano. I bersagli restano a `min-height:52px`.
⚠️ **Tre soglie, e ognuna evita un difetto preciso**: **8 px** di movimento minimo (meno è il
tremolio del dito fermo sul vetro); **90 px** dall'alto, perché in cima la barra **c'è sempre** —
è il posto in cui si torna quando ci si è persi; **con la tastiera aperta il rullo tace**, e alla
chiusura si riparte dal punto in cui la pagina è finita.

⚠️ **Due trappole da non ricadere**: si muove col **`transform`**, mai col `position`, perché
`misuraTestata()` legge `getComputedStyle(nav).position` per decidere `--nav-alt` e cambiare
posizionamento sposterebbe tutte le intestazioni appiccicose; e il **`padding-bottom` del body
resta**, altrimenti la pagina sobbalzerebbe a ogni comparsa.

⚠️ **Cambiando tab la barra torna** (`mostraLaBarra()`): una schermata appena aperta è in cima.
⚠️ **Sul computer non vale niente di tutto questo**: il blocco `@media (min-width:760px)` annulla
tutte e due le regole.

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
| `STORIA.md` | la cronologia completa: come si è arrivati a ogni regola, i guasti chiusi, le date dei deploy. **Non si legge a ogni sessione** |
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
