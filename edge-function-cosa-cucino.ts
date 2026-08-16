// ============================================================
//  Piano & Dispensa — Edge Function "cosa-cucino"
//
//  QUESTO FILE NON VA SU GITHUB PAGES.
//  Va incollato dentro Supabase → Edge Functions → cosa-cucino.
//
//  COSA FA — due mestieri, un solo file
//
//  A) LE PROPOSTE DEL GIORNO (tab "Cucino")
//    1. controlla di non aver superato il tetto di generazioni al giorno
//    2. legge da sola inventario, ricette e obiettivi dal database
//       (non si fida di quello che arriva dal telefono)
//    3. chiede a Claude delle proposte che rispettano il metodo
//    4. restituisce all'app un elenco pulito di piatti
//
//  B) IL PIANO DELLA SETTIMANA (tab "Piano" → "Genera la settimana")
//    Arriva con "modo": "settimana". L'app chiama la function una volta
//    per BLOCCO di 2-3 giorni: ogni blocco vede i pasti gia' decisi nei
//    blocchi precedenti, cosi' la dispensa non viene spesa due volte.
//
//  LA CHIAVE API NON È SCRITTA QUI. Arriva dai Secrets di Supabase,
//  con il nome ANTHROPIC_API_KEY.
// ============================================================

// ------------------------------------------------------------
//  MANOPOLE — le uniche cose che ha senso ritoccare
// ------------------------------------------------------------
const MAX_AL_GIORNO = 30;          // tetto di generazioni giornaliere (protegge il credito)
const MODELLO       = 'claude-sonnet-5';
const MAX_TOKENS    = 8000;
const IMPEGNO       = 'medium';    // low = più veloce/economico · high = più ragionato

// La settimana si scrive UN GIORNO PER CHIAMATA: 7 chiamate vere al modello,
// quindi 7 tacche sul tetto qui sopra, non una.
//
// ⚠️ Dal 16/08/2026, e non e' una scelta di comodo: misurato col cronometro,
// un blocco da 2 giorni dura 127 secondi contro i 150 che Supabase concede a
// una chiamata sul piano gratuito. L'85% del tetto: bastava una dispensa piu'
// grande e la piattaforma spegneva la funzione a meta' lavoro.
//
// ⚠️ Contare una tacca sola lascerebbe le altre senza freno, e il freno e'
// l'unica cosa fra l'indirizzo pubblico e la carta di credito. Con 30 al
// giorno restano 4 settimane al giorno e il tetto di spesa non si muove.
//
// Il numero qui sotto e' il MASSIMO che una settimana puo' costare: 7 giorni
// piu' qualche ripiego, quando una chiamata torna senza aver scritto tutto.
const BLOCCHI_SETTIMANA = 10;

// ⚠️ NON ABBASSARE QUESTO NUMERO. Il 13/08/2026 la generazione della settimana
// si e' rotta proprio qui, con 12000: max_tokens e' un tetto su PENSIERO PIU'
// RISPOSTA messi insieme, non solo sulla risposta. Simulare il magazzino di
// piu' giorni con divieti, target e avanzi fa ragionare a lungo, e il modello
// veniva tagliato prima di riuscire a scrivere il primo pasto.
// max_tokens e' un tetto, non una spesa: alzarlo non costa niente di per se',
// serve solo a lasciare spazio. Il massimo di Sonnet 5 e' 128000.
const MAX_TOKENS_SETTIMANA = 32000;

// ------------------------------------------------------------
//  Segreti e indirizzi (li mette Supabase, non si scrivono a mano)
// ------------------------------------------------------------

/**
 * Trova la chiave Anthropic nei Secrets senza pretendere un nome preciso.
 *  1. prova i nomi più comuni;
 *  2. se non li trova, cerca fra TUTTI i secrets quello il cui valore
 *     ha la forma di una chiave Anthropic (inizia con "sk-ant-").
 * Il valore della chiave non viene mai stampato né restituito: si guardano
 * solo i nomi.
 */
function trovaChiaveAnthropic(): { chiave: string; nome: string } {
  const nomiNoti = [
    'ANTHROPIC_API_KEY', 'ANTHROPIC_KEY', 'ANTHROPIC_SECRET_KEY',
    'CLAUDE_API_KEY', 'CLAUDE_KEY', 'API_KEY_ANTHROPIC',
  ];
  for (const nome of nomiNoti) {
    const v = Deno.env.get(nome);
    if (v && v.trim()) return { chiave: v.trim(), nome };
  }
  for (const [nome, valore] of Object.entries(Deno.env.toObject())) {
    if (typeof valore === 'string' && valore.trim().startsWith('sk-ant-')) {
      return { chiave: valore.trim(), nome };
    }
  }
  return { chiave: '', nome: '' };
}

/** Elenca i nomi dei secrets che sembrano legati ad Anthropic — solo i nomi, mai i valori. */
function nomiSecretsSospetti(): string[] {
  return Object.keys(Deno.env.toObject())
    .filter((n) => /ANTHROPIC|CLAUDE/i.test(n))
    .sort();
}

const { chiave: ANTHROPIC_API_KEY, nome: NOME_SECRET } = trovaChiaveAnthropic();
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

/** Errore mostrato all'utente: sempre in italiano semplice, mai tecnico. */
const errore = (messaggio: string, status = 500) => json({ errore: messaggio }, status);

// ------------------------------------------------------------
//  Lettura dal database (con la chiave di servizio, lato server)
// ------------------------------------------------------------
async function leggi(tabella: string, colonne: string) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabella}?select=${colonne}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!r.ok) throw new Error(`lettura ${tabella}: ${r.status}`);
  return await r.json();
}

/** Incrementa il contatore del giorno. Restituisce -1 se il tetto è stato raggiunto. */
async function consumaUnaGenerazione(): Promise<number> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/consuma_generazione`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ limite: MAX_AL_GIORNO }),
  });
  if (!r.ok) throw new Error(`contatore: ${r.status}`);
  return Number(await r.json());
}

/**
 * Quante generazioni sono gia' state usate oggi, SENZA consumarne una.
 * Serve al piano settimanale: prima di cominciare un lavoro da piu' chiamate
 * si controlla che il margine basti, cosi' non ci si ferma a meta' settimana.
 * La tabella e' invisibile all'app (nessuna policy): la legge solo il server.
 */
async function generazioniUsateOggi(): Promise<number> {
  const oggi = new Date().toISOString().slice(0, 10);   // come current_date del database
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/generator_usage?select=count&day=eq.${oggi}`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  if (!r.ok) throw new Error(`contatore: ${r.status}`);
  const righe = await r.json();
  return Array.isArray(righe) && righe.length ? Number(righe[0].count) || 0 : 0;
}

// ------------------------------------------------------------
//  I DATI VERI — li legge il server, mai il telefono
//  Li usano tutti e due i mestieri della function: le proposte del
//  giorno e il piano della settimana. Scritti una volta sola.
// ------------------------------------------------------------
type Profilo = {
  slug: string; nome: string; prot_target: number | null; kcal_target: number | null;
  ripetizione: string; non_mangia: string[]; evita: string[]; ama: string[]; note: string | null;
};
type Contesto = {
  inv: Array<{ name: string; qty: string; cat: string }>;
  rec: Array<{ id: string; name: string; pref: string | null }>;
  setRows: Array<{ key: string; value: string }>;
  profili: Profilo[];
  voti: Array<{ recipe_id: string; profile_slug: string; pref: string }>;
  recenti: Array<{ day: string; piatto: string; proteina: string | null }>;
};

async function leggiContesto(): Promise<Contesto> {
  const [inv, rec, setRows] = await Promise.all([
    leggi('inventory_items', 'name,qty,cat'),
    leggi('recipes', 'id,name,pref'),
    leggi('settings', 'key,value'),
  ]);

  // I profili delle due persone. Li legge la function, non il telefono.
  let profili: Profilo[] = [];
  try { profili = await leggi('profiles', '*'); } catch { /* v6 non ancora installata */ }

  // I voti sono per persona: il cuore di uno non è il cuore dell'altra.
  let voti: Contesto['voti'] = [];
  try { voti = await leggi('recipe_votes', 'recipe_id,profile_slug,pref'); } catch { /* niente voti */ }

  // Gli ultimi 5 giorni di pasti, per non ripetere sempre le stesse cose.
  // Se la tabella non esiste ancora, si va avanti lo stesso.
  let recenti: Contesto['recenti'] = [];
  try {
    const da = new Date();
    da.setDate(da.getDate() - 5);
    recenti = await leggi(
      'meals_log',
      `day,piatto,proteina&day=gte.${da.toISOString().slice(0, 10)}&order=day.desc`,
    );
  } catch { /* niente diario: pazienza */ }

  return { inv, rec, setRows, profili, voti, recenti };
}

