# Piano & Dispensa — istruzioni operative

L'app è qui: **https://gallinolorena97-dotcom.github.io/piano/**

Non c'è nessun login: apri e usi, tutte le schede sono già modificabili. Nessun pulsante
Accedi, nessuna email, nessun codice. Lo stesso vale per chiunque abbia l'indirizzo.

---

## ⭐ La routine settimanale — ora si fa tutta dall'app

**La domenica, dal telefono:**

1. Apri l'app, tab **Piano**, premi **Genera la settimana**.
   (Se un piano c'è già, il tasto è in fondo: **↻ Genera un'altra settimana**.)
2. **La passata dei sette giorni.** È già tutta compilata su «A casa · Tutti e due»:
   tocchi solo quello che è diverso.
   - **A casa / Fuori / Libero** per ogni pranzo e ogni cena.
   - **Chi mangia**: Ciprian · Tutti e due · Lorena.
   - Se una sera mangiate presto o avete voglia di qualcosa, scrivilo in **+ nota**.
   - In cima c'è **«di solito a tavola ci sono»**: imposta tutti e quattordici i pasti
     in un colpo, poi correggi le eccezioni.
   - Sotto c'è **Normale / Svuota-frigo**. Scegli il secondo prima di una partenza o di
     una spesa grossa: punterà a finire quello che hai invece di cucinare il meglio.
     Le proteine di Ciprian restano quelle di sempre.

   Ci vuole meno di un minuto.
3. Premi **Genera il piano** e **posa pure il telefono**. La settimana si scrive **sul
   server**, un giorno alla volta: puoi spegnere lo schermo, cambiare app o chiudere
   tutto. Riaprendo l'app trovi lo stato vero, coi giorni comparsi man mano.
4. **Il riepilogo**: giorno per giorno cosa si mangia, i totali di Ciprian, cosa manca
   e cosa resterà in dispensa. **A questo punto è già tutto salvato** — ogni giorno
   finito viene scritto subito, così una connessione che cade non porta via niente.
5. Le cose che mancano finiscono da sole nella lista della **Spesa**, con scritto
   **per quando servono**.

> **Se si ferma.** Se il collegamento col generatore si interrompe, in cima alla tab
> Piano compare un riquadro con **Riprendi la settimana**: riparte dal primo giorno
> mancante, senza rifare (e senza ripagare) quelli già scritti. Non riparte da sola
> apposta: una cosa che si rincorre da sé consumerebbe credito senza che nessuno guardi.

**Durante la settimana:** aggiorni Dispensa e Ricette dall'app, e premi
**✓ Ho cucinato questo** quando cucini, così la dispensa resta vera.

I giorni passati non si cancellano mai: restano come storico.

> **Il ripiego.** Se un piano ti arriva già scritto in chat, si carica ancora alla
> vecchia maniera: `/piano-settimana` in Claude Code, poi il file SQL su Supabase.
> Serve solo in quel caso.

**Quanto costa una settimana:** **7** delle 30 generazioni giornaliere — una chiamata
vera per ogni giorno da cucinare. Restano **quattro settimane al giorno**, e il tetto di
spesa non si muove: siamo sui 14 centesimi a settimana.

(Prima erano 3, quando si generavano più giorni per volta. Si è passati a un giorno per
chiamata perché due giorni insieme arrivavano all'85% del tempo massimo concesso da
Supabase, e ogni tanto la generazione veniva spenta a metà.)

---

## Come si usa, tab per tab

**Piano** — è un **calendario**. In alto c'è la striscia dei giorni: tocchi un giorno e sotto
compaiono il suo pranzo e la sua cena.

- **Chi mangia** è scritto col nome vero (Ciprian · Ciprian e Lorena · Lorena), non con sigle.
- Gli **ingredienti sono a persona**: se le porzioni sono diverse, vedi «Per Ciprian» e
  «Per Lorena» una sotto l'altra.
