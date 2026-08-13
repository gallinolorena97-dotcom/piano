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
   Ci vuole meno di un minuto.
3. Premi **Genera il piano** e aspetta un paio di minuti. I piatti compaiono uno alla
   volta mentre vengono scritti. **Non ricaricare la pagina.**
4. **Il riepilogo**: giorno per giorno cosa si mangia, i totali di Ciprian, cosa manca
   e cosa resterà in dispensa. Qui non è ancora salvato niente.
5. **Salva nel calendario** — oppure **Rifai la passata** se qualcosa non torna, o
   **Butta via** se non ti convince.
6. Le cose che mancano finiscono da sole nella lista della **Spesa**.

**Durante la settimana:** aggiorni Dispensa e Ricette dall'app, e premi
**✓ Ho cucinato questo** quando cucini, così la dispensa resta vera.

I giorni passati non si cancellano mai: restano come storico.

> **Il ripiego.** Se un piano ti arriva già scritto in chat, si carica ancora alla
> vecchia maniera: `/piano-settimana` in Claude Code, poi il file SQL su Supabase.
> Serve solo in quel caso.

**Quanto costa una settimana:** 3 delle 30 generazioni giornaliere (sono tre chiamate
vere, una per ogni blocco di giorni). Restano dieci settimane al giorno.

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
nella tab Spesa.

**Dispensa** — aggiungi con nome, quantità e categoria; tocca la quantità per correggerla;
la **×** elimina, e per 8 secondi hai il tasto **Annulla**.
Se in una quantità scrivi un `?` (per esempio `? da contare`) la voce si colora di ambra
e finisce nell'elenco **DA VERIFICARE**.

**Ricette** — i tre tasti **♥ / OK / NO** sono interruttori: premi una volta per dare il voto,
ripremi lo stesso tasto per toglierlo.

**Copia per Claude** — il tasto in alto copia tutto l'inventario e le ricette in formato testo,
pronto da incollare in chat.

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

Si riempie da solo quando premi «Ho cucinato questo». Puoi aggiungere a mano i pasti
fuori casa. Mostra gli ultimi 14 giorni: giorno, piatti, proteine totali. Nient'altro
— **nessun punteggio, nessuna striscia di giorni, nessun grafico**.

Serve anche al generatore: legge gli ultimi 5 giorni e non ti ripropone la stessa
proteina più di due volte in tre giorni, né lo stesso piatto a due giorni di distanza.

### Quanto costa e perché c'è un tetto

Ogni generazione costa circa **2 centesimi** di credito Anthropic. Siccome l'app non
ha login, chiunque abbia l'indirizzo potrebbe premere Genera: per questo c'è un
**tetto di 30 generazioni al giorno**, controllato dal server e non aggirabile
dall'app. Nel caso peggiore la spesa si ferma a circa 60 centesimi al giorno.

Una **settimana intera** ne consuma **3**, perché il piano si costruisce in tre pezzi.
Se il margine di oggi non basta per tutti e tre, l'app te lo dice **prima** di
cominciare: non ti lascia a metà.

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
| «Per generare la settimana servono 3 generazioni… e ne restano 1» | il margine di oggi non basta per una settimana intera: stessa cura di sopra |
| «Il credito del generatore è esaurito» | ricarica il credito su console.anthropic.com |

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
