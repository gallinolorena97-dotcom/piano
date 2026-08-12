# PROMPT PER CLAUDE CODE — v7: il design

## Premessa
Stessi patti: non sono programmatrice, italiano semplice, riassumi e chiedi conferma
prima di ogni azione con effetti. Leggi `CLAUDE.md`.

**Questo è un restyle, non una riscrittura**: nessuna funzione deve cambiare
comportamento, salvo dove esplicitamente indicato (il menu). Se una scelta estetica
ti costringe a toccare la logica, fermati e chiedimelo.

**Ordine**: si esegue DOPO la chiusura dei blocchi 1-3 della v6. La v5 (piano
settimanale) verrà dopo e DOVRÀ ereditare questo design system: costruiscilo
pensando anche alle schermate future (calendario, verifica giornaliera).

Un blocco alla volta, push separati. **⛔ Fermati dopo il Blocco 1** per un collaudo
visivo con screenshot da PC e da iPhone: la direzione si approva lì, prima di
stilizzare tutto.

## La direzione
- Riferimenti: **Yazio e Canva** — morbido, arioso, curato. Il riferimento è VISIVO,
  non funzionale: da Yazio NON vanno copiati anelli di progresso, streak o punteggi,
  che restano vietati.
- Palette **lavanda e menta, pastello**. Regola non negoziabile: il pastello vive su
  sfondi e superfici, **mai sul testo**. Il testo resta scuro, contrasto AA sempre —
  l'app si usa in cucina e i numeri (proteine, kcal) devono leggersi in mezzo secondo.
- Cerca **una firma riconoscibile** — una cosa fatta davvero bene (le illustrazioni
  degli stati vuoti, o il trattamento della testata) — invece di dieci effetti
  sparsi. Evita il "gradiente ovunque" da template: deve sembrare disegnata, non
  generata.

## BLOCCO 1 — Design system e struttura
Definisci i token CSS (variabili) e usali OVUNQUE. Zona colori indicativa,
rifiniscila tu restando in area:

- `--bg` bianco caldo appena lavanda (~#FAF9FC)
- `--surface` bianco, con ombre morbide a due livelli
- `--ink` violaceo scurissimo per il testo (~#2B2440)
- `--muted` grigio-violaceo per i testi secondari
- `--lavanda` pastello (~#C7B9F2): identità, superfici evidenziate
- `--menta` pastello (~#B8E8D4): freschezza, conferme, dispensa
- `--viola` profondo (~#6B5BD2): azioni primarie, numeri chiave
- `--pesca` pastello: avvisi e badge VERIFICA
- `--corallo` tenue: eliminazioni
- `--ghiaccio` periwinkle tenue: note di scongelamento

Tipografia via Google Fonts, **massimo due famiglie e pochi pesi**:
- Titoli/display: **Fraunces** (o serif morbido equivalente, con carattere)
- Testo e interfaccia: **Outfit** o DM Sans
- Scala chiara: nelle card il blocco proteine · kcal · tempo è l'elemento più
  visibile dopo il nome del piatto.

Struttura:
- Raggi generosi (14-20px), spaziature ariose ma non disperse su schermo grande.
- **Responsive vero, PC e iPhone alla pari**: su mobile navigazione in basso con
  icone ed etichette (5 voci, comoda col pollice, safe area rispettata); su desktop
  tab in alto con icone, contenuto centrato con larghezza massima sensata.
- **Nuovo menu** (icona in testata): dentro ci vanno "Copia per Claude" (via
  dall'angolo in alto a destra), il selettore profilo della v6 (Sono Lorena / Sono X)
  e i target modificabili. La testata si alleggerisce: titolo, sottotitolo, menu.
- Stati di caricamento curati: per la generazione (che è lenta) uno
  skeleton/shimmer delle card insieme ai messaggi di avanzamento esistenti —
  l'attesa deve sembrare progettata, non rotta.
- Transizioni brevi (150-250 ms), stati premuto/hover, focus visibile da tastiera.

**⛔ Push e stop: collaudo visivo con screenshot PC + iPhone, poi si prosegue.**

## BLOCCO 2 — Componenti
- **Card proposta (Cucino)**: gerarchia rifatta — nome del piatto in display; sotto,
  grande, proteine · kcal · tempo; ingredienti in tabella leggera con chip PER ME /
  PER X; nota di scongelamento su fondo `--ghiaccio`; tocco dolce per X su fondo
  `--lavanda` tenue; i tre bottoni (Un'altra / Personalizza / Scelgo questa) con
  gerarchia visiva chiara.
- **Dispensa**: righe ariose, quantità allineate, badge VERIFICA in `--pesca`,
  intestazioni di categoria appiccicose (già implementate: mantienile) con l'icona
  della categoria; ricerca e form di aggiunta curati.
- **Ricette**: voti ♥ / OK / NO come chip colorati, già pronti a diventare doppi
  (miei e di X) con la v6.
- **Spesa e Diario**: stessi componenti; stati vuoti illustrati (Blocco 3).
- Bottoni, input, select, toggle: tutti derivati dai token. Nessun elemento
  "di serie" del browser lasciato nudo.

## BLOCCO 3 — Icone e illustrazioni (tutto SVG inline)
- **Niente immagini esterne o scaricate**: pesano, vanno ospitate e complicano il
  file unico. Tutto disegnato in SVG inline dentro il file.
- Set di icone coerente (stesso spessore di tratto, stessi angoli): le 5 voci di
  navigazione, frigo / congelatore / dispensa, scongelamento, menu.
- Illustrazioni per gli stati vuoti (piano vuoto, spesa vuota, diario vuoto): stile
  unico, 2-3 colori della palette, semplici e simpatiche senza essere infantili.
  **Prima una sola di prova** (es. la spesa vuota), push, verifica di gradimento,
  poi le altre nello stesso identico stile.
- Facoltativo, solo se non appesantisce: una texture leggerissima in CSS sullo
  sfondo per dare profondità. Al primo dubbio, lasciala perdere.

## Vincoli
- Tutto in `index.html`, niente framework né build. Google Fonts via link va bene.
- Nessuna funzione si rompe: generatore, scalo dispensa, diario, spesa, "Copia per
  Claude" — identici nel comportamento.
- Contrasto AA su tutto il testo; bersagli di tocco da almeno 44px.
- Niente anelli di progresso, streak, punteggi, badge motivazionali.
- Il file crescerà: tieni CSS e SVG ordinati e commentati per sezioni, così la v5
  riuserà i token invece di inventare stili nuovi.

## Deliverable
1. Blocco 1, push, stop per il collaudo visivo.
2. Blocchi 2 e 3 dopo il via libera, push separati.
3. `CLAUDE.md` aggiornato con la regola: ogni schermata futura usa questi token.
4. Checklist di collaudo visivo per PC e iPhone.
