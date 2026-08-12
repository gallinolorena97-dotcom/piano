# Collaudo v4 — da fare dall'iPhone

Un blocco alla volta. Fermati al primo che non torna e dimmelo: ti do **una** cosa
da provare per volta.

Prima di cominciare: apri l'app e **ricaricala** (chiudi e riapri dalla home).
Devi vedere **cinque** tab: Piano · Dispensa · Ricette · Cucino · Spesa.

---

## Prima di tutto: la funzione aggiornata

I blocchi 2 e 3 cambiano anche il generatore, quindi va reincollato **una volta sola**.

1. Supabase → **Edge Functions** → `cosa-cucino` → **Edit**
2. Cancella tutto e incolla di nuovo `edge-function-cosa-cucino.ts`
3. **Deploy**

Cosa cambia: può proporre piatti con 1-2 ingredienti che non hai (segnalati), e
legge il diario per non ripeterti.

---

## Blocco 1 · «Ho cucinato questo»

1. Tab **Cucino** → **Genera 3 proposte** (aspetta ~mezzo minuto)
2. Su una scheda premi **✓ Ho cucinato questo**
3. Si apre l'elenco degli ingredienti

✅ **Devi vedere**, sotto ogni riga, una di queste tre cose:
- *Resta 100 g* (verde) — il conto è sicuro
- *Finisce* (arancione) con la scelta fra **Segna «?»** ed **Elimina**
- *Non faccio i conti: …* (azzurro) con il motivo e un campo per scrivere tu

4. **Cambia un numero** a mano (metti 300 dove c'era 250) e guarda il verde aggiornarsi
5. **Conferma e aggiorna**

✅ Poi controlla:
- tab **Dispensa**: le quantità sono cambiate
- una voce con la scadenza (es. Prosciutto cotto) **ha ancora la sua scadenza**
- tab **Ricette**: il piatto c'è col ♥
- premi **Annulla** nel messaggio in basso → torna tutto com'era

❌ Se una quantità tipo `~1 kg` o `sì` viene calcolata lo stesso, **fermati e dimmelo**:
è esattamente ciò che non deve succedere.

---

## Blocco 2 · Spesa

1. Tab **Spesa** → scrivi «pane» → **+**
2. Tocca la voce: si spunta e si barra
3. **Togli le spuntate** → sparisce, con l'annulla disponibile
4. **Copia la lista** → incollala da qualche parte e controlla il testo

Poi, dalle proposte:

5. Tab **Cucino** → **Genera** → se una scheda mostra **«Ti manca: …»**,
   premi **+ Aggiungi alla spesa**
6. Torna in **Spesa**: ci sono

✅ **Almeno una delle 3 proposte non deve avere nessun «ti manca»**: dev'essere
fattibile con quello che hai in casa.

❌ Se «ti manca» contiene la **carne o il pesce principale** del piatto, dimmelo:
la fonte proteica deve sempre essere roba che hai già.

---

## Blocco 3 · Diario

1. Tab **Cucino** → interruttore in alto → **Diario**
2. Scrivi «Pizza fuori», lascia la data di oggi, metti pranzo → **+**

✅ **Devi vedere** la giornata con il piatto e, se hai messo le proteine, il totale
in alto a destra.

3. Premi **×** su una riga → sparisce, con l'annulla
4. **Copia il riepilogo della settimana** → controlla il testo

Poi la parte che conta davvero:

5. Torna su **Proposte** e **Genera**

✅ Le proposte **non devono ripetere** la proteina dei giorni che hai appena
registrato. Se ieri hai segnato pollo due volte, oggi il pollo non dovrebbe uscire.

---

## Cose che è giusto NON vedere, in tutta l'app

- nessun punteggio, nessuna striscia di giorni consecutivi, nessun grafico
- nessun tono da pagella su quello che hai mangiato
- nessuna richiesta di login

---

## Se qualcosa si rompe

Il messaggio di errore è sempre in italiano. Mandami la frase esatta che leggi:
mi basta quella per capire dove guardare.
