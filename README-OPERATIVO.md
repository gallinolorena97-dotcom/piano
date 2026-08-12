# Piano & Dispensa — istruzioni operative

L'app è qui: **https://gallinolorena97-dotcom.github.io/piano/**

Non c'è nessun login: apri e usi, tutte le schede sono già modificabili. Nessun pulsante
Accedi, nessuna email, nessun codice. Lo stesso vale per chiunque abbia l'indirizzo.

---

## ⭐ La routine settimanale (le 10 righe che servono davvero)

1. Apri la chat con Claude Code nella cartella `piano`.
2. Scrivi `/piano-settimana` e subito sotto incolla il piano della settimana.
3. Claude ti mostra un riepilogo: quali date copre, quanti pasti per giorno.
4. Controlla che le date siano giuste e rispondi **sì** per confermare.
5. Claude genera il file SQL e te lo dice.
6. Apri Supabase → **SQL Editor** → incolla il file → **Run**.
7. Apri l'app sull'iPhone e ricaricala: il piano nuovo è lì.
8. Durante la settimana aggiorni Dispensa e Ricette direttamente dall'app.
9. Quando vuoi consigli, premi **Copia per Claude** e incolla in chat.
10. I piani vecchi restano come storico: non si cancella mai niente.

---

## Come si usa, tab per tab

**Piano** — solo da leggere. Il giorno di oggi ha il badge **OGGI** e l'app ci scorre da sola
all'apertura.

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