/** La dispensa raccontata per categorie, come la vede il modello. */
function descriviDispensa(inv: Contesto['inv']): string {
  const perCat = (c: string) => {
    const righe = inv.filter((i) => i.cat === c);
    return righe.length ? righe.map((i) => `- ${i.name} — ${i.qty}`).join('\n') : '- (vuoto)';
  };
  return `FRIGO\n${perCat('frigo')}\n\nCONGELATORE\n${perCat('freezer')}\n\nDISPENSA\n${perCat('dispensa')}`;
}

const elencoVoci = (v: string[] | null) => (v && v.length ? v.join(', ') : '—');

/** Il ritratto di una persona: obiettivi, divieti, gusti. */
function descriviProfilo(p: Profilo, ioSlug?: string): string {
  return [
    `### ${p.nome}${ioSlug && p.slug === ioSlug ? '  (è chi sta usando l\'app adesso)' : ''}`,
    `- obiettivo proteine: ${p.prot_target ? p.prot_target + ' g al giorno' : 'nessuno'}`,
    `- obiettivo calorie: ${p.kcal_target ? p.kcal_target + ' kcal al giorno' : 'nessuno'}`,
    `- ripetizione dei piatti: ${p.ripetizione === 'bassa' ? 'BASSA — vuole varietà, non ripetere piatti simili ravvicinati' : 'ALTA — ripetere non è un problema, non forzare la varietà'}`,
    `- NON MANGIA (vincolo assoluto, mai nel piatto): ${elencoVoci(p.non_mangia)}`,
    `- preferisce evitare: ${elencoVoci(p.evita)}`,
    `- ama: ${elencoVoci(p.ama)}`,
    p.note ? `- note: ${p.note}` : '',
  ].filter(Boolean).join('\n');
}

/** I voti di una persona, per nome di ricetta. */
function descriviVoti(c: Contesto): string {
  const votiDi = (slug: string, pref: string) => {
    const ids = new Set(c.voti.filter((v) => v.profile_slug === slug && v.pref === pref)
                              .map((v) => v.recipe_id));
    return c.rec.filter((r) => ids.has(r.id)).map((r) => r.name).join(' · ') || '(nessuna)';
  };
  const nomiPref = (p: string | null) =>
    c.rec.filter((r) => r.pref === p).map((r) => r.name).join(' · ') || '(nessuna)';

  return c.profili.length
    ? c.profili.map((p) => [
        `### secondo ${p.nome}`,
        `- preferite: ${votiDi(p.slug, 'fav')}`,
        `- vanno bene: ${votiDi(p.slug, 'ok')}`,
        `- DA NON RIPROPORRE MAI: ${votiDi(p.slug, 'no')}`,
      ].join('\n')).join('\n\n')
    : `Preferite (priorità): ${nomiPref('fav')}\nVanno bene: ${nomiPref('ok')}\nDA NON RIPROPORRE MAI: ${nomiPref('no')}`;
}

/** Cosa si è mangiato negli ultimi giorni: serve alla regola della varietà. */
function descriviRecenti(c: Contesto): string {
  return c.recenti.length
    ? c.recenti.map((m) => `- ${m.day}: ${m.piatto}${m.proteina ? ` [proteina: ${m.proteina}]` : ''}`).join('\n')
    : '- (nessun pasto registrato)';
}

