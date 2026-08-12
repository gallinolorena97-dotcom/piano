---
description: Trasforma il piano settimanale incollato in un file SQL da eseguire su Supabase
---

Devi caricare nel database il piano settimanale che l'utente ha incollato qui sotto.

L'utente **non è programmatrice**: parla in italiano semplice e non mostrare codice
se non è indispensabile.

> ⚠️ Da v5 questo comando è un **ripiego**, per i piani scritti a mano in chat.
> La strada normale è il tasto **«Genera la settimana»** dentro l'app.
> Scrive in **`plan_meals`** (una riga per pasto). La vecchia `plan_days` non si usa più:
> non scriverci mai.

## Piano incollato

$ARGUMENTS

---

## Procedura da seguire, nell'ordine

### 1. Parsing

Trasforma il testo in **una riga per ogni pranzo e ogni cena**, secondo lo schema di
`plan_meals` documentato in `tabelle-piano-v5.sql`.

Regole di lettura:

- `day` in formato `AAAA-MM-GG`, `pasto` = `pranzo` oppure `cena`.
- `piatto` = la riga come è scritta («Riso 80 g, pollo 150 g, piselli»).
- `ingredienti` (JSON) si compila **solo quando le quantità sono chiaramente separabili**:
  `[{"nome":"Riso","qta":"80 g","per":"tutti"}]`. Al primo dubbio lascia `'[]'::jsonb`:
  meglio vuoto che inventato.
- `chi` vale `ciprian`, `entrambi` oppure `lorena`. **Se il testo non lo dice, chiedilo**
  una volta sola per tutta la settimana: non tirare a indovinare.
- `modo` è `casa`, salvo che la riga dica che si mangia **fuori** (`fuori`) o che è un
  **pasto libero** (`libero`). I due pasti liberi settimanali sono parte del metodo:
  non chiamarli mai "sgarri" e non segnalarli come anomalie.
- `prot` e `kcal` **solo se al pasto c'è Ciprian**. Nei pasti di sola Lorena restano vuoti.
- `stato` = `confermato` per tutte le righe: è un piano scritto a mano, non una bozza.
- Le righe che iniziano con **❄** sono promemoria di scongelamento. Vanno messe
  **sul pasto a cui si riferiscono** (di solito il giorno dopo), in `scongelamento`, con
  `scongelare_il` = **il giorno su cui erano scritte**. Se non è chiaro a quale pasto si
  riferiscano, chiedilo invece di indovinare.
- Le righe **TOT** si ignorano: i totali ora li calcola l'app da sola, e ci aggiunge le
  voci fisse di Ciprian. Dillo all'utente nel riepilogo.
- Le righe **COLAZIONE** e **SPUNTINO** non entrano: `plan_meals` tiene solo pranzo e cena,
  e colazione e yogurt sono già dentro ai totali dell'app. Dillo nel riepilogo.
- Ogni altra annotazione diventa `nota` sul pasto che segue; se riguarda tutta la
  giornata, mettila sul pranzo.

Se l'anno non è scritto nel testo, deduci l'anno corrente; se la settimana scavalca
il capodanno, chiedi conferma invece di indovinare.

### 2. Riepilogo — PRIMA di scrivere qualsiasi cosa

Mostra all'utente una tabellina con:
- le **date coperte** (dalla prima all'ultima) e il giorno della settimana;
- per ogni giorno: **pranzo e cena**, con chi mangia;
- quali pasti hanno **già** una riga nel database (verrebbero sovrascritti) e quali sono nuovi;
- cosa hai **lasciato fuori** (colazioni, spuntini, righe TOT) e perché;
- eventuali righe che non sei riuscito a interpretare, citate testualmente.

### 3. Conferma

Chiedi esplicitamente: **«Confermi che scriva questi pasti nel database?»**
Non procedere finché non risponde di sì.

### 4. Genera il file SQL

Dopo il sì, scrivi `piano-SETTIMANA-<data-inizio>.sql` nella cartella del progetto, con un
`insert … on conflict (day, pasto) do update` per ogni pasto:

```sql
insert into public.plan_meals
  (day, pasto, modo, chi, stato, piatto, ingredienti, prot, kcal)
values
  ('2026-08-17', 'pranzo', 'casa', 'entrambi', 'confermato',
   'Riso 80 g, pollo 150 g, piselli', '[]'::jsonb, 55, 720)
on conflict (day, pasto) do update set
  modo = excluded.modo, chi = excluded.chi, stato = excluded.stato,
  piatto = excluded.piatto, ingredienti = excluded.ingredienti,
  prot = excluded.prot, kcal = excluded.kcal;
```

⚠️ **Non generare mai `delete`**: i giorni vecchi restano come storico.
⚠️ Negli apostrofi usa il raddoppio (`''`), altrimenti l'SQL si rompe.
⚠️ Niente righe decorative di `====` o `----`: rompono il copia-incolla.

### 5. Spiega cosa fare

Dì all'utente, in tre righe:
1. apri Supabase → **SQL Editor**;
2. incolla il contenuto del file e premi **Run**;
3. riapri l'app sull'iPhone: il piano nuovo c'è.

Ricordale che questi file `piano-SETTIMANA-*.sql` si possono cancellare dopo l'uso:
il dato vero ormai vive nel database.