- Il **tocco dolce** ha un riquadro tutto suo: non si mescola agli ingredienti.
- I promemoria **❄ da scongelare** compaiono sul giorno in cui vanno fatti, non su quello
  del pasto: se stasera devi spostare il pesce dal freezer, lo leggi oggi.
- Il **totale del giorno** è solo di Ciprian, colazione e yogurt compresi (sono scritti,
  così il numero non arriva dal nulla). Nei pasti di sola Lorena non compare nessun numero.

I tre modi in cui un giorno si presenta:

| Come lo vedi | Cosa vuol dire |
|---|---|
| bordo pieno, badge **OGGI** | oggi e domani: il piano è quello, confermato |
| bordo tratteggiato, badge **BOZZA** | da dopodomani in poi: cambierà, non fidarti dei dettagli |
| fondo grigio, badge **PASSATO** | mostra il **diario**, cioè cosa hai mangiato davvero |

Un giorno passato senza niente segnato dice solo «Niente segnato per questo giorno».
Nessun rimprovero: è un fatto, non una colpa.

Un pasto segnato **«dipende dalla spesa»** aspetta qualcosa che non hai ancora: lo trovi
nella tab Spesa. Quando l'hai comprato e messo in dispensa, **l'avviso sparisce da solo**.

Sotto il pasto puoi trovare altre due cose:

- **Come si fa** — il procedimento, chiuso. Toccalo quando ti metti a cucinare: sono
  passi numerati, coi tempi dentro («rosola 5 minuti»). Se il piatto è banale sono due
  righe, ed è voluto.
- **Sostituzioni** (riquadro verde) — «ho messo il basilico invece del prezzemolo, che
  non avevi». Non è un avviso: vuol dire che **non devi comprare niente**.

**Per cambiare giorno** puoi toccare un giorno nella striscia, oppure **strisciare col
pollice** sulla scheda: verso sinistra vai avanti, verso destra torni indietro. Sul
computer funzionano le frecce ← e →.

### Scrivere un piatto a mano

Su ogni pasto di **oggi o dei giorni futuri** c'è una **matita ✎**. La trovi anche sui
pasti vuoti: è il modo per riempire i buchi che il generatore ogni tanto lascia.

Scrivi il nome del piatto, chi mangia e — se vuoi — gli ingredienti, le proteine, le
kcal, il dolce e una nota. **Proteine e kcal sono facoltative**: se le lasci vuote non
invento niente, e il totale del giorno si dichiara **parziale**. Nei pasti di sola
Lorena quei campi non compaiono proprio.

Un pasto scritto da te porta il bollino **SCRITTO DA TE** e **non viene mai rigenerato
senza chiedertelo**: se rifai il piano, parte su «Lascia» e resta com'è.

### Quando il piano non torna più

Se cambi la dispensa (o scrivi un piatto che consuma molto), i giorni futuri possono
contare su cose che non hai più. L'app se ne accorge da sola e in cima alla tab Piano
compare un riquadro ambra che dice **cosa manca, quanto serve e quanto ne hai**.

Da lì puoi **rigenerare da quel giorno in avanti**. Oppure **↻ Rigenera** nella fascia
di un singolo giorno, per rifare solo quello tenendo tutti gli altri.

**Non viene mai rigenerato niente da solo**, e **oggi non si rigenera mai**: si cambia
solo da domani in poi.

Se il piano copre meno di sette giorni, in cima compare anche **Allunga il piano**.

### «Lascia»: il quarto bottone della passata

Quando fai la passata dei giorni, oltre a *A casa · Fuori · Libero* c'è **Lascia**, che
vuol dire «questo pasto non toccarlo»:

- su una settimana nuova, per i giorni che **non vuoi ancora decidere**: restano vuoti;
- rifacendo il piano, per i pasti che **vuoi tenere come sono**.

### «Ieri hai mangiato questo?»