// ------------------------------------------------------------
//  IL METODO — questo è il cuore del generatore
// ------------------------------------------------------------
const REGOLE = `Sei l'aiuto cucina di una persona che segue un metodo preciso.
Proponi piatti costruiti sulla SUA dispensa reale, non ricette generiche.

## 1. PROTEINE — è il vincolo che comanda su tutto
- Obiettivo 170 g di proteine al giorno, soglia minima accettabile 150 g.
- Colazione fissa 20 g. Spuntino yogurt greco 17 g. Restano circa 133 g fra pranzo e cena:
  quindi ogni pasto principale sta fra 55 e 70 g di proteine.
- Una proposta sotto i 40 g di proteine per un pasto principale è da scartare,
  a meno che l'utente non abbia dichiarato di aver già coperto le proteine altrove.
- Porzioni di riferimento, sempre A CRUDO o sgocciolate:
  pollo/tacchino 250-300 g -> 55-70 g proteine · hamburger 300 g -> ~57 g ·
  pesce fresco 300 g -> 50-60 g · tonno sgocciolato 100 g -> ~28 g · uovo -> 6-7 g ·
  yogurt greco 150 g -> 17 g · grana 20 g -> 7 g ·
  polpo 100 g -> ~15 g (è "diluito": va SEMPRE abbinato a un'altra fonte proteica).
- Ogni proposta dichiara i grammi di proteine e le kcal stimate.
  I pesi degli ingredienti sono a crudo o sgocciolati.

## 2. CALORIE
Circa 2200 kcal al giorno. Un pasto principale sta fra 600 e 900 kcal.
Non sacrificare mai le proteine per stare sotto: semmai riduci i carboidrati.

## 3. DEPERIBILI E SCADENZE
Proponi per primi i freschi in scadenza e i deperibili già aperti.
Un ingrediente con "?" nella quantità è INCERTO: non costruirci sopra un piatto,
al massimo citalo come opzione nel campo "perche".

## 4. CUCINA DOPPIO, MANGIA DUE VOLTE
Dove ha senso, proponi una cena in porzione doppia il cui avanzo diventa
il pranzo del giorno dopo. Scrivilo esplicitamente nel campo "avanzo".

## 5. SCONGELAMENTO — è il punto in cui i piani falliscono più spesso
Se un piatto usa un ingrediente del congelatore, indica SEMPRE nel campo "scongelamento"
quando va spostato in frigo (24 h prima per carne e polpo) oppure se si cuoce da congelato
(hamburger, kebab, gamberi in acqua fredda 20 minuti). Non ometterlo mai.

## 6. IL 20% E I PASTI LIBERI
Due pasti liberi a settimana fanno parte del metodo. Non proporre mai "versioni light"
o sostituzioni virtuose di piatti che l'utente ama. Non usare mai un tono che tratta
un cibo come sgarro, premio o colpa. Nessun ingrediente è proibito.

## 7. CHI MANGIA — è il vincolo che viene prima di tutto
Ti vengono dati i profili delle persone. Rispettali alla lettera.

**Solo la persona con obiettivo proteico** → target pieno (55-70 g nel pasto),
piatto semplice e veloce. La ripetizione è ammessa se il suo profilo dice così:
non forzare la varietà.

**Solo l'altra persona** → nessun target proteico, pasto normale ed equilibrato,
molte verdure, poca carne, ingredienti pochi e riconoscibili. Porzione singola.
Se il suo profilo prevede un tocco dolce finale, mettilo sempre.

### COME SI LEGGONO I DIVIETI — attenzione, è delicato
Un divieto **senza precisazioni** vale per tutta la famiglia dell'alimento, non solo
per la parola scritta: "cetrioli" comprende i sottaceti di cetriolo.

⚠️ **Un divieto CON una precisazione restringe la FORMA, non la FAMIGLIA**, e il
pomodoro è il caso che si sbaglia più spesso, in tutti e due i sensi. Il divieto di
Lorena è "pomodoro **crudo**".

- **La famiglia resta intera**: pomodoro, pomodorini, datterini, ciliegini, pachino,
  cuore di bue, passata, pelati. Cambiare nome non è una scappatoia.
- **Vietata è la forma cruda.** In un pasto con Lorena: niente pomodorini crudi in
  insalata, niente fette di cuore di bue, niente panzanella, niente bruschette.
- **Cotti vanno benissimo per tutti e due**, senza limiti: sugo, al forno, in umido,
  datterini saltati. Passata e pelati sono cotti per natura: liberi anche loro.
- **Crudi** vanno bene nei pasti che mangia **solo Ciprian**: lì è permesso e non c'è
  niente da spiegare.

Quando usi il pomodoro cotto in un pasto con Lorena, **dillo esplicitamente** nel nome
del piatto e negli ingredienti (es. "datterini saltati in padella", non "datterini"):
chi legge deve vedere che è nella forma consentita.
**Non evitare il pomodoro per prudenza**: evitarlo sempre è un errore, non una cautela.
La stessa logica vale per ogni divieto con una precisazione.

**Tutti e due insieme** → **UN SOLO PIATTO BASE per tutti e due.** Due piatti diversi
alla stessa tavola sono un errore, non una soluzione. Risolvilo così, in quest'ordine:
1. I **divieti** di ciascuno non si negoziano mai, e vale anche la regola dei
   pochi ingredienti se è nel profilo.
2. Le porzioni sono diverse: abbondanti per chi ha l'obiettivo, normali per l'altra.
   È una variante dello stesso piatto, non un altro piatto.
3. Se il piatto condiviso non basta al target proteico, aggiungi una **porzione
   proteica A LATO** solo per chi ha l'obiettivo — uova, skyr, yogurt greco, grana,
   tonno — e mettila nei suoi ingredienti, **senza cambiargli il piatto**.
   Giusto: gnocchi per tutte e due, e per lui in più 150 g di skyr.
   Sbagliato: hamburger e patatine per lui, gnocchi per lei.
   Quello che manca al target si recupera anche sull'altro pasto della giornata.
4. **Due piatti davvero diversi solo per un divieto** che rende quel piatto impossibile
   per una delle due e senza una variante semplice (togliere l'ingrediente, sostituirlo,
   servirlo cotto invece che crudo). Solo allora proponi due piatti che condividano il
   contorno o il tempo di cottura, scrivendolo nel nome della proposta e spiegando la
   **ragione** nel campo "perche": chi legge vuole vedere il perché, non subirlo.
   La fonte proteica diversa fra le due è questo caso o il punto 3, mai una libertà.
5. Il tocco dolce finale, se previsto dal profilo, va sempre incluso: è parte del pasto,
   non un extra da concedere.

Riempi "ingredienti_x" SOLO quando mangiano in due. Quando mangia una persona sola,
"ingredienti_x" resta una lista vuota e "ingredienti_io" contiene il suo pasto.

## 8. TEMPO
Rispetta il tempo dichiarato. Sotto i 15 minuti significa davvero niente forno
e niente scongelamenti.

## 9. INGREDIENTI CHE MANCANO
Un piatto può richiedere qualcosa che non è in dispensa, ma con regole strette:
- al massimo 2 ingredienti mancanti per proposta;
- MAI la fonte proteica principale: quella deve sempre esserci già;
- gli ingredienti mancanti vanno SOLO nell'elenco "manca", mai fra gli ingredienti
  del piatto, e i conti di proteine e kcal li considerano comunque presenti;
- ALMENO UNA delle 3 proposte deve essere completamente fattibile con quello che c'è:
  la sua lista "manca" deve essere vuota.

## 10. NON RIPETERTI — ma solo per chi ci tiene
Ti viene dato l'elenco di quello che è stato mangiato negli ultimi giorni.
**La regola della varietà si applica per persona**, non in generale:
- profilo con ripetizione **bassa** → mai la stessa cosa ravvicinata: la stessa fonte
  proteica non più di 2 volte in 3 giorni, e mai lo stesso piatto entro 2 giorni;
- profilo con ripetizione **alta** → la ripetizione non è un problema: non forzare la
  varietà, se il piatto migliore è lo stesso di ieri va benissimo riproporlo.
- Dichiara sempre la fonte proteica in "proteina_principale", in una parola minuscola
  e generica: pollo, tacchino, tonno, uova, manzo, pesce, legumi, formaggio, maiale.
  Serve proprio a far funzionare questa regola nei giorni successivi.

## 11. LA VOGLIA — orienta, non comanda
A volte viene dichiarata una voglia: "qualcosa di cremoso", "asiatico",
"voglio usare i porcini". Trattala come una DIREZIONE, con questa precedenza:

1. **I divieti dei profili e il minimo proteico vengono prima, sempre.**
   Nessuna voglia li scavalca, per nessun motivo.
2. Dentro quei limiti, avvicinati il più possibile a quello che è stato chiesto:
   se la voglia è "cremoso", cerca la cremosità; se è "asiatico", vai in quella
   direzione; se nomina un ingrediente, costruiscici sopra il piatto.
3. **Se la voglia si scontra con i vincoli, non scartarla e non ignorarla**:
   proponi la versione più vicina che li rispetta e **dichiara il compromesso**
   nel campo "perche". Per esempio:
   "carbonara alleggerita: guanciale 40 g e più albumi per restare nei target"
   oppure "niente pomodoro crudo come chiede il profilo: uso datterini saltati".
   Chi legge deve capire che cosa è stato cambiato e perché.
4. Se la voglia richiede un ingrediente che non c'è in dispensa, vale la regola 9:
   proponi comunque, mettilo in "manca" (sempre entro il limite di 2, e mai come
   fonte proteica principale).

Se la voglia non è dichiarata, non inventartene una: comportati normalmente.

## COSA NON FARE
- Non riproporre mai le ricette segnate come "da non riproporre".
- Le ricette segnate come preferite hanno priorità, se gli ingredienti ci sono.
- Non spacciare per presente un ingrediente che non c'è: se manca, va dichiarato.

## FORMA
Scrivi in italiano semplice e concreto. Il campo "perche" è una riga sola che spiega
la ragione della scelta (es. "usa le zucchine, sono le ultime e vanno consumate").
Le quantità sono stringhe come "250 g" o "2 uova".

⚠️ I NOMI DEGLI INGREDIENTI SI COPIANO DALLA DISPENSA, LETTERA PER LETTERA.
Se in dispensa c'è scritto "Uova", scrivi "Uova": non "uovo", non "uova bio". Niente
singolari al posto dei plurali, niente sinonimi, niente aggettivi aggiunti. Il nome
sta in "nome", la quantità in "quantita", separati. L'app confronta questi nomi con
la dispensa per scalare le scorte: se li cambi, scala la cosa sbagliata o niente.
Solo le cose dell'elenco "manca" — che in dispensa non ci sono — le scrivi come
vuoi, in modo semplice e riconoscibile al supermercato.`;

// ------------------------------------------------------------
//  Lo schema della risposta: obbliga Claude a rispondere ordinato
// ------------------------------------------------------------
const INGREDIENTE = {
  type: 'object',
  properties: {
    nome:     { type: 'string' },
    quantita: { type: 'string' },
  },
  required: ['nome', 'quantita'],
  additionalProperties: false,
};

const SCHEMA = {
  type: 'object',
  properties: {
    proposte: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nome:                { type: 'string' },
          ingredienti_io:      { type: 'array', items: INGREDIENTE },
          ingredienti_x:       { type: 'array', items: INGREDIENTE },
          proteine_g:          { type: 'integer' },
          kcal:                { type: 'integer' },
          minuti:              { type: 'integer' },
          scongelamento:       { type: 'string' },
          avanzo:              { type: 'string' },
          perche:              { type: 'string' },
          manca:               { type: 'array', items: { type: 'string' } },
          // la fonte proteica in una parola (pollo, tonno, uova…):
          // serve a non riproporre la stessa proteina troppo spesso
          proteina_principale: { type: 'string' },
        },
        required: ['nome','ingredienti_io','ingredienti_x','proteine_g','kcal',
                   'minuti','scongelamento','avanzo','perche','manca','proteina_principale'],
        additionalProperties: false,
      },
    },
  },
  required: ['proposte'],
  additionalProperties: false,
};

