// ============================================================
//  Piano & Dispensa — Edge Function "cosa-cucino"
//
//  QUESTO FILE NON VA SU GITHUB PAGES.
//  Va incollato dentro Supabase → Edge Functions → cosa-cucino.
//
//  COSA FA
//    1. controlla di non aver superato il tetto di generazioni al giorno
//    2. legge da sola inventario, ricette e obiettivi dal database
//       (non si fida di quello che arriva dal telefono)
//    3. chiede a Claude delle proposte che rispettano il metodo
//    4. restituisce all'app un elenco pulito di piatti
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

## 7. LA COMMENSALE "X"
Quando è presente, il piatto è lo stesso ma le sue porzioni sono normali, non proteiche.
Riempi "ingredienti_x" con le quantità per lei. Quando mangia da sola l'utente,
lascia "ingredienti_x" come lista vuota.

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

## COSA NON FARE
- Non riproporre mai le ricette segnate come "da non riproporre".
- Le ricette segnate come preferite hanno priorità, se gli ingredienti ci sono.
- Non spacciare per presente un ingrediente che non c'è: se manca, va dichiarato.

## FORMA
Scrivi in italiano semplice e concreto. Il campo "perche" è una riga sola che spiega
la ragione della scelta (es. "usa le zucchine, sono le ultime e vanno consumate").
Le quantità sono stringhe come "250 g" o "2 uova".`;

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

  const pasto  = body.pasto === 'cena' ? 'cena' : 'pranzo';
  const chi    = body.chi === 'io_e_x' ? 'io_e_x' : 'io';
  const minuti = [15, 30, 60].includes(Number(body.minuti)) ? Number(body.minuti) : 30;
  const quante = Number(body.quante) === 1 ? 1 : 3;
  const giaMangiato  = String(body.gia_mangiato ?? '').slice(0, 600);
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
  let inv: Array<{ name: string; qty: string; cat: string }>;
  let rec: Array<{ name: string; pref: string | null }>;
  let setRows: Array<{ key: string; value: string }>;
  try {
    [inv, rec, setRows] = await Promise.all([
      leggi('inventory_items', 'name,qty,cat'),
      leggi('recipes', 'name,pref'),
      leggi('settings', 'key,value'),
    ]);
  } catch {
    return errore('Non riesco a leggere la dispensa. Riprova fra poco.', 500);
  }

  if (!inv.length) {
    return errore('La dispensa è vuota: aggiungi qualche ingrediente e riprova.', 400);
  }

  const perCat = (c: string) => {
    const righe = inv.filter((i) => i.cat === c);
    return righe.length ? righe.map((i) => `- ${i.name} — ${i.qty}`).join('\n') : '- (vuoto)';
  };
  const nomiPref = (p: string | null) =>
    rec.filter((r) => r.pref === p).map((r) => r.name).join(' · ') || '(nessuna)';
  const impostazioni = Object.fromEntries(setRows.map((s) => [s.key, s.value]));

  // --- 4. il messaggio per Claude ---------------------------
  const contesto = `## DISPENSA DI OGGI

FRIGO
${perCat('frigo')}

CONGELATORE
${perCat('freezer')}

DISPENSA
${perCat('dispensa')}

## RICETTE GIÀ VOTATE
Preferite (priorità): ${nomiPref('fav')}
Vanno bene: ${nomiPref('ok')}
DA NON RIPROPORRE MAI: ${nomiPref('no')}

## OBIETTIVI DEL GIORNO
${impostazioni.kcal_target ?? 2200} kcal · ${impostazioni.protein_target ?? 170} g di proteine

## LA RICHIESTA DI ADESSO
Pasto: ${pasto}
Chi mangia: ${chi === 'io_e_x' ? 'io e la commensale X' : 'solo io'}
Tempo a disposizione: ${minuti === 60 ? "un'ora o più" : `${minuti} minuti al massimo`}
${giaMangiato ? `Già mangiato oggi: ${giaMangiato}\n(calcola quante proteine mancano e dimensiona il pasto di conseguenza)` : 'Già mangiato oggi: non dichiarato'}
${escludi.length ? `\nPIATTI DA NON RIPROPORRE IN QUESTA SESSIONE (già visti o scartati):\n${escludi.map((n) => `- ${n}`).join('\n')}` : ''}
${personalizza ? `\nRICHIESTA DI MODIFICA DA RISPETTARE: ${personalizza}\n(ricalcola proteine e kcal dopo la modifica)` : ''}

Genera ${quante === 1 ? 'UNA sola proposta' : 'ESATTAMENTE 3 proposte diverse fra loro'}.`;

  // --- 5. la chiamata a Claude ------------------------------
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
        max_tokens: MAX_TOKENS,
        system: REGOLE,
        thinking: { type: 'adaptive' },
        output_config: {
          effort: IMPEGNO,
          format: { type: 'json_schema', schema: SCHEMA },
        },
        messages: [{ role: 'user', content: contesto }],
      }),
    });
  } catch {
    return errore('Il generatore non risponde. Riprova fra un minuto.', 502);
  }

  if (!risposta.ok) {
    const dettaglio = await risposta.text();
    console.error('Anthropic', risposta.status, dettaglio);
    if (risposta.status === 401) return errore('La chiave del generatore non è valida. Va rifatta nei Secrets di Supabase.', 500);
    if (risposta.status === 429) return errore('Il generatore è momentaneamente occupato. Riprova fra un minuto.', 503);
    if (risposta.status === 400 && /credit|balance/i.test(dettaglio))
      return errore('Il credito del generatore è esaurito. Va ricaricato dal sito di Anthropic.', 402);
    return errore('Il generatore non risponde. Riprova fra un minuto.', 502);
  }

  const dati = await risposta.json();

  if (dati.stop_reason === 'refusal') {
    return errore('Il generatore non se la sente di rispondere a questa richiesta. Prova a riformularla.', 422);
  }
  if (dati.stop_reason === 'max_tokens') {
    return errore('La risposta si è interrotta a metà. Riprova.', 502);
  }

  const testo = (dati.content ?? []).find((b: { type: string }) => b.type === 'text')?.text;
  if (!testo) return errore('Il generatore ha risposto a vuoto. Riprova.', 502);

  let proposte: unknown[];
  try {
    proposte = JSON.parse(testo).proposte;
  } catch {
    return errore('Non riesco a leggere la risposta del generatore. Riprova.', 502);
  }
  if (!Array.isArray(proposte) || !proposte.length) {
    return errore('Il generatore non ha trovato nulla da proporre con questa dispensa.', 422);
  }

  return json({ proposte: proposte.slice(0, quante) });
});