Alla prima apertura, se ieri c'erano pasti in programma, in cima alla tab Piano trovi la
domanda con i pasti previsti. Per ognuno tre risposte:

- **Sì** — si apre l'elenco degli ingredienti con le quantità, come in «Ho cucinato
  questo»: correggi quello che hai usato davvero, confermi, e la dispensa si aggiorna.
  Resta l'**Annulla** per 8 secondi.
- **No, altro** — scrivi cosa hai mangiato davvero. Finisce nel diario, e **la dispensa
  non viene toccata**: non so con che cosa l'hai fatto. Se serve, la correggi a mano.
- **Saltato** — finisce nel diario così com'è. Nessun rimprovero: è un fatto.

Puoi anche correggere **chi c'era davvero**, se era diverso dal previsto.

Se non hai voglia, **Più tardi** la rimanda a domani. La domanda guarda indietro al
massimo tre giorni: più in là non te la richiede.

Se rispondi tu dal tuo telefono, l'altro non se la ritrova: la risposta è salvata nel
database, non sul telefono. Così la dispensa non viene scalata due volte.

**Dispensa** — aggiungi con nome, quantità e categoria. Toccando la quantità (o la
matita ✎) si apre un pannellino dove correggerla: **Invio salva**, come prima.
La **×** elimina, e per 8 secondi hai il tasto **Annulla**.
Se in una quantità scrivi un `?` (per esempio `? da contare`) la voce si colora di ambra
e finisce nell'elenco **DA VERIFICARE**.

**Ricette** — i tre tasti **♥ / OK / NO** sono interruttori: premi una volta per dare il voto,
ripremi lo stesso tasto per toglierlo.

**I valori per 100 g** — toccando la matita ✎ su una voce di dispensa puoi scrivere,
se vuoi, quante proteine e quante calorie ha per 100 g. Sono facoltativi: dove li
scrivi il generatore li usa invece di stimare, dove non ci sono stima come ha sempre
fatto. Conviene compilarli solo sulle quattro o cinque cose che compri sempre.