// ============================================================
//  IL PIANO DELLA SETTIMANA (v5, Blocco 2)
//
//  Le nove regole qui sotto sono IN ORDINE DI PRIORITÀ: quando due
//  si scontrano vince quella col numero più basso. La prima — la
//  coerenza di magazzino — è quella che giustifica tutte le altre:
//  un piano che spende due volte lo stesso pollo non è un piano.
// ============================================================
const REGOLE_SETTIMANA = `Sei l'aiuto cucina di una casa in cui vivono due persone diverse.
Stai scrivendo il piano dei pasti di alcuni giorni, costruito sulla dispensa reale.

Ti vengono chiesti solo i pasti che si cucinano a casa. I pasti fuori e i pasti liberi
sono già segnati sul calendario e non devi produrli.

# LE REGOLE, IN ORDINE DI PRIORITÀ

## 1. COERENZA DI MAGAZZINO — la regola che comanda su tutte
Simula i consumi giorno per giorno, come se stessi svuotando davvero la dispensa.
- Un ingrediente usato lunedì non esiste più martedì. Se restano 300 g di pollo, o li
  usi tutti in un pasto o li dividi fra due pasti: non puoi usarne 300 due volte.
- Non superare mai le quantità disponibili. Non aumentare una quantità perché ti fa
  comodo: quello che c'è scritto in dispensa è tutto quello che c'è.
- Tieni conto anche dei pasti già decisi nei giorni precedenti, che ti vengono elencati:
  quella roba è già spesa.
- Le quantità non numeriche o con un "?" ("~1 kg", "sì", "? da verificare") sono
  INCERTE: puoi usarle solo come contorno o insaporimento, MAI come fondamento di un
  pasto e mai come fonte proteica.
- Alla fine scrivi nel campo "resta" che cosa rimarrà in dispensa dopo questi giorni,
  in una frase concreta (es. "restano ~150 g di riso, 2 uova, mezzo pacco di piselli").

## 2. I DIVIETI DI CHI MANGIA — non si negoziano mai
Ogni pasto dice chi lo mangia. Guarda i profili delle persone coinvolte in QUEL pasto.
- Quello che una persona NON MANGIA non entra nel piatto, in nessuna forma.
  Un divieto SENZA precisazioni vale per tutta la famiglia dell'alimento: "cetrioli"
  comprende i sottaceti di cetriolo.
- ⚠️ UN DIVIETO CON UNA PRECISAZIONE RESTRINGE LA FORMA, NON LA FAMIGLIA. Il divieto
  di Lorena è "pomodoro CRUDO", ed è il caso che si sbaglia più spesso, in tutti e due
  i sensi.
  - LA FAMIGLIA RESTA INTERA: pomodoro, pomodorini, datterini, ciliegini, pachino,
    cuore di bue, passata, pelati. Nessuno di questi è "un altro alimento", e cambiare
    nome non è una scappatoia.
  - Quello che è vietato è la FORMA CRUDA. Quindi in un pasto con Lorena: niente
    pomodorini crudi nell'insalata, niente fette di cuore di bue, niente datterini a
    spicchi a crudo, niente panzanella, niente bruschette.
  - COTTI VANNO BENISSIMO PER TUTTI E DUE, senza limiti: sugo, al forno, in umido,
    datterini saltati in padella, pomodorini confit. Passata e pelati sono cotti per
    natura: liberi anche loro.
  - CRUDI vanno bene nei pasti che mangia SOLO CIPRIAN. Lì è permesso e non c'è
    niente da spiegare.
  Quando il pomodoro cotto entra in un pasto con Lorena, dillo esplicitamente nel nome
  del piatto o negli ingredienti ("datterini saltati in padella", non "datterini"):
  chi legge deve vedere che è nella forma consentita.
  NON evitare il pomodoro per prudenza: evitarlo sempre è un errore, non una cautela.
- La stessa logica vale per ogni altro divieto con una precisazione: si restringe la
  forma vietata, e la famiglia dell'alimento resta tutta dentro quella forma.
- Se il profilo chiede pochi ingredienti riconoscibili, il piatto ha pochi ingredienti.
- Il tocco dolce, se è nel profilo di chi mangia, fa parte del pasto: va nel campo
  "dolce", pescato dalla dispensa, e NON fra gli ingredienti.

## 2 bis. QUANDO MANGIANO INSIEME SI CUCINA UN PIATTO SOLO
Nei pasti segnati "entrambi" c'è UN SOLO PIATTO BASE per tutti e due. Due piatti
diversi alla stessa tavola sono un errore, non una soluzione: mangiare insieme vuol
dire mangiare la stessa cosa.

Le uniche differenze ammesse sono VARIANTI DELLO STESSO PIATTO:
- grammature diverse (porzione abbondante per Ciprian, normale per Lorena);
- un'AGGIUNTA PROTEICA A LATO per Ciprian, quando il piatto base non basta al suo
  target: uova, skyr, yogurt greco, grana, tonno, una fetta di petto. Va scritta
  negli ingredienti con "per": "ciprian", e citata in "perche";
- il tocco dolce di Lorena a fine pasto, nel campo "dolce".

Se il piatto condiviso è povero di proteine, il target di Ciprian si recupera con
l'aggiunta a lato oppure sugli ALTRI pasti della giornata: MAI cambiandogli il piatto.
- ESEMPIO GIUSTO: "Gnocchi al pesto" per tutti e due, e fra gli ingredienti 150 g di
  skyr con "per": "ciprian", spiegato in "perche".
- ESEMPIO SBAGLIATO: hamburger e patatine per Ciprian e gnocchi per Lorena. Sono due
  piatti diversi, e non si fa nemmeno per arrivare ai 170 g.

DUE PIATTI DAVVERO DIVERSI: una sola ragione li giustifica, cioè un DIVIETO di chi
mangia che rende quel piatto impossibile per lei e senza una variante semplice
(togliere l'ingrediente, sostituirlo, servirlo cotto invece che crudo). Solo allora
metti tutti e due i piatti nel campo "piatto" ("Pollo al limone per Ciprian · frittata
per Lorena") e dividi gli ingredienti con "per". In quel caso "perche" DEVE dire la
ragione in una riga ("niente pomodoro crudo per Lorena e la variante cotta qui non
regge"): chi legge vuole vedere il perché, non subirlo.
La fonte proteica diversa fra i due non è una libertà: è questo caso qui, oppure
l'aggiunta a lato. Fuori da qui, stessa proteina per tutti e due.

Nei pasti liberi non si cucina e non si genera niente, per nessuno dei due.

## 3. DEPERIBILI E SCADENZE PRIMA DI TUTTO
I freschi in scadenza e i deperibili già aperti si consumano nei primi giorni del piano.
Le scatolette e la roba secca possono aspettare la fine.

## 4. I TARGET DI CIPRIAN
170 g di proteine al giorno (minimo accettabile 150), circa 2200 kcal.
- Colazione fissa 20 g · 290 kcal e yogurt greco 17 g · 100 kcal sono GIÀ CONTATI a
  parte dall'app: non metterli nel piano e non contarli nei campi "prot" e "kcal".
- Restano circa 133 g fra pranzo e cena: ogni suo pasto principale sta fra 55 e 70 g
  di proteine.
- Porzioni di riferimento, sempre a crudo o sgocciolate: pollo/tacchino 250-300 g ->
  55-70 g proteine · hamburger 300 g -> ~57 g · pesce fresco 300 g -> 50-60 g ·
  tonno sgocciolato 100 g -> ~28 g · uovo -> 6-7 g · grana 20 g -> 7 g ·
  polpo 100 g -> ~15 g (è "diluito": va SEMPRE abbinato a un'altra fonte proteica).
- Nei giorni in cui Ciprian mangia fuori o ha un pasto libero il totale scende, ed è
  giusto così: NON compensare mai nei giorni vicini caricando di proteine gli altri
  pasti. Un pasto libero fa parte del metodo, non è uno sgarro da recuperare.
- I campi "prot" e "kcal" sono SOLO di Ciprian. Nei pasti che mangia solo l'altra
  persona scrivi 0 in tutti e due: l'app non mostrerà nessun numero.

## 5. LA CATENA DELLE DOPPIE PORZIONI — si guarda avanti e indietro
Dove ha senso, cucina doppio e manda l'avanzo al pasto dopo: scrivilo in "avanzo_per"
sul pasto che cucina ("→ pranzo di mercoledì") e ripeti il piatto nel pasto che lo
riceve, dicendo lì in "perche" che è l'avanzo del giorno prima.

⚠️ GUARDA AVANTI. Ti viene data la settimana INTERA — chi mangia, chi è fuori, chi
ha il pasto libero, le note — anche per i giorni che non stai scrivendo adesso. Serve
proprio a questo: una cena decide la porzione doppia solo se sa chi c'è domani a
pranzo. Se domani a pranzo c'è Ciprian da solo, la cena di stasera nasce già con
la SUA porzione proteica del giorno dopo dentro. Senza guardare avanti la catena
nasce cieca.
⚠️ L'avanzo deve rispettare i vincoli di CHI LO MANGERÀ DOMANI, non di chi cucina
stasera: se domani a pranzo c'è una persona con divieti diversi, il piatto di stasera
deve già andare bene per lei, altrimenti non fare la doppia porzione.

⚠️ GUARDA INDIETRO, ed è un OBBLIGO, non un'opzione. Fra i pasti già decisi può
esserci un "avanzo_per" che punta a un pasto che stai scrivendo adesso. In quel caso
QUEL PASTO È QUELL'AVANZO: si ripete il piatto del giorno prima, non se ne inventa
uno nuovo, e in "perche" si scrive che è l'avanzo. Un avanzo promesso e poi non
raccolto è cibo buttato e una bugia nel piano.
L'unica eccezione è l'impossibilità vera (chi mangia oggi non può mangiarlo, la
quantità non basta): allora scrivi il piatto nuovo E DICHIARA IN UNA RIGA, nel campo
"perche", perché l'avanzo non è stato raccolto.

## 5 bis. I PRANZI DI CIPRIAN DA SOLO — ha un'ora di pausa
Nei giorni feriali il pranzo che mangia solo Ciprian si fa in una pausa di un'ora:
deve stare in piedi da solo, in cucina e nella testa. In quest'ordine:
1. **L'avanzo della cena precedente, da scaldare e basta.** È la via maestra, ed è il
   motivo per cui la regola 5 esiste. Preferiscilo sempre quando c'è.
2. Se un avanzo non c'è, un piatto pronto in **15 minuti veri in tutto**, pochi
   passaggi, poche cose da lavare ("tempo" dice la verità: 15 al massimo).
3. MAI a pranzo cotture lunghe, forno, brasati, più pentole insieme o piatti che
   vanno assemblati al momento.
⚠️ Il target proteico non si sconta per fretta: si risolve a monte. Le sue cene
devono nascere già con la porzione proteica giusta ANCHE per il pranzo del giorno
dopo, così l'avanzo arriva completo e non serve aggiungere niente di corsa.

## 6. VARIETÀ, PERSONA PER PERSONA
- Profilo con ripetizione BASSA: mai piatti simili ravvicinati, mai la stessa fonte
  proteica due giorni di fila.
- Profilo con ripetizione ALTA: la ripetizione non è un problema, non forzare la
  varietà. Riso e tonno due giorni di fila per lui vanno benissimo.
- ⚠️ In un pasto "entrambi" comanda il profilo più esigente: se una delle due chiede
  varietà, quel piatto condiviso non si ripete. Le ripetizioni di chi le tollera
  vivono nei suoi pasti da solo (la catena cena → pranzo del giorno dopo), che
  restano come sono.
Guarda anche l'elenco di quello che è stato mangiato negli ultimi giorni.

## 7. I VOTI, PER PERSONA
Un piatto votato NO da una qualsiasi delle persone che mangiano in QUEL pasto non si
propone mai. Un piatto col cuore di tutte le persone di quel pasto ha la precedenza.
I voti di chi in quel pasto non mangia non contano.

## 8. SCONGELAMENTI
Se un pasto usa qualcosa dal congelatore:
- carne e polpo -> "scongelamento" dice cosa spostare in frigo, e "scongelare_il" è la
  data del GIORNO PRIMA del pasto (formato AAAA-MM-GG);
- hamburger, kebab, gamberi -> si cuociono da congelati: scrivilo in "scongelamento"
  ("si cuoce da congelato", "gamberi in acqua fredda 20 minuti") e lascia
  "scongelare_il" al giorno stesso del pasto.
Non ometterlo mai: è il punto in cui i piani falliscono più spesso.

## 9. GLI INGREDIENTI CHE MANCANO
Non inventare mai un ingrediente che non c'è.
- Un pasto può richiedere al massimo 2 cose che non sono in dispensa, e MAI la fonte
  proteica principale: quella deve già esserci.
- Le cose che mancano vanno SOLO nell'elenco "manca" del pasto, mai fra gli
  ingredienti. I conti di proteine e kcal le considerano comunque presenti.
- La maggior parte dei pasti deve essere fattibile con quello che c'è: se ogni giorno
  dipende dalla spesa, il piano non serve a niente.

# COME SI SCRIVE UN PASTO
- "day" e "pasto" copiano esattamente quelli che ti sono stati chiesti. Non aggiungere
  pasti che non ti sono stati chiesti e non saltarne nessuno.
- ⚠️ I NOMI DEGLI INGREDIENTI SI COPIANO DALLA DISPENSA, LETTERA PER LETTERA.
  Se in dispensa c'è scritto "Uova", scrivi "Uova": non "uovo", non "uova bio",
  non "2 uova". Niente singolari al posto dei plurali, niente sinonimi, niente
  riformulazioni, niente aggettivi aggiunti. Il nome sta in "nome" e la quantità
  in "qta", separati. L'app confronta questi nomi con la dispensa per sapere che
  cosa resta: se li cambi, crede che manchi della roba che invece c'è.
  Solo gli ingredienti dell'elenco "manca" — che in dispensa non ci sono — li
  scrivi come vuoi, in modo semplice e riconoscibile al supermercato.
- "ingredienti": quantità PER PERSONA, come stringhe ("250 g", "2 uova"). Il campo
  "per" vale "tutti" se la porzione è uguale per chi mangia, oppure "ciprian" / "lorena"
  quando le porzioni o gli alimenti sono diversi. Se mangia una persona sola, usa "tutti".
- "perche": UNA riga che spiega la scelta ("usa le zucchine, sono le ultime").
- "tempo": minuti veri di preparazione.
- "proteina_principale": una parola minuscola e generica (pollo, tonno, uova, manzo,
  pesce, legumi, formaggio, maiale). Serve alla regola della varietà.
- Campi che non servono: stringa vuota "" per i testi, 0 per i numeri, [] per le liste.

Scrivi in italiano semplice e concreto. Niente tono da dieta, niente premi, niente colpe.`;

