---
description: Trasforma il piano settimanale incollato in un file SQL da eseguire su Supabase
---

Devi caricare nel database il piano settimanale che l'utente ha incollato qui sotto.

L'utente **non è programmatrice**: parla in italiano semplice e non mostrare codice
se non è indispensabile.

## Piano incollato

$ARGUMENTS

---

## Procedura da seguire, nell'ordine

### 1. Parsing

Trasforma il testo in un record per ogni giorno, secondo lo schema di
`plan_days.payload` documentato in `CLAUDE.md`.

Regole di lettura:
- Ogni **giorno** apre una card. Ricava la data (`day`, formato `AAAA-MM-GG`) e la
  scritta da mostrare (`label`, per esempio `Lunedì 11/08`).
- Se accanto al giorno c'è un'annotazione breve (allenamento, riposo, fuori casa…),
  mettila in `tag`.
- Le righe **PRANZO / CENA / COLAZIONE / SPUNTINO** diventano `{"type":"meal","title":…,"text":…}`.
  Se ci sono kcal o grammi di proteine, mettili in `kcal` e `prot` come **numeri**.
- Le righe che iniziano con **❄** diventano `{"type":"freezer","text":…}` — togli il fiocco
  dal testo, lo rimette l'app.
- Le righe **TOT** diventano `tot: {"kcal":…, "prot":…}`.
- Tutto il resto diventa `{"type":"note","text":…}`.

Se l'anno non è scritto nel testo, deduci l'anno corrente; se la settimana scavalca
il capodanno, chiedi conferma invece di indovinare.

### 2. Riepilogo — PRIMA di scrivere qualsiasi cosa

Mostra all'utente una tabellina con:
- le **date coperte** (dalla prima all'ultima) e il giorno della settimana;
- **quanti pasti** per ogni giorno;
- quali giorni hanno **già** un piano nel database (verrebbero sovrascritti) e quali sono nuovi;
- eventuali righe che non sei riuscito a interpretare, citate testualmente.

I **due pasti liberi settimanali** sono parte del metodo: trattali come slot normali,
non chiamarli "sgarri" e non segnalarli come anomalie.

### 3. Conferma

Chiedi esplicitamente: **«Confermi che scriva questi giorni nel database?»**
Non procedere finché non risponde di sì.

### 4. Genera il file SQL

Dopo il sì, scrivi `piano-SETTIMANA-<data-inizio>.sql` nella cartella del progetto, con un
`insert … on conflict (day) do update` per ogni giorno:

```sql
insert into public.plan_days (day, payload) values
  ('2026-08-17', '{ … }'::jsonb)
on conflict (day) do update set payload = excluded.payload;
```

⚠️ **Non generare mai `delete`**: i giorni vecchi restano come storico.
⚠️ Negli apostrofi del JSON usa il raddoppio (`''`), altrimenti l'SQL si rompe.

### 5. Spiega cosa fare

Dì all'utente, in tre righe:
1. apri Supabase → **SQL Editor**;
2. incolla il contenuto del file e premi **Run**;
3. riapri l'app sull'iPhone: il piano nuovo c'è.

Ricordale che questi file `piano-SETTIMANA-*.sql` si possono cancellare dopo l'uso:
il dato vero ormai vive nel database.
