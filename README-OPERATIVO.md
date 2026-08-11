# Piano & Dispensa — istruzioni operative

---

## ⭐ La routine settimanale (le 10 righe che servono davvero)

1. Apri la chat con Claude Code nella cartella `piano`.
2. Scrivi `/piano-settimana` e subito sotto incolla il piano della settimana.
3. Claude ti mostra un riepilogo: quali date copre, quanti pasti per giorno.
4. Controlla che le date siano giuste e rispondi **sì** per confermare.
5. Claude genera il file SQL e te lo dice.
6. Apri Supabase → **SQL Editor** → incolla il file → **Run**.
7. Apri l'app sull'iPhone e tira giù per ricaricare: il piano nuovo è lì.
8. Durante la settimana aggiorni Dispensa e Ricette direttamente dall'app.
9. Quando vuoi consigli, premi **Copia per Claude** e incolla in chat.
10. I piani vecchi restano come storico: non si cancella mai niente.

---

## Prima accensione (una volta sola)

### 1. Preparare il database

1. Vai su [supabase.com](https://supabase.com) ed entra nel progetto.
2. Nel menù a sinistra scegli **SQL Editor**.
3. Apri il file `setup.sql` (è nella cartella `piano` sul computer), copia **tutto**, incolla nell'editor e premi **Run**.
   Se non compaiono scritte rosse, è andata bene.
4. Ripeti la stessa cosa con il file `seed-dati-iniziali.sql`: carica inventario e ricette.
   Alla fine ti mostra una tabellina di controllo: devono risultare
   **frigo 17 · freezer 15 · dispensa 19 · ricette 14**.

> `setup.sql` contiene il tuo indirizzo email e **resta sul computer**: è già escluso
> dal repository pubblico. `seed-dati-iniziali.sql` invece non contiene nulla di personale.

### 2. Far arrivare il codice via email

L'app ti fa entrare con un **codice a 6 cifre** invece che con la password.
Perché arrivi il codice e non solo un link (i link, sull'iPhone, aprono Safari e non l'app):

1. Supabase → **Authentication** → **Emails** (o *Email Templates*) → scheda **Magic Link**.
2. Nel testo del messaggio aggiungi questa riga:

   ```
   <p>Il tuo codice è: <b>{{ .Token }}</b></p>
   ```

3. Salva. Da adesso ogni email conterrà sia il link sia il codice.

### 3. Mettere l'icona sull'iPhone

1. Apri l'indirizzo dell'app in **Safari** (non in Chrome).
2. Premi il tasto **Condividi** (il quadrato con la freccia).
3. Scegli **Aggiungi a Home**.

---

## Come si usa, tab per tab

**Piano** — solo da leggere. Il giorno di oggi ha il badge **OGGI** e l'app ci scorre da sola all'apertura.

**Dispensa** — dopo il login compaiono i comandi: aggiungi con nome, quantità e categoria;
tocca la quantità per correggerla; la **×** elimina, e per 8 secondi hai il tasto **Annulla**.
Se in una quantità scrivi un `?` (per esempio `? da contare`) la voce si colora di ambra
e finisce nell'elenco **DA VERIFICARE**.

**Ricette** — i tre tasti **♥ / OK / NO** sono interruttori: premi una volta per dare il voto,
ripremi lo stesso tasto per toglierlo.

**Copia per Claude** — il tasto in alto copia tutto l'inventario e le ricette in formato testo.
Poi lo incolli in chat.

---

## Chi può fare cosa

| | Leggere | Modificare |
|---|---|---|
| Chiunque abbia il link (anche X) | ✅ senza login | ❌ |
| Tu, dopo il login | ✅ | ✅ |

Per autorizzare un'altra persona a modificare: Supabase → **Table Editor** →
tabella `allowed_writers` → **Insert row** → scrivi la sua email.

---

## Se qualcosa non va

| Cosa vedi | Cosa fare |
|---|---|
| «Non riesco a raggiungere il database» | Sei senza rete, o Supabase è in pausa. Apri supabase.com e controlla che il progetto sia attivo. |
| «Questa email non è autorizzata a modificare» | Hai fatto il login con un'email diversa da quella nell'allowlist. Esci e rientra con quella giusta. |
| «Codice sbagliato o scaduto» | I codici durano poco: chiedine uno nuovo con **Indietro** → **Inviami il codice**. |
| Non arriva l'email | Guarda nello spam. Se non c'è, hai chiesto troppi codici di fila: aspetta un minuto. |
| La pagina resta vuota | Chiudi del tutto l'app dall'iPhone e riaprila. |

---

## File della cartella

| File | A cosa serve | Pubblicato online? |
|---|---|---|
| `index.html` | l'app intera | sì |
| `apple-touch-icon.png` | l'icona sulla home dell'iPhone | sì |
| `setup.sql` | crea il database (contiene la tua email) | **no** |
| `seed-dati-iniziali.sql` | carica inventario e ricette di partenza | sì |
| `README-OPERATIVO.md` | questo foglio | sì |
| `CLAUDE.md` | promemoria per le prossime chat con Claude | sì |
| `DATI-INIZIALI.txt` | la fotografia di partenza dell'11/08 | sì |