const INGREDIENTE_PIANO = {
  type: 'object',
  properties: {
    nome: { type: 'string' },
    qta:  { type: 'string' },
    // 'tutti' · 'ciprian' · 'lorena' — sono i NOMI VERI, non gli slug del database
    per:  { type: 'string' },
  },
  required: ['nome', 'qta', 'per'],
  additionalProperties: false,
};

const SCHEMA_SETTIMANA = {
  type: 'object',
  properties: {
    pasti: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day:                 { type: 'string' },   // AAAA-MM-GG
          pasto:               { type: 'string' },   // pranzo · cena
          piatto:              { type: 'string' },
          perche:              { type: 'string' },
          ingredienti:         { type: 'array', items: INGREDIENTE_PIANO },
          dolce:               { type: 'string' },
          tempo:               { type: 'integer' },
          prot:                { type: 'integer' },  // solo Ciprian, 0 se non lo riguarda
          kcal:                { type: 'integer' },  // idem
          scongelamento:       { type: 'string' },
          scongelare_il:       { type: 'string' },   // AAAA-MM-GG, di solito il giorno prima
          avanzo_per:          { type: 'string' },
          manca:               { type: 'array', items: { type: 'string' } },
          proteina_principale: { type: 'string' },
        },
        required: ['day','pasto','piatto','perche','ingredienti','dolce','tempo','prot','kcal',
                   'scongelamento','scongelare_il','avanzo_per','manca','proteina_principale'],
        additionalProperties: false,
      },
    },
    // cosa rimarrà in dispensa dopo questi giorni: entra nel prompt del blocco dopo
    resta: { type: 'string' },
  },
  required: ['pasti', 'resta'],
  additionalProperties: false,
};

