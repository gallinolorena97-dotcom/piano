# PROMPT PER CLAUDE CODE — v6: i due profili

## Premessa
Stessi patti: non sono programmatrice, italiano semplice, riassumi e chiedi conferma
prima di ogni azione con effetti. Leggi `CLAUDE.md`.

**Questo prompt viene PRIMA della v5** (`PROMPT-V5-PIANO-SETTIMANALE.md`), che resta
da fare dopo: il piano settimanale dovrà nascere già consapevole dei due profili.

Implementa un blocco alla volta con push separati. **Fermati dopo il blocco 3** e
fammi provare.

---

## Il contesto reale (serve per capire le scelte)
Siamo due persone con esigenze molto diverse che condividono una dispensa:

- **Lorena** (io): obiettivo 170 g di proteine e ~2.200 kcal al giorno, in deficit per
  dimagrire. Tollero benissimo la ripetizione: riso e tonno due giorni di fila mi va
  bene. Mangio sempre a casa.
- **X**: nessun obiettivo proteico, mangia normale. **Non mangia**: pomodoro crudo,
  cetrioli, interiora. **Rifiuta**: abbinamenti strani e piatti con troppi ingredienti
  diversi insieme. **Ama le verdure, mangia poca carne.** Vuole quasi sempre un
  **tocco dolce a fine pasto**. **Spesso non mangia a casa**, in modo irregolare.
- Nessuna intolleranza o allergia per nessuno dei due.
- Quando X non c'è, io cucino comunque ma **in modo più semplice**.

Conseguenza importante da tenere presente in tutto il progetto: i piatti che vanno
bene per entrambi sono meno di quanto sembri, e la parte proteica di X deve pescare
soprattutto da uova, formaggi, legumi e pesce, non dalla carne.

---

## BLOCCO 1 — Profili e selettore
- Nuova tabella `profiles`: nome, target proteico, target kcal, tolleranza alla
  ripetizione (alta/bassa), lista "non mangia" (vincolo assoluto), lista "evita"
  (preferenza forte), lista "ama" (da privilegiare), note libere.
- Precarica i due profili con i dati del contesto qui sopra.
- **Selettore in cima all'app: "sono Lorena" / "sono X"**, salvato sul dispositivo
  (non è un login, non serve password: ognuno lo imposta una volta sul proprio
  telefono). Deve restare impostato tra le sessioni.
- Una schermata **Profilo** dove modificare le proprie liste e i propri target,
  con campi semplici: si aggiunge un alimento scrivendolo, si toglie con una ×.
- I profili sono modificabili da entrambi, ma ognuno vede il proprio per primo.

## BLOCCO 2 — Il generatore diventa consapevole di chi c'è
Nella tab "Cosa cucino", la domanda **chi mangia** diventa il vincolo principale:

- **Solo Lorena** → target proteico pieno (55-70 g nel pasto), piatto semplice e
  veloce: la ripetizione è ammessa, non serve varietà forzata.
- **Solo X** → nessun target proteico, pasto normale ed equilibrato, molte verdure,
  poca carne, ingredienti pochi e riconoscibili, tocco dolce incluso.
- **Entrambi** → è il caso difficile, e va risolto così:
  1. Il piatto deve rispettare **tutti i divieti di X** (pomodoro crudo, cetrioli,
     interiora) e la sua regola dei pochi ingredienti. I divieti non si negoziano.
  2. Le porzioni sono diverse: le mie proteiche, le sue normali.
  3. **La fonte proteica può essere diversa per i due**: stesso contorno e stessa
     base, ma per me il pollo e per lei le uova o il formaggio, se è più sensato.
     Dichiaralo chiaramente sulla proposta.
  4. Se un piatto unico non riesce a soddisfare entrambi, **proponi due piatti
     distinti** che condividano il contorno o il tempo di cottura, invece di
     inventare compromessi che non piaceranno a nessuno.
  5. Per X aggiungi sempre un suggerimento di **tocco dolce finale**, pescando da
     quello che c'è in dispensa. Non è un extra opzionale: è parte del suo pasto.

Regola sulla varietà: applicala **per persona**. Per X mai la stessa cosa ravvicinata;
per me la ripetizione non è un problema.

## BLOCCO 3 — Streaming: ridurre l'attesa
Oggi la generazione è lenta e si aspetta in silenzio.

- Usa lo **streaming** della risposta del modello: la prima proposta deve comparire
  appena è pronta, le altre due arrivano dopo, mentre leggo la prima.
- Se lo streaming complica troppo le cose, in alternativa genera le proposte con
  **tre chiamate parallele** invece di una sola che le produce tutte insieme.
- Nel frattempo mostra un avanzamento onesto ("sto pensando alla prima proposta…"),
  non una rotella muta.
- **Non cambiare modello per andare più veloce**: serve la precisione sui conti di
  proteine e grammature. Resta su claude-sonnet-5.
- Conta il tutto come **una sola generazione** rispetto al tetto giornaliero.

### ⛔ FERMATI QUI e fammi provare i blocchi 1-3.

---

## BLOCCO 4 — Ricette e voti per persona
- I voti ♥ / OK / NO diventano **per profilo**: il ♥ mio non è il ♥ di X.
- Nella tab Ricette mostra i voti di entrambi affiancati, così si vede a colpo
  d'occhio cosa piace a tutti e due.
- Il generatore, per un pasto condiviso, privilegia i piatti con ♥ da entrambi ed
  esclude quelli con **NO da uno qualsiasi dei due**.

## BLOCCO 5 — Il registro sa chi c'era
- Nel registro dei pasti (quando arriverà con la v5) segna **chi ha mangiato cosa**.
- Serve a due cose: sapere quanto spesso X mangia davvero a casa, e non ripetere a
  X un piatto che ha già avuto di recente.

---

## Vincoli invariati
- Nessuna autenticazione: il selettore di profilo NON è un login e non protegge nulla.
- Tutto in `index.html`, niente framework né build step.
- Chiave API solo nei Secrets di Supabase.
- Mobile-first, si usa con una mano in cucina.
- Nessun cibo è proibito per motivi morali, i pasti liberi non sono sgarri, nessun
  tono di colpa, nessuna streak o punteggio. Il tocco dolce di X è una preferenza
  legittima, non una concessione.

## Deliverable
1. Blocchi 1-3 con push separati, poi stop.
2. Il file SQL per le nuove tabelle (senza righe decorative di ==== o ----).
3. `CLAUDE.md` aggiornato, con nota che la v5 andrà fatta dopo e dovrà tenere conto
   dei profili.
4. Checklist di collaudo dall'iPhone.
