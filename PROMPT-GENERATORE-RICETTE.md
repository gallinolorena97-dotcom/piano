# PROMPT PER CLAUDE CODE — Generatore di ricette (v3)

## Premessa
Stessi patti di sempre: non sono programmatrice, parla in italiano semplice,
riassumi e chiedi conferma prima di ogni azione con effetti. Leggi `CLAUDE.md`
prima di iniziare. Questa è un'aggiunta all'app esistente, non una riscrittura:
tab Piano, Dispensa e Ricette restano come sono.

## Cosa voglio
Una nuova tab **"Cosa cucino"** che, partendo dalla mia dispensa reale, mi propone
piatti e mi lascia dire "questo no, dammene un altro" o "questo sì, ma con il riso
al posto della pasta". Le proposte devono rispettare il metodo che uso, non essere
ricette generiche.

## Architettura richiesta
- **Supabase Edge Function** che chiama l'API di Anthropic (modello: claude-sonnet-4-6).
  La chiave API sta nei Secrets di Supabase, MAI nel file `index.html`, che è pubblico.
- Il frontend chiama la Edge Function, non l'API di Anthropic.
- La function legge da sola l'inventario dal database (non fidarti di quello che
  arriva dal client).
- Guidami tu nel salvare la chiave nei Secrets: dimmi i passaggi esatti nel pannello.
- Gestisci gli errori in italiano semplice ("il generatore non risponde, riprova"),
  mai un errore tecnico nudo a schermo.

## I vincoli del metodo — la parte che conta
Sono la ragione per cui questo generatore deve esistere. Inseriscili nel prompt di
sistema della Edge Function.

**1. Proteine: il vincolo dominante.**
- Obiettivo: 170 g di proteine al giorno (soglia minima accettabile: 150).
- Colazione fissa: 20 g. Spuntino yogurt greco: 17 g. Restano ~133 g su pranzo e cena,
  cioè **55-70 g di proteine per pasto principale**.
- Una proposta sotto i 40 g per un pasto principale è da scartare, a meno che
  l'utente non abbia dichiarato di aver già coperto le proteine altrove.
- Porzioni di riferimento a crudo: pollo/tacchino 250-300 g → 55-70 g proteine ·
  hamburger 300 g → ~57 g · pesce fresco 300 g → 50-60 g · tonno sgocciolato 100 g →
  ~28 g · uovo → 6-7 g · yogurt greco 150 g → 17 g · grana 20 g → 7 g ·
  polpo 100 g → ~15 g (è "diluito": va sempre abbinato a un'altra fonte proteica).
- Ogni proposta dichiara **grammi di proteine e kcal stimate**, e i pesi degli
  ingredienti sono **a crudo o sgocciolati**.

**2. Calorie:** ~2.200 kcal al giorno. Un pasto principale sta tra 600 e 900 kcal.
Non sacrificare mai le proteine per stare sotto: semmai riduci i carboidrati.

**3. Deperibili e scadenze:** proponi per primi gli ingredienti freschi in scadenza
e i deperibili aperti. Un ingrediente con "?" nella quantità è **incerto**: non
costruirci sopra un piatto, al massimo citalo come opzione.

**4. Catena "cucina doppio, mangia due volte":** dove ha senso, proponi una cena in
porzione doppia il cui avanzo diventa il pranzo del giorno dopo. Dillo esplicitamente.

**5. Scongelamento:** se un piatto usa un ingrediente del congelatore, indica quando
va spostato in frigo (24 h prima per carne e polpo) o se si cuoce da congelato
(hamburger, kebab, gamberi in acqua fredda 20 min). Questo è il punto in cui i piani
falliscono più spesso: non ometterlo mai.

**6. Il 20% e i pasti liberi:** due pasti liberi a settimana fanno parte del metodo.
Non proporre "versioni light" o sostituzioni virtuose di piatti che l'utente ama, e
non usare mai un tono che tratta un cibo come sgarro, premio o colpa. Nessun
ingrediente è proibito.

**7. La commensale "X":** quando è presente, il piatto è lo stesso ma le sue porzioni
sono normali, non proteiche. Indica separatamente le quantità per l'utente e per X.

**8. Tempo:** rispetta il tempo dichiarato. Sotto i 15 minuti significa davvero
niente forno e niente scongelamenti.

## Come deve funzionare (interfaccia)
Prima di generare, la tab chiede tre cose con bottoni grandi (niente moduli da
compilare a mano):
1. **Quale pasto** — pranzo / cena
2. **Chi mangia** — solo io / io e X
3. **Quanto tempo ho** — 15 min / 30 min / un'ora o più

E un quarto campo facoltativo, che è quello che rende il risultato utile:
4. **"Cosa hai già mangiato oggi"** — testo libero, opzionale. Se compilato, la
   function calcola quante proteine mancano e dimensiona il pasto di conseguenza.

Poi **Genera** → 3 proposte in card, ciascuna con:
- nome del piatto
- ingredienti con grammi (miei e di X separati, quando serve)
- proteine stimate e kcal, in evidenza
- tempo reale
- la nota di scongelamento, se serve
- se genera un avanzo: quale pasto copre
- perché è stata scelta (es. "usa le zucchine, sono le ultime e vanno consumate")

Su ogni card tre bottoni:
- **↻ Un'altra** — rigenera SOLO quella proposta, tenendo le altre due, e senza
  riproporre piatti già scartati in questa sessione
- **✎ Personalizza** — apro un campo, scrivo in italiano cosa cambiare ("senza
  pomodoro", "col riso invece della pasta", "più veloce") e la card si rigenera
  rispettando la richiesta e ricalcolando proteine e kcal
- **✓ Scelgo questa** — la salvo tra le Ricette (con voto ♥ preimpostato) e mi chiedi
  se scalare gli ingredienti usati dalla dispensa: se dico sì, aggiorni le quantità.

Le ricette con voto **NO** non vanno mai riproposte. Quelle con **♥** hanno priorità.

## Vincoli tecnici
- Niente framework, niente build: resta tutto in `index.html` come oggi.
- Stessa identità visiva (crema #FAF6EF, verde #1E5B3C, salvia, ambra).
- Mobile-first: si usa dall'iPhone, in cucina, con una mano.
- Mostra uno stato di caricamento: la generazione richiede qualche secondo.
- Nessun conteggio calorie interattivo, nessuna streak, nessun punteggio.

## Cosa NON fare
- Non mettere la chiave API nel frontend, per nessun motivo.
- Non inventare ingredienti che non sono in dispensa: al massimo segnala
  "servirebbe X, non ce l'hai" come nota, non come ingrediente del piatto.
- Non toccare le tab esistenti né l'URL pubblico.
- Non proporre piatti sotto i 40 g di proteine per un pasto principale.

## Deliverable
1. La Edge Function, distribuita e funzionante.
2. La nuova tab nell'app.
3. Le istruzioni passo-passo per salvare la chiave API nei Secrets.
4. `CLAUDE.md` aggiornato con questa aggiunta.
5. Una checklist di collaudo da fare insieme, generatore incluso.