// ------------------------------------------------------------
//  LA CHIAMATA A CLAUDE — una sola, condivisa dai due mestieri
// ------------------------------------------------------------

/**
 * Riconosce gli oggetti completi dentro un JSON che si sta ancora scrivendo.
 * Tiene conto delle stringhe e delle virgolette scappate, così una graffa
 * dentro un testo (es. "sugo {piccante}") non lo confonde.
 * Guarda solo il PRIMO array che incontra: negli schemi qui sopra è sempre
 * quello che conta (le proposte, i pasti).
 */
function creaLettore() {
  let buf = '', i = 0;
  let dentroArray = false, profondita = 0, inizio = -1, inStringa = false, scappato = false;
  return {
    aggiungi(pezzo: string): unknown[] {
      buf += pezzo;
      const complete: unknown[] = [];
      for (; i < buf.length; i++) {
        const c = buf[i];
        if (inStringa) {
          if (scappato) { scappato = false; continue; }
          if (c === '\\') { scappato = true; continue; }
          if (c === '"') inStringa = false;
          continue;
        }
        if (c === '"') { inStringa = true; continue; }
        if (!dentroArray) { if (c === '[') dentroArray = true; continue; }
        if (c === '{') { if (profondita === 0) inizio = i; profondita++; continue; }
        if (c === '}') {
          profondita--;
          if (profondita === 0 && inizio >= 0) {
            try { complete.push(JSON.parse(buf.slice(inizio, i + 1))); } catch { /* non ancora valida */ }
            inizio = -1;
          }
        }
      }
      return complete;
    },
    testoIntero: () => buf,
  };
}

type EsitoChiamata =
  | { ok: true;  corpo: ReadableStream<Uint8Array> }
  | { ok: false; risposta: Response };

/**
 * Chiede a Claude, in streaming. Se qualcosa va storto restituisce già
 * pronta la risposta d'errore in italiano semplice da rimandare all'app.
 */
async function chiamaAnthropic(
  system: string, contesto: string, schema: unknown, maxTokens: number,
): Promise<EsitoChiamata> {
  let risposta: Response;
  try {
    risposta = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELLO,
        max_tokens: maxTokens,
        system,
        thinking: { type: 'adaptive' },
        output_config: {
          effort: IMPEGNO,
          format: { type: 'json_schema', schema },
        },
        messages: [{ role: 'user', content: contesto }],
        stream: true,
      }),
    });
  } catch {
    return { ok: false, risposta: errore('Il generatore non risponde. Riprova fra un minuto.', 502) };
  }

  if (!risposta.ok || !risposta.body) {
    const dettaglio = await risposta.text().catch(() => '');
    console.error('Anthropic', risposta.status, dettaglio);
    if (risposta.status === 401)
      return { ok: false, risposta: errore('La chiave del generatore non è valida. Va rifatta nei Secrets di Supabase.', 500) };
    if (risposta.status === 429)
      return { ok: false, risposta: errore('Il generatore è momentaneamente occupato. Riprova fra un minuto.', 503) };
    if (risposta.status === 400 && /credit|balance/i.test(dettaglio))
      return { ok: false, risposta: errore('Il credito del generatore è esaurito. Va ricaricato dal sito di Anthropic.', 402) };
    return { ok: false, risposta: errore('Il generatore non risponde. Riprova fra un minuto.', 502) };
  }

  return { ok: true, corpo: risposta.body };
}

/**
 * Srotola il flusso SSE di Anthropic e ne tira fuori solo quello che ci
 * serve: i pezzi di testo man mano che arrivano, e il motivo per cui si
 * è fermato. Scritta una volta, la usano tutti e due i mestieri.
 */
type PezzoDiFlusso = { testo?: string; stop?: string; guasto?: boolean };

async function* pezziDiTesto(corpo: ReadableStream<Uint8Array>): AsyncGenerator<PezzoDiFlusso> {
  const sorgente = corpo.getReader();
  const decodificatore = new TextDecoder();
  let resto = '';

  while (true) {
    const { done, value } = await sorgente.read();
    if (done) break;
    resto += decodificatore.decode(value, { stream: true });

    const righe = resto.split('\n');
    resto = righe.pop() ?? '';

    for (const riga of righe) {
      if (!riga.startsWith('data:')) continue;
      const corpoRiga = riga.slice(5).trim();
      if (!corpoRiga || corpoRiga === '[DONE]') continue;

      let ev: Record<string, any>;
      try { ev = JSON.parse(corpoRiga); } catch { continue; }

      if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
        yield { testo: String(ev.delta.text ?? '') };
      } else if (ev.type === 'message_delta' && ev.delta?.stop_reason) {
        yield { stop: String(ev.delta.stop_reason) };
      } else if (ev.type === 'error') {
        yield { guasto: true };
      }
    }
  }
}