**Nel menu** (l'icona in alto a destra) trovi anche:

- **Quanto sto spendendo** — la stima di spesa del mese per le generazioni.
  ⚠️ È una stima, non il conto: i prezzi cambiano. La cifra vera sta nella Console
  di Anthropic.
- **Scarica un backup dei dati** — un file con dispensa, ricette, piano, diario e
  spesa. Da tenere da parte, non da incollare in chat.

Il vecchio tasto «Copia per Claude» non c'è più: l'inventario ormai vive nel database
e il generatore se lo rilegge da solo.

---

## Mettere l'icona sull'iPhone

1. Apri l'indirizzo dell'app in **Safari** (non in Chrome).
2. Premi il tasto **Condividi** (il quadrato con la freccia).
3. Scegli **Aggiungi a Home**.

---

## Chi può fare cosa

Chiunque abbia il link può **leggere e modificare**. Non c'è distinzione fra te e gli altri.

È una scelta presa consapevolmente per tenere l'uso quotidiano semplice. Le conseguenze
pratiche, per essere chiari:

- l'indirizzo è pubblico su GitHub, quindi in teoria qualcuno potrebbe trovarlo e modificare i dati;
- non ci sono danni irreversibili: i dati si possono sempre ricaricare, e i file
  `seed-dati-iniziali.sql` e `DATI-INIZIALI.txt` restano come copia di partenza;
- se un giorno preferisci rimettere una protezione, si fa: le istruzioni sono in fondo a
  `setup.sql` e in `CLAUDE.md`.

---

## Se qualcosa non va

| Cosa vedi | Cosa fare |
|---|---|
| «Non riesco a raggiungere il database» | Sei senza rete, oppure il progetto Supabase è andato in pausa per inattività. Apri supabase.com e riattivalo. |
| «Il database non accetta le modifiche» | Manca il passaggio di `cambio-accesso-libero.sql`. Eseguilo dal SQL Editor. |
| La pagina resta vuota | Chiudi del tutto l'app dall'iPhone (scorri in su e butta via la scheda) e riaprila. |
| Le modifiche non si vedono sull'altro telefono | Ricarica la pagina: l'app legge i dati all'apertura, non in tempo reale. |

---

## La tab "Cosa cucino"

Parte dalla tua dispensa vera e propone piatti che rispettano il metodo.

**Come si usa, in cucina:**

1. Apri la tab **Cosa cucino**.
2. Tre tocchi: pranzo o cena · sola o con X · quanto tempo hai.
3. Se vuoi, scrivi cosa hai già mangiato oggi (facoltativo, ma migliora molto le
   proposte: calcola le proteine che ti restano).
4. **Genera 3 proposte**. Ci vuole una decina di secondi.
5. Su ogni scheda hai tre pulsanti:
   - **↻ Un'altra** — cambia solo quella, tenendo le altre due
   - **✎ Personalizza** — scrivi cosa cambiare ("col riso invece della pasta")
   - **✓ Scelgo questa** — la salva fra le Ricette col cuore ♥ e ti chiede se
     scalare gli ingredienti dalla dispensa

Quando accetti di scalare, ti mostro riga per riga cosa resta: **i numeri li ho già
calcolati io dove ho potuto**, tu correggi quello che non torna e confermi.

### «Ho cucinato questo»

È il pulsante verde sulla scheda. Serve a tenere la dispensa aggiornata **senza
doverci pensare**.

1. Lo premi → si apre l'elenco degli ingredienti con le quantità.
2. **Correggi quello che hai usato davvero** (280 g di pollo, non 250).
3. Sotto ogni riga ti dico cosa succede: *«Resta 100 g»*, oppure *«Finisce»*,
   oppure *«Non faccio i conti»* con il motivo.
4. Confermi → scalo la dispensa, salvo la ricetta col ♥, segno il pasto nel diario.
5. Compare **Annulla**: se hai sbagliato, torna tutto com'era.

**Quando non faccio i conti da sola** — e va bene così: se in dispensa c'è scritto
`~1 kg`, `sì`, `2×100 g` o `? da verificare`, non invento un risultato. Ti chiedo il
valore nuovo, oppure metti «?» e te ne ricordi dopo.

Se una voce **finisce**, scegli tu: segnarla con «?» oppure eliminarla.

Le scadenze non si perdono: `110 g · scad. 29/8` meno 80 g diventa
`30 g · scad. 29/8`.

### La lista della spesa (tab Spesa)

Ci finiscono le cose che aggiungi a mano e quelle che prendi dal riquadro
**«ti manca»** di una proposta. Tocca una voce per spuntarla, «Togli le spuntate»
per ripulire dopo la spesa, «Copia la lista» per mandarla su WhatsApp.

Il generatore può proporre un piatto che richiede **al massimo 2 cose che non hai**,
mai la fonte proteica, e **almeno una delle tre proposte è sempre fattibile** con
quello che c'è in casa.

### Il diario (tab Cucino → Diario)

Si riempie da solo quando premi «Ho cucinato questo» e quando rispondi alla verifica del
mattino. Puoi aggiungere a mano qualsiasi pasto — **colazione, spuntino, pranzo, cena** —
con testo libero; proteine e kcal sono facoltative, e vale per tutti e due.

Mostra gli ultimi 14 giorni: giorno, piatti, proteine totali. Nient'altro — **nessun
punteggio, nessuna striscia di giorni, nessun grafico**.

### «Finora oggi»

Sul giorno di oggi, nel calendario e nel diario, compare una riga lilla: **finora oggi
X g proteine · Y kcal**. È quello che hai messo insieme **davvero**, non quello che era
previsto.

Compare solo per chi si è dato un **obiettivo** nel profilo. Se un giorno vuoi contare
anche tu, compila proteine o calorie nel tuo profilo e la riga comparirà da sola.

**Colazione e yogurt non vengono contati due volte.** Per Ciprian sono dati per scontati
ogni giorno (20 g · 290 kcal e 17 g · 100 kcal). Ma se quel giorno segni nel diario una
colazione vera, quella **sostituisce** quella di sempre invece di aggiungersi. Sotto il
totale c'è sempre scritto quale delle due sta usando, così il numero non arriva mai dal
nulla. E se la registri senza numeri, il totale si dichiara **parziale**.

Serve anche al generatore: legge gli ultimi 5 giorni e non ti ripropone la stessa
proteina più di due volte in tre giorni, né lo stesso piatto a due giorni di distanza.

### Quanto costa e perché c'è un tetto

Ogni generazione costa circa **2 centesimi** di credito Anthropic. Siccome l'app non
ha login, chiunque abbia l'indirizzo potrebbe premere Genera: per questo c'è un
**tetto di 30 generazioni al giorno**, controllato dal server e non aggirabile
dall'app. Nel caso peggiore la spesa si ferma a circa 60 centesimi al giorno.

Una **settimana intera** ne consuma **4**, perché il piano si costruisce due giorni per
volta. Se il margine di oggi non basta, l'app te lo dice **prima** di cominciare: non ti
lascia a metà. Restano comunque sette settimane al giorno.

Se un giorno le finisci per sbaglio, in Supabase → SQL Editor:

```sql
update public.generator_usage set count = 0 where day = current_date;
```

Per alzare o abbassare il tetto si cambia `MAX_AL_GIORNO` nella Edge Function.

### Se il generatore non risponde

I messaggi sono già scritti in italiano semplice. I due più probabili:

| Messaggio | Cosa fare |
|---|---|
| «Per oggi hai già usato tutte le 30 generazioni» | aspetta domani, o azzera il contatore col comando qui sopra |
| «Per generare la settimana servono 4 generazioni… e ne restano 1» | il margine di oggi non basta per una settimana intera: stessa cura di sopra |
| «Il credito del generatore è esaurito» | ricarica il credito su console.anthropic.com |

---

## Aggiornare il generatore su Supabase (il «deploy»)

Serve **solo** quando Claude ti dice che ha toccato `edge-function-cosa-cucino.ts`.
Non è una cosa da fare di routine: se nessuno te lo chiede, lascia stare.

**Perché tocca a te**: quel file non fa parte dell'app pubblicata. Sta su Supabase, in
un posto a cui si arriva solo entrando col tuo account — quindi l'unica persona che
può metterlo online sei tu.

### 1 · Copia il codice

Apri **`edge-function-cosa-cucino.ts`** (sta nella stessa cartella di `index.html`).
Va bene qualunque editor, anche il Blocco note.

- **Ctrl+A** per selezionare tutto
- **Ctrl+C** per copiare

⚠️ Dev'essere **tutto**, dalla prima riga all'ultima. Se ne copi solo un pezzo la
funzione non parte più e il generatore smette di rispondere.

### 2 · Incollalo su Supabase

1. Vai su **supabase.com** e accedi.
2. Apri il progetto (quello che nell'indirizzo ha `bixdbnhructlsxuvkmic`).
3. Colonna di sinistra → **Edge Functions**.
4. C'è una funzione sola, **`cosa-cucino`**: cliccaci sopra.
5. Cancella tutto il codice che vedi nel riquadro e incolla il nuovo (**Ctrl+V**).
6. Premi **Deploy** e aspetta la conferma verde. Ci mette una ventina di secondi.

⚠️ **Verify JWT deve restare spento.** È già così: non toccarlo. Se lo accendessi,
l'app smetterebbe di parlare con il generatore.

### 3 · Se c'è anche un file SQL da eseguire

Spesso una modifica al generatore ha bisogno anche di una colonna nuova nel database.
In quel caso Claude ti dice quale file `.sql` eseguire: apri **SQL Editor** nella
colonna di sinistra, incolla il contenuto del file e premi **Run**.

L'ordine fra le due cose non è importante — l'app è fatta per non rompersi nel
frattempo — ma è più pulito fare prima il file SQL e poi il deploy.

### Se qualcosa non torna

Non serve che tu capisca l'errore. **Copia il messaggio che vedi e mandalo a Claude**:
la diagnosi è il suo mestiere, e i tasti di Supabase cambiano ogni tanto.

---

## File della cartella

| File | A cosa serve | Pubblicato online? |
|---|---|---|
| `index.html` | l'app intera | sì |
| `apple-touch-icon.png` | l'icona sulla home dell'iPhone | sì |
| `setup.sql` | crea il database da zero (serve solo ripartendo da un progetto nuovo) | no |
| `cambio-accesso-libero.sql` | il passaggio ad app senza login (già eseguito) | sì |
| `edge-function-cosa-cucino.ts` | il generatore di ricette, da incollare in Supabase | sì (ma non è l'app: è una copia di riferimento) |
| `limite-generatore.sql` | il tetto giornaliero che protegge il credito | sì |
| `tabelle-piano-v5.sql` | crea la tabella del calendario (`plan_meals`) | sì |
| `tabelle-piano-v5-blocco4.sql` | aggiunge la colonna che ricorda i pasti scritti a mano | sì |
| `tabelle-staffetta.sql` | fa sì che la settimana si generi da sola sul server, col telefono spento | sì |
| `tabelle-ricette-complete.sql` | dà alle ricette un contenuto vero: ingredienti, grammi, proteine, kcal | sì |
| `tabelle-spesa-blocco5.sql` | fa sì che una riga della spesa sappia dire per quando serve | sì |
| `tabelle-costi.sql` | conta i token del generatore, per la stima di spesa nel menu | sì |
| `tabelle-nutrienti.sql` | i valori per 100 g, facoltativi, sulle voci di dispensa | sì |
| `tabelle-blocco6.sql` | procedimento, sostituzioni e la settimana svuota-frigo | sì |
| `tabelle-generatore-v4.sql` | lista della spesa e diario dei pasti | sì |
| `tabelle-profili-v6.sql` | i due profili, coi loro obiettivi e i loro divieti | sì |
| `tabelle-voti-v7.sql` | i voti delle ricette, uno per persona | sì |
| `pulizia-prova-piano.sql` | toglie la settimana finta di collaudo, se ricapita | sì |
| `prova-piano-v5.sql` | una settimana finta, solo per guardare il calendario | sì |
| `seed-dati-iniziali.sql` | carica inventario e ricette di partenza | sì |
| `README-OPERATIVO.md` | questo foglio | sì |
| `CLAUDE.md` | promemoria per le prossime chat con Claude | sì |
| `DATI-INIZIALI.txt` | la fotografia di partenza dell'11/08 | sì |

---

## Nota storica: perché non c'è il login

Era previsto un accesso con codice a 6 cifre via email. Non è stato possibile: Supabase,
con il servizio email gratuito incluso, **non permette di modificare il testo delle email**.
Arrivava quindi solo un link, e sull'iPhone i link aprono Safari invece della web app
aggiunta alla home, quindi l'accesso non si completava mai.

Per farlo funzionare servirebbe collegare un servizio email esterno (SMTP), che sblocca la
modifica dei testi. Si è preferito togliere il login del tutto.

Il 12/08/2026 la pulizia è stata completata: dal database è sparita anche la tabella con
l'elenco degli indirizzi autorizzati, e ogni tabella ha ora una sola regola, "accesso
libero". Se un domani volessi rimettere il login, le istruzioni sono in fondo a `setup.sql`
(quel file resta solo sul tuo computer, non è pubblicato).
