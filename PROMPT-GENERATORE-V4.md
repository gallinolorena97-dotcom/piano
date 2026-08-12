# PROMPT PER CLAUDE CODE — Generatore v4: le estensioni

## Premessa
Stessi patti: non sono programmatrice, italiano semplice, riassumi e chiedi conferma
prima di ogni azione con effetti. Leggi `CLAUDE.md`. Questa è un'estensione del
generatore esistente ("Cosa cucino"), non una riscrittura: tutto ciò che funziona
resta com'è.

**Importante — l'ordine conta.** Implementa nell'ordine indicato e fai un push dopo
ogni blocco, così posso provare per gradi. I blocchi 1-3 sono la priorità: se
finisci il tempo o la cosa si complica, meglio 3 blocchi solidi che 8 traballanti.

---

## BLOCCO 1 — "Ho cucinato questo" (il più importante)
Oggi la dispensa si aggiorna solo se ricordo di farlo a mano, e infatti diverge
dalla realtà in due giorni. Questo blocco lo risolve.

- Sulla card di una proposta, al posto (o accanto) a "✓ Scelgo questa", metti
  **"Ho cucinato questo"**.
- Al tocco si apre un riepilogo **modificabile** degli ingredienti con le quantità:
  posso correggere prima di confermare (ho usato 280 g di pollo, non 250).
- Alla conferma: sottrai le quantità dalla dispensa.
- Regole di scalo, importanti:
  - Se la quantità in dispensa è testo non numerico (es. "5-6 confezioni", "sì",
    "? da verificare"), NON tentare calcoli: chiedimi tu il nuovo valore, oppure
    marca la voce con "?" così mi ricordo di controllarla.
  - Se la quantità va a zero o sotto, chiedimi se eliminare la voce o portarla a "?".
  - Mostrami sempre il riepilogo di cosa stai per cambiare e fammi confermare.
  - Prevedi un **annulla** subito dopo, in caso di errore.
- Registra il pasto nella cronologia (vedi blocco 3).

## BLOCCO 2 — "Cosa manca" e lista della spesa
- Se una proposta è buona ma richiede 1-2 ingredienti che non ho, il generatore può
  proporla lo stesso, purché li segnali chiaramente come **"ti manca: X"** —
  distinti dagli ingredienti che ho.
- Regola: al massimo 2 ingredienti mancanti per proposta, e mai la fonte proteica
  principale. Almeno una delle 3 proposte deve essere sempre fattibile con ciò che ho.
- Nuova tabella `shopping_list` e una **lista della spesa** nell'app: ci finiscono gli
  ingredienti mancanti che scelgo di aggiungere, più quelli che aggiungo a mano.
  Voci spuntabili, con possibilità di svuotare le spuntate.
- Bottone per copiare la lista in testo (per WhatsApp o per incollarla a Claude).

## BLOCCO 3 — Cronologia dei pasti
- Nuova tabella `meals_log`: data, quale pasto (pranzo/cena), nome del piatto,
  proteine e kcal stimate, chi c'era.
- Si popola da "Ho cucinato questo", e deve essere possibile **aggiungere un pasto a
  mano** (ho mangiato fuori, ho cucinato altro, non ho usato il generatore).
- Il generatore legge gli ultimi 5 giorni e **non ripropone la stessa proteina
  principale più di 2 volte in 3 giorni**, né lo stesso piatto a distanza di 2 giorni.
- Nell'app: una vista semplice degli ultimi 14 giorni (giorno, piatti, proteine totali).
  Nessun punteggio, nessuna streak, nessun grafico di aderenza — solo il registro.
- Bottone "copia il riepilogo della settimana" in testo, per portarlo in chat.

## BLOCCO 4 — Il piatto scritto come si deve
- Ogni proposta, oltre a ingredienti e grammi, include il **procedimento**: passi
  numerati, brevi, in italiano, con i tempi reali di cottura.
- Se il piatto è banale (un'insalatona), bastano 2-3 righe: non gonfiare.
- Il procedimento si salva insieme alla ricetta quando scelgo "Ho cucinato questo".

## BLOCCO 5 — Chi mangia: tre casi, non due
La domanda "chi mangia" oggi ha 2 opzioni. Portala a 3:
- **solo io** → target proteico pieno (55-70 g nel pasto)
- **io e X** → stesso piatto, porzioni diverse (mie proteiche, sue normali)
- **solo X** → pasto normale ed equilibrato, senza target proteico, porzione singola

## BLOCCO 6 — Sostituzioni
- Se manca un ingrediente non essenziale, il generatore propone da sé l'alternativa
  presente in dispensa ("niente pesto: uso pomodorini e grana"), invece di scartare
  il piatto.
- Nella personalizzazione libera, se chiedo di togliere qualcosa, deve proporre con
  cosa sostituirlo, non limitarsi a rimuoverlo.

## BLOCCO 7 — Modalità "svuota il frigo"
- Un interruttore accanto a Genera. Quando è attivo, il criterio cambia: massimizzare
  il numero di ingredienti in scadenza o aperti consumati, anche a costo di un piatto
  meno bilanciato.
- Anche in questa modalità **il minimo proteico resta 40 g** per un pasto principale.
- Utile prima della spesa o prima di partire.

## BLOCCO 8 — Colazione e spuntino
- Aggiungi "colazione" e "spuntino" tra i tipi di pasto.
- Riferimenti: colazione ~20 g di proteine e ~290 kcal; spuntino ~17 g e ~100 kcal.
- Proposte veloci e realistiche, coerenti con quello che ho in dispensa.

---

## Vincoli invariati (valgono per tutto)
- Nessuna autenticazione: l'app resta aperta.
- Tutto dentro `index.html`, niente framework né build step.
- Chiave API solo nei Secrets di Supabase, mai nel frontend.
- Stessa identità visiva; mobile-first, si usa con una mano in cucina.
- I vincoli del metodo restano quelli del prompt precedente: 170 g di proteine al
  giorno, pesi a crudo, deperibili per primi, catena delle doppie porzioni, promemoria
  di scongelamento, due pasti liberi a settimana che non sono sgarri, nessun cibo
  proibito, nessun tono di colpa.
- **Niente punteggi, streak, badge o grafici di aderenza**: il registro è un registro.

## Deliverable
1. I blocchi implementati, con un push dopo ciascuno.
2. Il file SQL per le nuove tabelle, da eseguire su Supabase (senza righe decorative
   di ==== o ----: si rompe il copia-incolla).
3. `CLAUDE.md` e `README-OPERATIVO.md` aggiornati.
4. Una checklist di collaudo per blocco, da fare insieme dall'iPhone.