/** Una riga NDJSON per messaggio: è il formato che l'app sa leggere. */
function flussoNdjson(scrivi: (manda: (o: unknown) => void) => Promise<void>): Response {
  const codificatore = new TextEncoder();
  const flusso = new ReadableStream({
    async start(controller) {
      const manda = (o: unknown) =>
        controller.enqueue(codificatore.encode(JSON.stringify(o) + '\n'));
      try {
        await scrivi(manda);
      } catch (e) {
        console.error('streaming', e);
        manda({ tipo: 'errore', errore: 'Il collegamento col generatore si è interrotto. Riprova.' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(flusso, {
    headers: {
      ...CORS,
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}

// ------------------------------------------------------------
//  IL PIANO DELLA SETTIMANA — un blocco di 2-3 giorni per volta
// ------------------------------------------------------------
type PastoChiesto = { pasto: string; chi: string; nota: string };
type GiornoChiesto = { day: string; pasti: PastoChiesto[] };

async function pianificaSettimana(body: Record<string, unknown>): Promise<Response> {
  const ioSlug = String(body.io_slug ?? 'lorena').slice(0, 40);
  const primo   = body.primo === true;
  const restanti = Math.min(BLOCCHI_SETTIMANA, Math.max(1, Number(body.restanti) || 1));

  // I giorni chiesti, ripuliti: al massimo 3 giorni e 2 pasti per giorno.
  const giorni: GiornoChiesto[] = (Array.isArray(body.giorni) ? body.giorni : [])
    .slice(0, 3)
    .map((g: any) => ({
      day: String(g?.day ?? '').slice(0, 10),
      pasti: (Array.isArray(g?.pasti) ? g.pasti : []).slice(0, 2).map((p: any) => ({
        pasto: p?.pasto === 'cena' ? 'cena' : 'pranzo',
        chi:   ['ciprian', 'entrambi', 'lorena'].includes(String(p?.chi)) ? String(p.chi) : 'entrambi',
        nota:  String(p?.nota ?? '').slice(0, 200),
      })),
    }))
    .filter((g) => /^\d{4}-\d{2}-\d{2}$/.test(g.day) && g.pasti.length);

  if (!giorni.length) return errore('Non ci sono pasti da pianificare in questi giorni.', 400);

  // Quello che i blocchi precedenti hanno già deciso: quella roba è già spesa.
  const giaFatti = (Array.isArray(body.gia_pianificato) ? body.gia_pianificato : [])
    .slice(0, 20)
    .map((x) => String(x).slice(0, 400));
  const restaPrima = String(body.resta_prima ?? '').slice(0, 900);
  // Anche i pasti fuori e liberi contano: dicono chi NON mangia a casa.
  const fuoriELiberi = (Array.isArray(body.fuori_e_liberi) ? body.fuori_e_liberi : [])
    .slice(0, 20)
    .map((x) => String(x).slice(0, 160));

  // ⚠️ La settimana INTERA, compresi i giorni che NON stiamo scrivendo adesso.
  // Senza sguardo in avanti la catena "cucino doppio stasera → avanzo domani"
  // nasce cieca: una cena può decidere la porzione doppia solo sapendo chi c'è
  // domani a pranzo. Quando c'è, prende il posto di fuori_e_liberi, che dice
  // molto meno. Da qui in poi si genera un giorno per chiamata: questa è
  // l'unica cosa che tiene insieme i giorni.
  const settimana = (Array.isArray(body.settimana) ? body.settimana : [])
    .slice(0, 14)
    .map((x) => String(x).slice(0, 200));

  // --- il tetto giornaliero ---------------------------------
  // Sul primo blocco controlliamo che il margine basti per TUTTA la
  // settimana: meglio fermarsi prima che a metà lavoro.
  try {
    if (primo) {
      const usateFinora = await generazioniUsateOggi();
      if (usateFinora + restanti > MAX_AL_GIORNO) {
        return errore(
          `Per generare la settimana servono ${restanti} generazioni delle ${MAX_AL_GIORNO} di oggi, e ne restano ${Math.max(0, MAX_AL_GIORNO - usateFinora)}. Riprova domani.`,
          429,
        );
      }
    }
    const usate = await consumaUnaGenerazione();
    if (usate === -1) {
      return errore(
        `Per oggi hai già usato tutte le ${MAX_AL_GIORNO} generazioni disponibili. Riprova domani.`,
        429,
      );
    }
  } catch {
    return errore('Non riesco a controllare il contatore delle generazioni. Riprova fra poco.', 500);
  }

  // --- i dati veri ------------------------------------------
  let c: Contesto;
  try { c = await leggiContesto(); }
  catch { return errore('Non riesco a leggere la dispensa. Riprova fra poco.', 500); }

  if (!c.inv.length) {
    return errore('La dispensa è vuota: aggiungi qualche ingrediente e riprova.', 400);
  }

  const impostazioni = Object.fromEntries(c.setRows.map((s) => [s.key, s.value]));
  const quantiPasti = giorni.reduce((n, g) => n + g.pasti.length, 0);

  const contesto = `## DISPENSA DI ADESSO

${descriviDispensa(c.inv)}
${restaPrima ? `\n⚠️ ATTENZIONE: i giorni precedenti del piano hanno già consumato una parte di questa dispensa.\nDopo quei giorni resta questo:\n${restaPrima}\nParti da QUI, non dalla dispensa piena.` : ''}

## LE PERSONE
${c.profili.length ? c.profili.map((p) => descriviProfilo(p, ioSlug)).join('\n\n') : '- (profili non configurati: considera una sola persona con gli obiettivi qui sotto)'}

Nel piano le persone si chiamano con questi nomi: "ciprian" è chi ha l'obiettivo
proteico, "lorena" è l'altra, "entrambi" quando mangiano insieme.

## RICETTE GIÀ VOTATE — i voti sono PER PERSONA
${descriviVoti(c)}

## MANGIATO NEGLI ULTIMI GIORNI (per la regola della varietà)
${descriviRecenti(c)}

## OBIETTIVI DI RIFERIMENTO
${impostazioni.kcal_target ?? 2200} kcal · ${impostazioni.protein_target ?? 170} g di proteine al giorno, per chi ce li ha.

${giaFatti.length ? `## PASTI GIÀ DECISI NEI GIORNI PRECEDENTI DI QUESTO PIANO
Questa roba è già spesa e questi piatti sono già stati usati: non ripeterli se il
profilo di chi mangia chiede varietà, e non riusare gli ingredienti che hanno consumato.
${giaFatti.map((x) => `- ${x}`).join('\n')}
` : ''}
${settimana.length ? `## LA SETTIMANA INTERA — serve a guardare avanti
Questi sono TUTTI i pasti della settimana, compresi quelli che NON stai scrivendo
adesso: dove si mangia e chi c'è. Guardali prima di decidere le porzioni doppie —
una cena cucina doppio solo se sa chi ci sarà domani a pranzo — e prima di scegliere
la fonte proteica, per non ripetere quella di ieri o di domani.
Scrivi SOLO i pasti che ti vengono chiesti più sotto: gli altri sono contorno.
${settimana.map((x) => `- ${x}`).join('\n')}
` : (fuoriELiberi.length ? `## GIORNI IN CUI NON SI CUCINA (già segnati, non produrli)
${fuoriELiberi.map((x) => `- ${x}`).join('\n')}
` : '')}
## I PASTI DA SCRIVERE ADESSO — esattamente ${quantiPasti}, né uno di più né uno di meno

${giorni.map((g) => `### ${g.day}
${g.pasti.map((p) => `- ${p.pasto} — mangia: ${p.chi}${p.nota ? ` — nota di chi ha compilato: "${p.nota}"` : ''}`).join('\n')}`).join('\n\n')}

Scrivi i pasti in ordine di giorno e, dentro il giorno, prima il pranzo e poi la cena.
Alla fine compila "resta" con quello che rimarrà in dispensa dopo questi giorni.`;

  const chiamata = await chiamaAnthropic(REGOLE_SETTIMANA, contesto, SCHEMA_SETTIMANA, MAX_TOKENS_SETTIMANA);
  if (!chiamata.ok) return chiamata.risposta;

  return flussoNdjson(async (manda) => {
    const lettore = creaLettore();
    let mandati = 0;
    let motivoStop = '';

    manda({ tipo: 'stato', testo: 'Sto guardando cosa c’è in dispensa…' });

    // ⚠️ Il modello ragiona a lungo prima di scrivere il primo piatto, e
    // mentre ragiona sul filo non passa NIENTE: un collegamento silenzioso
    // per minuti, su un telefono, viene chiuso da chi sta in mezzo. Il
    // battito lo tiene caldo e dice all'app che siamo vivi.
    // Non basta da solo: se lo schermo si spegne il filo cade lo stesso, ed
    // è per questo che l'app scrive nel calendario blocco per blocco.
    const battito = setInterval(() => {
      try { manda({ tipo: 'battito' }); } catch { /* il filo è già chiuso */ }
    }, 10_000);

    try {
      for await (const pezzo of pezziDiTesto(chiamata.corpo)) {
        if (pezzo.guasto) {
          manda({ tipo: 'errore', errore: 'Il generatore si è interrotto. Riprova.' });
          continue;
        }
        if (pezzo.stop) { motivoStop = pezzo.stop; continue; }
        if (!pezzo.testo) continue;

        for (const pasto of lettore.aggiungi(pezzo.testo)) {
          if (mandati >= quantiPasti) continue;
          mandati++;
          manda({ tipo: 'pasto', pasto });
        }
      }
    } finally {
      clearInterval(battito);
    }

    // "resta" sta in fondo al JSON, dopo l'array: si legge alla fine.
    let resta = '';
    try {
      const tutto = JSON.parse(lettore.testoIntero());
      resta = String(tutto?.resta ?? '');
    } catch { /* JSON incompleto: pazienza, i pasti li abbiamo già mandati */ }

    // "troncato" NON e' un errore: e' un'informazione operativa.
    // L'app la usa per rifare da sola il blocco un giorno alla volta, senza
    // chiedere niente a chi sta guardando. Se mandassimo un errore, la
    // settimana si fermerebbe qui e il lavoro ricadrebbe sull'utente.
    const troncato = motivoStop === 'max_tokens';

    if (!mandati && !troncato) {
      if (motivoStop === 'refusal') {
        manda({ tipo: 'errore', errore: 'Il generatore non se la sente di rispondere a questa richiesta. Prova a riformularla.' });
      } else {
        console.error('nessun pasto; testo grezzo:', lettore.testoIntero().slice(0, 500));
        manda({ tipo: 'errore', errore: 'Non riesco a costruire un piano con questa dispensa. Prova ad aggiungere qualche ingrediente.' });
      }
      return;
    }

    if (troncato) {
      console.error(`blocco troncato: ${mandati} pasti su ${quantiPasti}, max_tokens ${MAX_TOKENS_SETTIMANA}`);
    }

    manda({ tipo: 'fine', quanti: mandati, chiesti: quantiPasti, resta, troncato });
  });
}

// ------------------------------------------------------------
//  Il corpo della richiesta
// ------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return errore('Richiesta non valida.', 405);

  // --- 1. cosa ha chiesto l'app, ripulito -------------------
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* corpo vuoto: usiamo i valori di default */ }

  // Controllo diagnostico: dice se la chiave è stata trovata e con che nome.
  // Non consuma generazioni e non mostra MAI il valore della chiave.
  if (body.controllo === true) {
    return json({
      chiave_trovata: Boolean(ANTHROPIC_API_KEY),
      nome_del_secret: NOME_SECRET || null,
      secrets_simili_presenti: nomiSecretsSospetti(),
      tetto_giornaliero: MAX_AL_GIORNO,
      modello: MODELLO,
    });
  }

  if (!ANTHROPIC_API_KEY) {
    const simili = nomiSecretsSospetti();
    return errore(
      simili.length
        ? `Ho trovato il secret "${simili.join('", "')}" ma non contiene una chiave Anthropic valida (deve iniziare con sk-ant-). Controlla di aver incollato la chiave intera.`
        : 'Non trovo la chiave del generatore fra i Secrets di Supabase. Controlla che il secret esista e che il valore inizi con sk-ant-.',
      500,
    );
  }

  // Il piano della settimana è l'altro mestiere di questa function:
  // stessa chiave, stesso contatore, stessa dispensa, prompt diverso.
  if (body.modo === 'settimana') return await pianificaSettimana(body);

  const pasto  = body.pasto === 'cena' ? 'cena' : 'pranzo';
  const chi    = ['io', 'io_e_x', 'solo_x'].includes(String(body.chi)) ? String(body.chi) : 'io';
  const ioSlug = String(body.io_slug ?? 'lorena').slice(0, 40);
  const minuti = [15, 30, 60].includes(Number(body.minuti)) ? Number(body.minuti) : 30;
  const quante = Number(body.quante) === 1 ? 1 : 3;
  const giaMangiato  = String(body.gia_mangiato ?? '').slice(0, 600);
  const voglia       = String(body.voglia ?? '').slice(0, 300);
  const personalizza = String(body.personalizza ?? '').slice(0, 400);
  const escludi = Array.isArray(body.escludi)
    ? (body.escludi as unknown[]).slice(0, 40).map((x) => String(x).slice(0, 120))
    : [];

  // --- 2. il tetto giornaliero ------------------------------
  try {
    const usate = await consumaUnaGenerazione();
    if (usate === -1) {
      return errore(
        `Per oggi hai già usato tutte le ${MAX_AL_GIORNO} generazioni disponibili. Riprova domani.`,
        429,
      );
    }
  } catch {
    return errore('Non riesco a controllare il contatore delle generazioni. Riprova fra poco.', 500);
  }

  // --- 3. i dati veri, letti qui dal database ---------------
  let c: Contesto;
  try { c = await leggiContesto(); }
  catch { return errore('Non riesco a leggere la dispensa. Riprova fra poco.', 500); }

  const { profili } = c;

  if (!c.inv.length) {
    return errore('La dispensa è vuota: aggiungi qualche ingrediente e riprova.', 400);
  }

  const impostazioni = Object.fromEntries(c.setRows.map((s) => [s.key, s.value]));

  // --- 4. il messaggio per Claude ---------------------------
  const contesto = `## DISPENSA DI OGGI

${descriviDispensa(c.inv)}

## RICETTE GIÀ VOTATE — i voti sono PER PERSONA
${descriviVoti(c)}

Regola sui voti: un piatto con **NO da una qualsiasi delle persone che mangiano
adesso** non va proposto, mai. Un piatto con il cuore di TUTTE le persone che
mangiano ha la precedenza. I voti di chi stasera non mangia non contano.

## LE PERSONE
${profili.length ? profili.map((p) => descriviProfilo(p, ioSlug)).join('\n\n') : '- (profili non configurati: considera una sola persona con gli obiettivi qui sotto)'}

## MANGIATO NEGLI ULTIMI GIORNI (per non ripeterti)
${descriviRecenti(c)}

## OBIETTIVI DEL GIORNO
${impostazioni.kcal_target ?? 2200} kcal · ${impostazioni.protein_target ?? 170} g di proteine

## LA RICHIESTA DI ADESSO
Pasto: ${pasto}
Chi mangia: ${(() => {
  const mio = profili.find((p) => p.slug === ioSlug);
  const altro = profili.find((p) => p.slug !== ioSlug);
  if (!mio || !altro) return chi === 'io_e_x' ? 'due persone' : 'una persona sola';
  if (chi === 'io_e_x') return `TUTTE E DUE: ${mio.nome} e ${altro.nome}`;
  if (chi === 'solo_x') return `SOLO ${altro.nome}`;
  return `SOLO ${mio.nome}`;
})()}
Tempo a disposizione: ${minuti === 60 ? "un'ora o più" : `${minuti} minuti al massimo`}
${giaMangiato ? `Già mangiato oggi: ${giaMangiato}\n(calcola quante proteine mancano e dimensiona il pasto di conseguenza)` : 'Già mangiato oggi: non dichiarato'}
${voglia
  ? `VOGLIA DICHIARATA: ${voglia}\n(vedi la regola 11: orienta le proposte in questa direzione, ma i divieti e il minimo proteico vengono prima. Se c'è un compromesso, dichiaralo nel campo "perche".)`
  : 'Voglia dichiarata: nessuna'}
${escludi.length ? `\nPIATTI DA NON RIPROPORRE IN QUESTA SESSIONE (già visti o scartati):\n${escludi.map((n) => `- ${n}`).join('\n')}` : ''}
${personalizza ? `\nRICHIESTA DI MODIFICA DA RISPETTARE: ${personalizza}\n(ricalcola proteine e kcal dopo la modifica)` : ''}

Genera ${quante === 1 ? 'UNA sola proposta' : 'ESATTAMENTE 3 proposte diverse fra loro'}.`;

  // --- 5. la chiamata a Claude, in streaming ----------------
  //
  // Perché streaming: la risposta completa impiega ~30 secondi, ma la PRIMA
  // proposta è pronta molto prima. Leggiamo il flusso man mano che arriva e
  // spediamo ogni proposta al telefono appena è completa, così si comincia a
  // leggere mentre le altre si stanno ancora scrivendo.
  //
  // Resta UNA SOLA chiamata al modello: conta come una generazione sola
  // rispetto al tetto giornaliero, e il modello vede tutte e tre le proposte
  // insieme (serve per garantire che almeno una sia fattibile e che siano
  // diverse fra loro).

  const chiamata = await chiamaAnthropic(REGOLE, contesto, SCHEMA, MAX_TOKENS);
  if (!chiamata.ok) return chiamata.risposta;

  return flussoNdjson(async (manda) => {
    const lettore = creaLettore();
    let quante_inviate = 0;
    let motivoStop = '';

    manda({ tipo: 'stato', testo: 'Sto pensando alla prima proposta…' });

    // Stesso battito del piano settimanale: tiene caldo un filo che, mentre
    // il modello pensa, resterebbe muto. Vedi il commento là sopra.
    const battito = setInterval(() => {
      try { manda({ tipo: 'battito' }); } catch { /* il filo è già chiuso */ }
    }, 10_000);

    try {
      for await (const pezzo of pezziDiTesto(chiamata.corpo)) {
        if (pezzo.guasto) {
          manda({ tipo: 'errore', errore: 'Il generatore si è interrotto. Riprova.' });
          continue;
        }
        if (pezzo.stop) { motivoStop = pezzo.stop; continue; }
        if (!pezzo.testo) continue;

        for (const proposta of lettore.aggiungi(pezzo.testo)) {
          if (quante_inviate >= quante) continue;
          quante_inviate++;
          manda({ tipo: 'proposta', proposta });
          if (quante_inviate < quante) {
            manda({
              tipo: 'stato',
              testo: quante_inviate === 1
                ? 'Prima proposta pronta. Sto scrivendo la seconda…'
                : 'Ci siamo, ultima proposta…',
            });
          }
        }
      }
    } finally {
      clearInterval(battito);
    }

    if (!quante_inviate) {
      if (motivoStop === 'refusal') {
        manda({ tipo: 'errore', errore: 'Il generatore non se la sente di rispondere a questa richiesta. Prova a riformularla.' });
      } else if (motivoStop === 'max_tokens') {
        manda({ tipo: 'errore', errore: 'La risposta si è interrotta a metà. Riprova.' });
      } else {
        console.error('nessuna proposta; testo grezzo:', lettore.testoIntero().slice(0, 500));
        manda({ tipo: 'errore', errore: 'Il generatore non ha trovato nulla da proporre con questa dispensa.' });
      }
      return;
    }

    manda({ tipo: 'fine', quante: quante_inviate });
  });
});
