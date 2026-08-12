# Collaudo del generatore — da fare insieme, una volta sola

Sono 6 passaggi. Fermati al primo che non torna e dimmelo: ti do **una** cosa da
provare alla volta.

---

## 1 · Il freno di spesa (Supabase → SQL Editor)

Incolla tutto il file `limite-generatore.sql` e premi **Run**.

✅ **Deve uscire:** una riga con `policy_presenti = 0`.
Zero è giusto: significa che il contatore è invisibile dall'esterno.

---

## 2 · La funzione (Supabase → Edge Functions)

1. **Edge Functions** → **Deploy a new function** → **Via editor**
2. Nome esatto: **`cosa-cucino`** (tutto minuscolo, col trattino)
3. Cancella il codice di esempio e incolla tutto `edge-function-cosa-cucino.ts`
4. **Importante:** cerca l'interruttore **"Verify JWT"** e mettilo su **OFF**.
   L'app non ha login, quindi non ha nessun token da mostrare: se resta acceso,
   il generatore risponde sempre "non autorizzato".
5. **Deploy**

✅ **Deve uscire:** la funzione compare nell'elenco con lo stato *Active*.

---

## 3 · La chiave API — controllo, non inserimento

La chiave l'hai già messa nei Secrets. Qui **verifichiamo solo che la funzione la
trovi**, qualunque nome tu le abbia dato.

Nella pagina della funzione, apri **Test** (o "Invoke") e manda come corpo:

```json
{ "controllo": true }
```

✅ **Deve rispondere una cosa così:**

```json
{
  "chiave_trovata": true,
  "nome_del_secret": "ANTHROPIC_API_KEY",
  "tetto_giornaliero": 30,
  "modello": "claude-sonnet-5"
}
```

Il campo che conta è **`chiave_trovata: true`**. Il nome può essere qualunque:
la funzione cerca prima i nomi più comuni e poi, se non li trova, qualunque
secret il cui valore inizi con `sk-ant-`.

> ⚠️ La risposta **non mostra mai la chiave**, solo il suo nome. Se ti uscisse
> `chiave_trovata: false`, mandami quello che c'è in `secrets_simili_presenti`
> e capiamo insieme: non serve che mi incolli la chiave.

Questo controllo **non consuma** nessuna delle 30 generazioni.

---

## 4 · Una generazione vera (dall'iPhone)

Apri l'app, tab **Cosa cucino**, lascia i valori come stanno, **Genera**.

✅ **Devono uscire 3 schede**, ognuna con:
- nome del piatto
- ingredienti con i grammi
- **proteine in evidenza** — controlla che siano fra 55 e 70 g
- kcal e minuti
- il fiocco ❄ con l'istruzione di scongelamento, **se** usa qualcosa dal congelatore

❌ **Se resta a "Sto pensando ai piatti…" per più di un minuto**, dimmelo:
è quasi sempre il "Verify JWT" del passaggio 2.

---

## 5 · I tre pulsanti

Su una scheda qualsiasi:

- **↻ Un'altra** → cambia solo quella scheda, le altre due restano ferme
- **✎ Personalizza** → scrivi «senza pomodoro» → la scheda si rigenera e
  proteine e kcal sono ricalcolate
- **✓ Scelgo questa** → controlla nella tab **Ricette** che ci sia col ♥

---

## 6 · Lo scalo della dispensa

Dopo aver premuto **✓ Scelgo questa**, compare il pannello verde.

✅ **Deve:** elencare solo ingredienti che hai davvero in dispensa, con la
quantità che resta già calcolata.

Correggi quello che non torna, premi **Sì, aggiorna la dispensa**, poi vai nella
tab **Dispensa** e controlla che i numeri siano cambiati.

---

## Cose che è giusto NON vedere

- nessun pulsante Accedi da nessuna parte
- nessuna richiesta di password o email
- la chiave API non compare mai a schermo, in nessun messaggio

---

## Dopo il collaudo

Se tutto è andato, controlla il contatore in Supabase → SQL Editor:

```sql
select * from public.generator_usage order by day desc limit 7;
```

Deve mostrare il numero di generazioni fatte oggi durante la prova.
