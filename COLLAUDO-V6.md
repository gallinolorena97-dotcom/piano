# Collaudo v6 — i due profili

Un blocco alla volta. Fermati al primo che non torna e dimmelo.

## Prima di tutto: due installazioni

**1. La tabella dei profili**
Supabase → SQL Editor → incolla tutto `tabelle-profili-v6.sql` → Run.
✅ Devono uscire due righe, Lorena e X, con le liste di X già compilate.

**2. La funzione aggiornata**
Supabase → Edge Functions → `cosa-cucino` → Edit → cancella tutto e incolla
`edge-function-cosa-cucino.ts` → Deploy.

Finché non fai la 2, il generatore continua a funzionare come prima: l'app se ne
accorge da sola e non si rompe. Ma i profili e lo streaming arrivano solo dopo.

Poi chiudi e riapri l'app dalla home.

---

## Blocco 1 · Profili

1. Guarda la riga sotto il titolo: ora deve dire **Lorena · 2200 kcal · 170 g proteine**
   con una freccetta ›
2. Toccala: si apre la schermata Profilo

✅ **Devi vedere** due selettori: «Su questo telefono sono» e «Sto modificando il profilo di».

3. Tocca **X** nel secondo selettore

✅ Devono comparire le sue liste già piene: **non mangia** pomodoro crudo, cetrioli,
interiora (in rosso), e **ama** verdure (in verde). I suoi obiettivi sono vuoti.

4. Aggiungi qualcosa in una lista scrivendolo e premendo **+**
5. Toglilo con la **×**
6. Torna all'app, chiudila del tutto e riaprila

✅ **La modifica c'è ancora** e il selettore «sono» è rimasto dove l'avevi messo.

❗️ Nota: il selettore **non è un login**. Chiunque apra l'app può cambiarlo e può
modificare entrambi i profili. Serve solo a sapere per chi si cucina.

---

## Blocco 2 · Il generatore sa chi c'è

1. Tab **Cucino**

✅ «Chi mangia» ora ha **tre** pulsanti coi nomi veri:
**Solo Lorena** · **Tutti e due** · **Solo X**

2. Scegli **Solo X** e genera

✅ Controlla che la proposta:
- **non contenga** pomodoro crudo, cetrioli o interiora — mai, per nessun motivo
- abbia **poca carne e molte verdure**
- abbia **pochi ingredienti**, riconoscibili
- includa un **tocco dolce finale**
- **non** abbia il target proteico da 55-70 g: è un pasto normale

3. Scegli **Tutti e due** e genera

✅ Controlla che:
- i divieti di X siano rispettati lo stesso
- ci siano **due colonne di ingredienti**, «Per me» e «Per X», con quantità diverse
- se la fonte proteica è diversa fra voi due, lo dica nel «perché»
- se un piatto unico non funzionava, proponga **due piatti distinti** che condividono
  contorno o tempo di cottura

❌ Se in una proposta per X compare un cetriolo o del pomodoro crudo, **fermati e
dimmelo subito**: è il vincolo che non deve cedere mai.

---

## Blocco 3 · Attesa più breve

1. Tab **Cucino** → **Genera 3 proposte**

✅ **Devi vedere**, in ordine:
- «Sto leggendo la dispensa…»
- «Sto pensando alla prima proposta…»
- **la prima scheda che compare da sola**, mentre sotto c'è ancora «Sto scrivendo la prossima…»
- poi la seconda, poi la terza

Il punto è questo: **cominci a leggere la prima mentre le altre si stanno ancora
scrivendo**. Prima aspettavi mezzo minuto in silenzio.

2. Controlla il contatore: Supabase → SQL Editor

```sql
select * from public.generator_usage order by day desc limit 3;
```

✅ Una generazione da tre proposte deve aver aumentato il contatore di **1 solo**,
non di 3.

---

## Cose che è giusto NON vedere

- nessuna richiesta di password
- nessun punteggio, striscia o grafico
- il tocco dolce di X trattato come una concessione o uno sgarro: è parte del suo pasto

---

## Se qualcosa si rompe

Mandami la frase esatta che leggi a schermo: è sempre in italiano e mi basta quella.
