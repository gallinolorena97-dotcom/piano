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

// Completare un piatto scritto a mano e' un compito piu' piccolo di un
// giorno intero, ma non minuscolo: bisogna leggere tutta la dispensa,
// rispettare i divieti e scrivere DUE misure dello stesso piatto. Vale la
// stessa avvertenza di sopra — e' un tetto, non una spesa.
const MAX_TOKENS_RICETTA = 16000;

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

/**
 * Continua a lavorare DOPO aver già risposto.
 *
 * `EdgeRuntime.waitUntil()` è il globale con cui il runtime di Supabase
 * tiene viva la funzione a risposta già spedita: è il pezzo su cui sta in
 * piedi la staffetta, e senza di lui il telefono dovrebbe restare in linea.
 *
 * ⚠️ Lo si prende da globalThis invece di dichiararlo: una dichiarazione
 * nostra si scontrerebbe con quella del runtime al momento del deploy.
 * Se un giorno non ci fosse, il lavoro parte lo stesso — semplicemente
 * senza garanzia di arrivare in fondo.
 */
function inSottofondo(p: Promise<unknown>): void {
  const rt = (globalThis as any).EdgeRuntime;
  if (rt && typeof rt.waitUntil === 'function') rt.waitUntil(p);
  else p.catch((e) => console.error('sottofondo', e));
}

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
  // "tabella" può già portarsi dietro un filtro (plan_jobs?id=eq.…):
  // in quel caso select si attacca con &, non con un secondo ?
  const sep = tabella.includes('?') ? '&' : '?';
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabella}${sep}select=${colonne}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!r.ok) throw new Error(`lettura ${tabella}: ${r.status}`);
  return await r.json();
}

/**
 * Scrive nel database con la chiave di servizio.
 *
 * ⚠️ La usa solo la STAFFETTA. Il resto della function legge e basta: qui
 * si scrive perché il telefono può essere spento, e qualcuno deve pur
 * mettere i pasti nel calendario.
 */
async function scrivi(metodo: string, percorso: string, corpo?: unknown, prefer = 'return=representation') {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${percorso}`, {
    method: metodo,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  if (!r.ok) throw new Error(`${metodo} ${percorso}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  const testo = await r.text();
  return testo ? JSON.parse(testo) : null;
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
  frequenze: Array<{
    categoria: string; min_sett: number | null; max_sett: number | null;
    rotazione_max: number | null; nota: string | null;
  }>;
  // l'ultimo mese di piano, per la memoria fra le settimane
  mese: Array<{ day: string; piatto: string; proteina_principale: string | null }>;
};

async function leggiContesto(): Promise<Contesto> {
  const [inv, rec, setRows] = await Promise.all([
    // ⚠️ '*' e non l'elenco: kcal_100g e prot_100g sono facoltative e su
    // un progetto in cui tabelle-nutrienti.sql non è stato eseguito non
    // esistono. Chiederle per nome romperebbe TUTTO il generatore.
    leggi('inventory_items', '*'),
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

  // La griglia delle frequenze. Se la tabella non c'è ancora si va avanti
  // senza: il piano si genera come prima, solo senza quel vincolo.
  let frequenze: Contesto['frequenze'] = [];
  try { frequenze = await leggi('frequenze_categorie', '*'); } catch { /* v8 non installata */ }

  /* L'ULTIMO MESE DI PIANO, per la memoria fra le settimane.
     ⚠️ Si legge `plan_meals` e non il diario: il piano è COMPLETO per i
     giorni che copre, il diario è sparso (solo quello che è stato
     verificato). Per «quante volte è tornato questo piatto» serve la fonte
     completa; il diario resta quello degli ultimi 5 giorni, che risponde a
     un'altra domanda — che cosa è stato mangiato DAVVERO, appena ieri. */
  let mese: Contesto['mese'] = [];
  try {
    const oggiUTC = new Date().toISOString().slice(0, 10);
    const da = new Date();
    da.setDate(da.getDate() - 30);
    mese = await leggi(
      'plan_meals',
      // ⚠️ SI CHIEDONO SOLO LE COLONNE CHE SI USANO, e `descriviMese()` usa
      // solo `day` e `piatto`. Qui c'era anche `proteina_principale`, che su
      // `plan_meals` NON ESISTE — quella colonna sta su `meals_log` e si chiama
      // `proteina`, mentre su `plan_meals` c'è `categoria_principale`. Bastava
      // quel nome di troppo perché PostgREST rispondesse 400, il `catch` qui
      // sotto ingoiasse l'errore e la memoria restasse **vuota per sempre**,
      // senza che niente lo dicesse: il generatore leggeva «0 pasti, ignora
      // questa sezione» e generava come se la memoria non esistesse.
      // ⚠️ Una colonna chiesta e non usata non è innocua: è un modo di rompersi
      // che nessun collaudo del risultato può far vedere.
      `day,piatto&modo=eq.casa&day=gte.${da.toISOString().slice(0, 10)}`
        + `&day=lt.${oggiUTC}&order=day.desc`,
    );
  } catch { /* niente storico: si genera come prima */ }

  return { inv, rec, setRows, profili, voti, recenti, frequenze, mese };
}

/**
 * La griglia raccontata al modello. ⚠️ Le categorie senza nessun numero
 * NON si scrivono: una riga «frutta: nessun vincolo» occupa spazio nel
 * prompt e non dice niente, e un elenco pieno di righe vuote fa passare
 * per meno importanti quelle che contano.
 */
function descriviFrequenze(f: Contesto['frequenze']): string {
  const righe = (f || [])
    .filter((x) => x.min_sett != null || x.max_sett != null || x.rotazione_max != null)
    .map((x) => {
      const pezzi: string[] = [];
      if (x.min_sett != null) pezzi.push(`almeno ${x.min_sett}`);
      if (x.max_sett != null) pezzi.push(`al massimo ${x.max_sett}`);
      if (x.rotazione_max != null)
        pezzi.push(`lo stesso tipo al massimo ${x.rotazione_max} volte`);
      return `- ${x.categoria}: ${pezzi.join(', ')} a settimana${x.nota ? ` — ${x.nota}` : ''}`;
    });
  return righe.length ? righe.join('\n') : '(nessuna frequenza impostata)';
}

/** La dispensa raccontata per categorie, come la vede il modello. */
function descriviDispensa(inv: Contesto['inv']): string {
  // ⚠️ I valori per 100 g esistono solo dove qualcuno li ha scritti a mano:
  // sono facoltativi apposta, e la regola «niente database alimenti» resta.
  // Dove ci sono, però, il modello NON deve stimare: ha il numero vero.
  const nutrienti = (i: any) => {
    const p = i.prot_100g, k = i.kcal_100g;
    if (p == null && k == null) return '';
    const pezzi = [p != null ? `${p} g proteine` : '', k != null ? `${k} kcal` : '']
      .filter(Boolean).join(' · ');
    return `  [per 100 g: ${pezzi} — DICHIARATI, usali e non stimare]`;
  };
  const perCat = (c: string) => {
    const righe = inv.filter((i) => i.cat === c);
    return righe.length
      ? righe.map((i) => `- ${i.name} — ${i.qty}${nutrienti(i)}`).join('\n')
      : '- (vuoto)';
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

/**
 * L'ULTIMO MESE: quante volte è tornato un piatto, e che cosa non torna.
 *
 * ⚠️ Non è l'elenco dei pasti: è il CONTEGGIO. Dare al modello trenta giorni
 * di righe vorrebbe dire trenta giorni di token a ogni chiamata — e per
 * sette chiamate a settimana — per fargli fare a mente un conto che qui si
 * fa in tre righe. Il conto lo facciamo noi, e gli diamo il risultato.
 *
 * ⚠️ SI DICHIARA QUANTA STORIA C'È. Con cinque giorni di dati «non compare
 * da un po'» non vuol dire niente, e un modello che legge quella riga la usa
 * lo stesso: se la storia è corta glielo si dice, e la regola si spegne da
 * sé invece di produrre scelte fondate sul nulla.
 */
function descriviMese(c: Contesto): string {
  const righe = c.mese || [];
  if (righe.length < 8)
    return `- (storia troppo corta: solo ${righe.length} pasti registrati nell'ultimo mese, `
         + `non basta per dire che cosa si ripete o che cosa manca — ignora questa sezione)`;

  const chiave = (s: string) => s.toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

  const visti = new Map<string, { nome: string; volte: number; ultimo: string }>();
  for (const r of righe) {
    const n = String(r.piatto || '').trim();
    if (!n) continue;
    const k = chiave(n);
    const v = visti.get(k) || { nome: n, volte: 0, ultimo: '' };
    v.volte++;
    if (r.day > v.ultimo) v.ultimo = r.day;
    visti.set(k, v);
  }
  const tutti = [...visti.values()];
  const oggi = new Date().toISOString().slice(0, 10);
  const giorniDa = (d: string) =>
    Math.round((Date.parse(oggi) - Date.parse(d)) / 86400000);

  const ripetuti = tutti.filter((v) => v.volte > 1).sort((a, b) => b.volte - a.volte).slice(0, 12);
  const fermi = tutti.filter((v) => giorniDa(v.ultimo) >= 14)
    .sort((a, b) => giorniDa(b.ultimo) - giorniDa(a.ultimo)).slice(0, 12);

  return [
    `- storia disponibile: ${righe.length} pasti nell'ultimo mese`,
    ripetuti.length
      ? `- già tornati: ${ripetuti.map((v) => `${v.nome} (${v.volte}×)`).join(' · ')}`
      : `- nessun piatto è tornato più di una volta`,
    fermi.length
      ? `- non compaiono da almeno due settimane: ${fermi.map((v) => `${v.nome} (${giorniDa(v.ultimo)} giorni)`).join(' · ')}`
      : `- niente che manchi da più di due settimane`,
  ].join('\n');
}

// ------------------------------------------------------------
//  IL METODO — questo è il cuore del generatore
// ------------------------------------------------------------
// ------------------------------------------------------------
//  I CONDIMENTI
//  ⚠️ Scritta UNA volta sola e usata da tutti e tre i mestieri (proposte
//  del giorno, settimana, «Crea la ricetta»). Se la regola cambia, cambia
//  in un posto: due copie si scollano alla prima modifica, ed è già
//  successo con altre regole di questo file.
// ------------------------------------------------------------
/* La memoria fra le settimane, scritta UNA volta sola e interpolata dove
   serve — come CONDIMENTI. ⚠️ Due copie si scollerebbero alla prima
   modifica: è già successo in questo file. */
const MEMORIA = `Nella sezione «L'ULTIMO MESE» c'è quello che è già passato in tavola.
Usalo così, e in quest'ordine:

- **quello che non compare da due settimane o più, preferiscilo** — a parità di tutto il
  resto. È il modo di far tornare le cose cadute dal giro senza che nessuno se ne accorga.
- **quello che è già tornato tre volte o più nel mese, evitalo**, a meno che non sia
  l'avanzo previsto dal giorno prima: quello non è una ripetizione, è la catena.

⚠️ QUESTA REGOLA VIENE PER ULTIMA. Non tocca le proteine, non tocca i divieti, non tocca
la griglia delle frequenze e non tocca la fattibilità: se per ripescare un piatto
dimenticato dovresti sforare un massimo o comprare qualcosa, lascia perdere e scegli
quello che si può fare. È una preferenza fra pari, non un vincolo.

⚠️ E SE LA STORIA È CORTA, IGNORALA. Quando la sezione dice che i pasti registrati sono
pochi, quei conteggi non vogliono dire niente: due comparse su cinque giorni non sono una
ripetizione. Meglio nessuna preferenza che una preferenza costruita sul nulla.`;

const CONDIMENTI = `Un piatto non si cucina a secco, e le calorie del condimento sono
calorie vere: un piano che le dimentica racconta una giornata più leggera di quella che
è stata davvero.

- I condimenti che PESANO vanno scritti FRA GLI INGREDIENTI, coi grammi, esattamente
  come gli altri: olio, burro, panna, formaggio grattugiato, maionese, pesto, salse.
  ⚠️ Per queste cose non scrivere mai "q.b.": nei conti "q.b." vale zero.
- Riferimenti da usare quando non hai di meglio:
  · verdure o contorno saltati, al forno, in padella -> mezzo cucchiaio d'olio, ~6 g
  · carne o pesce da rosolare -> un cucchiaio d'olio, ~12 g
  · insalata condita a crudo -> mezzo cucchiaio d'olio, ~6 g
  · un filo per ungere una teglia -> ~5 g
  Sono riferimenti, non un tetto: se il piatto ne chiede di più, scrivi quanto ne serve.
- I condimenti che NON pesano restano "q.b." e non entrano nei conti: sale, pepe,
  aceto, limone spremuto, erbe, spezie, aglio.
- I numeri di proteine e kcal COMPRENDONO questi grammi. Un olio scritto fra gli
  ingredienti e non contato nelle kcal è peggio che non averlo scritto: fa sembrare
  fatto un lavoro che non è stato fatto.
- ⚠️ I condimenti di base si danno per PRESENTI in casa: olio, sale, pepe, aceto.
  Non metterli mai in "manca" e non farli pesare sul limite delle cose che mancano.`;

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
- ⚠️ QUANDO IN DISPENSA UNA VOCE PORTA I VALORI PER 100 g, quelli sono la
  verità: usali e non stimare. Li ha scritti chi ha in mano la confezione,
  e sono piu' giusti di qualunque tua media. Dove non ci sono, stima come
  hai sempre fatto — ma allora e' una stima, e i numeri valgono per quello
  che sono.

## 2. CALORIE
Circa 2200 kcal al giorno. Un pasto principale sta fra 600 e 900 kcal.
Non sacrificare mai le proteine per stare sotto: semmai riduci i carboidrati.

## 2 bis. I CONDIMENTI E I GRASSI DI COTTURA
${CONDIMENTI}

## 2 ter. LA MEMORIA FRA LE SETTIMANE
${MEMORIA}

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
- ⚠️ Queste sono MEDIE. Quando in dispensa una voce porta i valori per 100 g, quelli
  sono la verità: usali al posto delle medie e non stimare. Li ha scritti chi aveva in
  mano la confezione.
- Nei giorni in cui Ciprian mangia fuori o ha un pasto libero il totale scende, ed è
  giusto così: NON compensare mai nei giorni vicini caricando di proteine gli altri
  pasti. Un pasto libero fa parte del metodo, non è uno sgarro da recuperare.
- I campi "prot" e "kcal" sono SOLO di Ciprian. Nei pasti che mangia solo l'altra
  persona scrivi 0 in tutti e due: l'app non mostrerà nessun numero.
- ⚠️ "kcal_lorena" sono invece le calorie della porzione di LORENA in quel pasto, e
  vanno scritte in TUTTI i pasti che mangia lei — quelli condivisi e i suoi. Nei pasti
  di solo Ciprian scrivi 0.
  Non è "kcal" copiato: è un piatto di dimensione diversa. Se lui ha 150 g di pollo e
  lei 100, le calorie non sono le stesse, e nei pasti condivisi la sua porzione è quasi
  sempre più piccola. Le aggiunte proteiche a lato di Ciprian (gli ingredienti con
  "per": "ciprian") NON entrano in questo numero.
  ⚠️ LORENA NON HA UN OBIETTIVO e non deve averne uno: il numero si scrive perché lo si
  vuole vedere, non per stare sotto una soglia. Non scrivere mai commenti sul suo
  totale, non proporle porzioni più piccole per far tornare un conto, non trattare le
  sue calorie come un vincolo. Le uniche cose che comandano sul suo piatto restano i
  suoi divieti e i suoi gusti.

## 4 bis. I CONDIMENTI E I GRASSI DI COTTURA
${CONDIMENTI}

## 4 quinquies. LA MEMORIA FRA LE SETTIMANE
${MEMORIA}

## 4 ter. LE FREQUENZE DELLA SETTIMANA — la griglia della nutrizionista
La griglia vera ti arriva più sotto, sotto "FREQUENZE DA RISPETTARE". Qui c'è COME si
conta, che senza queste regole la griglia produce assurdità.

⚠️ SI CONTANO SOLO I PASTI CONTEGGIABILI, e sono meno di quelli della settimana:
1. **Solo i pasti condivisi e quelli di Lorena.** I pasti di SOLO CIPRIAN non contano
   mai. E dentro un pasto condiviso, un ingrediente scritto con "per": "ciprian" — le
   sue aggiunte proteiche a lato — NON conta: se lui mette 3 uova sode accanto a una
   cena di gnocchi, le uova della griglia restano a zero. Altrimenti le sue proteine
   bruciano i minimi e i massimi di lei, che è il contrario di quello che serve.
2. **I pasti liberi e quelli fuori casa restano fuori dal conteggio.** La pizza non
   consuma il massimo dei formaggi: sta fuori dalla griglia come sta fuori dal metodo.
3. **Un avanzo conta come pasto suo.** Merluzzo a cena e il suo avanzo a pranzo il
   giorno dopo fanno DUE pesci, se li mangia lei tutte e due le volte.
4. **"categoria_principale" è il campo con cui si conta**, e va scritto su ogni pasto:
   è la categoria di cui il pasto è fatto, quella del piatto — non un ingrediente di
   contorno. Un pasto conta UNA VOLTA SOLA, per la sua categoria principale.
   L'unica eccezione è la verdura, che si conta come PRESENZA e A GIORNI: basta che ci
   sia fra gli ingredienti, non deve essere il piatto, e il suo minimo è un numero di
   GIORNI con verdura, non di pasti. Due pasti con verdura nello stesso giorno fanno
   un giorno solo.
5. **SETTIMANE CORTE: non si forza e non si tace.** I minimi sommati chiedono più pasti
   di quanti a volte ce ne siano (fra fuori, liberi e pasti di solo Ciprian i
   conteggiabili possono essere 6 invece di 8). In quel caso NON stravolgere la
   settimana per farceli stare: rispetta questa PRIORITÀ, in quest'ordine —
   **pesce → legumi → carne bianca → uova** — e lascia scoperti gli ultimi.
   ⚠️ E DILLO: nel campo "perche" del primo pasto del giorno in cui te ne accorgi
   scrivi in una riga quali minimi non si raggiungono. Un minimo mancato dichiarato è
   un fatto; un minimo mancato in silenzio è un errore che scopre qualcun altro.
   ⚠️ I MASSIMI invece valgono SEMPRE: con meno pasti sono solo più facili da
   rispettare, non diventano elastici.

## 4 quater. LA ROTAZIONE DEI FORMATI — non basta cambiare ingrediente
Tre risotti in una settimana sono tre piatti diversi sulla carta e la stessa cena nel
piatto. Oltre alla varietà delle proteine, che è la regola 6, vale la varietà della
FORMA: risotto, zuppa, polpette, insalatona, pasta asciutta, al forno, in padella,
panino, torta salata, spiedini.
- Lo stesso formato **al massimo 2 volte** nella settimana.
- ⚠️ Una catena di avanzi conta come UNA scelta sola: la cena e il pranzo del giorno
  dopo che se ne nutre sono lo stesso piatto, non due volte quel formato.
- Vale anche qui il conteggio della regola 4 ter: si guardano i pasti conteggiabili.

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
- "categoria_principale": la CATEGORIA di cui il pasto è fatto, presa ESATTAMENTE da
  questo elenco e da nessun altro — pesce · carne bianca · carne rossa · salumi · uova ·
  formaggi · latticini freschi · legumi · cereali e carboidrati · verdura · frutta ·
  frutta secca e semi · condimenti e grassi · dolci · altro.
  ⚠️ "formaggi" e "latticini freschi" sono due categorie DIVERSE: i formaggi sono un
  piatto e hanno un tetto settimanale, yogurt kefir e latte no. Burro e panna non
  stanno né di qua né di là: sono "condimenti e grassi".
  ⚠️ Non è "proteina_principale" scritta diversa: quella dice l'alimento («pollo»),
  questa dice la categoria («carne bianca»). È il campo con cui si contano le
  frequenze, e una parola fuori elenco non viene contata da nessuna parte.
  Se il pasto è fuori casa o libero, stringa vuota.
- "formato": la FORMA del piatto in una o due parole minuscole — risotto, zuppa,
  polpette, insalatona, pasta asciutta, al forno, in padella, panino, torta salata,
  spiedini. Serve alla rotazione dei formati (regola 4 quater).
- "procedimento": i passi per farlo, uno per riga, nell'ordine in cui si fanno.
  ⚠️ LA LUNGHEZZA LA DECIDE IL PIATTO, NON TU. Se è banale bastano DUE O TRE righe
  ("Scalda la piastra. Cuoci il petto 4 minuti per lato. Insalata a parte."): un
  procedimento lungo per una cosa ovvia non lo legge nessuno, e chi lo salta si abitua
  a saltarli tutti. Se è un piatto vero, arriva anche a otto passi, ma non oltre.
  ⚠️ TEMPI VERI DENTRO I PASSI, non alla fine: "rosola 5 minuti", "in forno 25 minuti
  a 200°". Chi cucina ha le mani sporche e legge una riga per volta.
  Niente passi vuoti tipo "prepara gli ingredienti".
- "sostituzioni": ⚠️ NON sono la stessa cosa di "manca", sono il contrario.
  "manca" vuol dire: vai a comprarlo. Una sostituzione vuol dire: non serve che tu vada
  da nessuna parte, usa quest'altra cosa che c'è già in dispensa.
  Quando un ingrediente NON ESSENZIALE non c'è, prima di metterlo in "manca" guarda se
  in dispensa c'è qualcosa che fa lo stesso mestiere: prezzemolo→basilico,
  scalogno→cipolla, panna→ricotta, aceto di mele→aceto di vino. Se c'è, usalo negli
  ingredienti e scrivi la sostituzione, e NON metterlo in "manca".
  ⚠️ MAI SULLA FONTE PROTEICA. Il pollo non si sostituisce col tonno "perché tanto sono
  proteine": quello cambia il piatto, e le proteine sono il vincolo che comanda su
  tutto. Le sostituzioni valgono per erbe, aromi, contorni, latticini di rifinitura.
  "uso" deve essere una cosa che c'è DAVVERO in dispensa, scritta col nome della
  dispensa. Se non c'è niente che vada bene, lista vuota e l'ingrediente va in "manca".
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

// Un passo del procedimento: una frase sola, con i tempi veri dentro.
const PASSO = { type: 'string' };

// Una sostituzione: non e' una mancanza, e' il contrario di una mancanza.
const SOSTITUZIONE = {
  type: 'object',
  properties: {
    invece_di: { type: 'string' },
    uso:       { type: 'string' },   // deve esserci DAVVERO in dispensa
    perche:    { type: 'string' },
  },
  required: ['invece_di', 'uso', 'perche'],
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
          // le kcal della porzione di LORENA in questo pasto: numero diverso,
          // perche' e' un piatto di dimensione diversa. 0 se lei non mangia.
          kcal_lorena:         { type: 'integer' },
          scongelamento:       { type: 'string' },
          scongelare_il:       { type: 'string' },   // AAAA-MM-GG, di solito il giorno prima
          avanzo_per:          { type: 'string' },
          manca:               { type: 'array', items: { type: 'string' } },
          procedimento:        { type: 'array', items: PASSO },
          sostituzioni:        { type: 'array', items: SOSTITUZIONE },
          proteina_principale: { type: 'string' },
          // ⚠️ La CATEGORIA di cui il pasto è fatto, non l'alimento: è il
          // campo con cui si contano le frequenze della settimana.
          // "proteina_principale" dice «pollo», questo dice «carne bianca».
          categoria_principale: { type: 'string' },
          // il formato del piatto, per la rotazione delle forme
          formato:             { type: 'string' },
        },
        required: ['day','pasto','piatto','perche','ingredienti','dolce','tempo','prot','kcal',
                   'scongelamento','scongelare_il','avanzo_per','manca','procedimento',
                   'sostituzioni','proteina_principale','categoria_principale','formato','kcal_lorena'],
        additionalProperties: false,
      },
    },
    // cosa rimarrà in dispensa dopo questi giorni: entra nel prompt del blocco dopo
    resta: { type: 'string' },
  },
  required: ['pasti', 'resta'],
  additionalProperties: false,
};

// ============================================================
//  IL TERZO MESTIERE — COMPLETARE UN PIATTO SCRITTO A MANO
//
//  Chi scrive un pasto a mano scrive un nome («polpette al sugo») e
//  quasi mai i grammi e i numeri. Ma un pasto senza numeri buca i totali
//  della giornata di Ciprian in DUE posti — il TOT del piano e «finora
//  oggi» del diario — e li buca in silenzio se uno dei due numeri c'è e
//  l'altro no.
//
//  Qui il piatto viene completato una volta sola, e ne escono DUE cose
//  che vanno tenute distinte perché servono a scopi diversi:
//
//    la RICETTA  → sempre per UNA persona. È la cosa che resta e che si
//                  riusa. Va nel ricettario.
//    il PASTO    → dimensionato su chi mangia DAVVERO quel giorno.
//                  Va nel calendario.
//
//  ⚠️ Le due misure le decide il modello, non l'app: l'app non
//  moltiplica mai una quantità per due. Raddoppiare «1 cucchiaio di
//  olio» o «mezza cipolla» dà risultati sbagliati, e la regola di questa
//  casa è che si calcola solo quando il calcolo è sicuro.
// ============================================================
const REGOLE_RICETTA = `Sei l'aiuto cucina di una casa in cui vivono due persone diverse.

Qualcuno ha scritto a mano che cosa si mangia — di solito solo il nome del piatto —
e il tuo compito è COMPLETARLO. Non devi proporre un piatto tuo: il piatto è già
deciso, tu lo scrivi per intero.

## COSA DEVI PRODURRE — due misure dello stesso piatto

1. LA RICETTA, sempre e solo **per UNA persona**. È quella che resta nel ricettario e
   verrà riusata altre volte, magari per un numero diverso di persone. Le quantità qui
   sono la porzione di una persona sola, sempre, anche se oggi mangiano in due.
2. IL PASTO DI OGGI, dimensionato su **chi mangia davvero** (te lo dico più sotto). Se
   mangiano in due, le quantità sono per due. Se mangia Ciprian da solo, sono la sua
   porzione, che è abbondante.

Non fare la seconda moltiplicando la prima e basta: certe cose raddoppiano (la pasta,
la carne), altre no (un cucchiaio di olio, mezza cipolla, il sale).

## LE REGOLE CHE NON SI TOCCANO

1. **I NOMI DEGLI INGREDIENTI SI COPIANO DALLA DISPENSA, LETTERA PER LETTERA.**
   Se in dispensa c'è «Uova», scrivi «Uova» e non «uovo»; se c'è «Panini burger»,
   scrivi «Panini burger» e non «panino per burger». Niente sinonimi, niente singolari
   al posto dei plurali, niente aggettivi in più. È da questi nomi che l'app scala le
   scorte e capisce se manca qualcosa: se li cambi, scala la cosa sbagliata o niente.
   Vale per la ricetta e per il pasto.
   Solo le cose che in dispensa NON ci sono le scrivi come vuoi, in modo riconoscibile
   al supermercato, e le elenchi anche in "manca".

2. **I DIVIETI DELLE PERSONE NON SI NEGOZIANO.** Te li trovi scritti più sotto, persona
   per persona. Un divieto SENZA precisazioni vieta tutta la famiglia dell'alimento in
   ogni forma; un divieto CON una precisazione (per esempio «pomodoro crudo») vieta
   tutta la famiglia — pomodoro, pomodorini, datterini, passata, pelati — **in quella
   forma lì**, e lascia libere le altre forme. Quando entra in un pasto la forma
   consentita, il piatto o gli ingredienti DEVONO dirlo: «datterini saltati in
   padella», non «datterini».
   Se il piatto scritto a mano contiene qualcosa di vietato per chi lo mangia, NON
   cambiare il piatto: scrivilo lo stesso e dillo in "nota".

3. **LE PROTEINE SONO DI CIPRIAN, LE CALORIE DI TUTTI E DUE.** "pasto_prot" e
   "pasto_kcal" sono la porzione di Ciprian in questo pasto: se Ciprian in questo pasto
   non mangia, valgono 0 tutti e due. "pasto_kcal_lorena" sono le calorie della porzione
   di LORENA nello stesso pasto, e vale 0 solo se lei non mangia.
   ⚠️ Non è "pasto_kcal" copiato: è un piatto di dimensione diversa, e le aggiunte a
   lato di Ciprian (ingredienti con "per": "ciprian") non entrano nel suo numero.
   ⚠️ LORENA NON HA UN OBIETTIVO: quel numero si scrive perché lo si vuole vedere, non
   per stare sotto una soglia. Niente commenti sul suo totale, nessuna porzione ridotta
   per far tornare un conto.
   "ricetta_prot" e "ricetta_kcal" sono invece la porzione di UNA persona, sempre.
   Stimali con onestà: meglio un numero ragionevole che nessun numero, perché senza
   numeri il totale della giornata si dichiara parziale e non serve più a niente.
   ⚠️ Se in dispensa una voce porta i valori per 100 g, quelli sono la verità: usali e
   non stimare. Li ha scritti chi aveva in mano la confezione.

4. **UN PIATTO SOLO QUANDO MANGIANO INSIEME.** Se a tavola ci sono tutti e due, il
   piatto è uno. Le differenze ammesse sono varianti dello stesso piatto: grammature
   diverse, e un'aggiunta proteica a lato per Ciprian se il piatto base non basta al
   suo obiettivo (uova, skyr, grana, tonno) — che scrivi negli ingredienti del pasto
   con "per": "ciprian". Il tocco dolce di Lorena ha il campo "dolce" suo.

5. **NON RIBATTEZZARE IL PIATTO.** Il nome che ti arriva l'ha scelto una persona. In
   "piatto" riscrivilo pulito (maiuscola iniziale, senza errori evidenti) ma **non
   cambiarlo**: «polpette» resta «Polpette», non diventa «Polpette di manzo al sugo
   con purè». Se aggiungi un contorno, quello sta negli ingredienti.

6. **SE LA RICETTA ESISTE GIÀ, È QUELLA.** Quando ti passo una ricetta già scritta,
   quella è la verità: riusala com'è per "ricetta_ingredienti", "ricetta_prot" e
   "ricetta_kcal", e limitati a dimensionare il pasto di oggi. Non riscriverla a modo
   tuo — qualcuno l'aveva già approvata.

7. **"manca"**: solo le cose che servono e che in dispensa non ci sono. Se non manca
   niente, lista vuota. Non inventare mancanze per prudenza.

8. **"procedimento"**: i passi per farlo, uno per riga, nell.ordine in cui si fanno, e
   PER UNA PERSONA come il resto della ricetta (i tempi non cambiano se le porzioni
   raddoppiano). ⚠️ La lunghezza la decide il piatto: se è banale bastano DUE O TRE
   righe — un procedimento lungo per una cosa ovvia non lo legge nessuno, e chi lo
   salta si abitua a saltarli tutti. ⚠️ I tempi veri stanno DENTRO i passi («rosola 5
   minuti», «in forno 25 minuti a 200°»), non alla fine: chi cucina ha le mani sporche
   e legge una riga per volta. Niente passi vuoti tipo «prepara gli ingredienti».

9. **"sostituzioni"**: ⚠️ NON sono la stessa cosa di "manca", sono il contrario.
   "manca" vuol dire vai a comprarlo; una sostituzione vuol dire non serve che tu vada
   da nessuna parte, usa quest.altra cosa che hai già.
   Quando un ingrediente NON ESSENZIALE non c.è, prima di metterlo in "manca" guarda se
   in dispensa c.è qualcosa che fa lo stesso mestiere (prezzemolo→basilico,
   scalogno→cipolla, panna→ricotta). Se c.è, usalo e scrivi la sostituzione, e NON
   metterlo in "manca".
   ⚠️ MAI SULLA FONTE PROTEICA: il pollo non si sostituisce col tonno «perché tanto
   sono proteine». Vale per erbe, aromi, contorni, latticini di rifinitura.
   "uso" deve esserci DAVVERO in dispensa, col nome della dispensa.

10. **I CONDIMENTI E I GRASSI DI COTTURA ESISTONO.**
${CONDIMENTI}
   Vale sia per "ricetta_ingredienti" sia per "pasto_ingredienti", e i quattro numeri
   ("ricetta_prot", "ricetta_kcal", "pasto_prot", "pasto_kcal") li comprendono.

Campi che non servono: stringa vuota "" per i testi, 0 per i numeri, [] per le liste.
Scrivi in italiano semplice e concreto. Niente tono da dieta, niente premi, niente colpe.`;

const INGREDIENTE_RICETTA = {
  type: 'object',
  properties: {
    nome: { type: 'string' },
    qta:  { type: 'string' },
  },
  required: ['nome', 'qta'],
  additionalProperties: false,
};

const SCHEMA_RICETTA = {
  type: 'object',
  properties: {
    piatto:              { type: 'string' },
    // la ricetta: SEMPRE per una persona sola
    ricetta_ingredienti: { type: 'array', items: INGREDIENTE_RICETTA },
    ricetta_prot:        { type: 'integer' },
    ricetta_kcal:        { type: 'integer' },
    // il pasto di oggi: dimensionato su chi mangia davvero
    pasto_ingredienti:   { type: 'array', items: INGREDIENTE_PIANO },
    pasto_prot:          { type: 'integer' },   // solo Ciprian, 0 se non lo riguarda
    pasto_kcal:          { type: 'integer' },   // idem
    pasto_kcal_lorena:   { type: 'integer' },   // la porzione di Lorena, 0 se non mangia
    dolce:               { type: 'string' },
    nota:                { type: 'string' },
    tempo:               { type: 'integer' },
    manca:               { type: 'array', items: { type: 'string' } },
    // il procedimento e' per UNA persona come il resto della ricetta:
    // i tempi non cambiano se le porzioni raddoppiano
    procedimento:        { type: 'array', items: PASSO },
    sostituzioni:        { type: 'array', items: SOSTITUZIONE },
    proteina_principale: { type: 'string' },
  },
  required: ['piatto','ricetta_ingredienti','ricetta_prot','ricetta_kcal',
             'pasto_ingredienti','pasto_prot','pasto_kcal','pasto_kcal_lorena','dolce','nota','tempo',
             'manca','procedimento','sostituzioni','proteina_principale'],
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

  // ⚠️ I token si contano QUI, in un punto solo, perché di qui passa ogni
  // chiamata al modello di tutti e tre i mestieri. Contarli dentro i
  // singoli mestieri vorrebbe dire dimenticarsene al quarto.
  //
  // Come arrivano, e non è ovvio:
  //   message_start → input_tokens, che è già il totale definitivo;
  //   message_delta → output_tokens, che è il totale CUMULATIVO fin qui.
  // Quindi l'uscita si SOSTITUISCE a ogni delta, non si somma: sommarla
  // gonfierebbe la stima di parecchie volte.
  let entrata = 0, uscita = 0;

  try {
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

        if (ev.type === 'message_start' && ev.message?.usage) {
          entrata = Number(ev.message.usage.input_tokens) || 0;
        } else if (ev.type === 'message_delta' && ev.usage?.output_tokens != null) {
          uscita = Number(ev.usage.output_tokens) || 0;
        }

        if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
          yield { testo: String(ev.delta.text ?? '') };
        } else if (ev.type === 'message_delta' && ev.delta?.stop_reason) {
          yield { stop: String(ev.delta.stop_reason) };
        } else if (ev.type === 'error') {
          yield { guasto: true };
        }
      }
    }
  } finally {
    // Nel `finally` apposta: vale anche se chi legge smette a metà o se il
    // flusso si rompe. Quello che è stato speso è stato speso lo stesso, e
    // una spesa che non si registra è peggio di una registrata male.
    if (entrata || uscita) inSottofondo(registraToken(entrata, uscita));
  }
}

/** Scrive i token del giorno. ⚠️ Non deve MAI far fallire una generazione:
    la contabilità è accessoria, il piatto no. */
async function registraToken(entrata: number, uscita: number) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/registra_token`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entrata, uscita }),
    });
  } catch (e) {
    console.error('registraToken', e);
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

/** I giorni chiesti, ripuliti: al massimo 3 giorni e 2 pasti per giorno. */
function ripulisciGiorni(grezzi: unknown): GiornoChiesto[] {
  return (Array.isArray(grezzi) ? grezzi : [])
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
}

type PezziContesto = {
  giorni: GiornoChiesto[];
  giaFatti: string[];
  restaPrima: string;
  fuoriELiberi: string[];
  settimana: string[];
  ioSlug: string;
  // ⚠️ Lo svuota-frigo NON è una modalità diversa del generatore: è una
  // priorità in più, che si infila davanti alla varietà e ai gusti ma
  // resta DIETRO alle proteine e ai divieti. Vedi la sezione nel prompt.
  svuotaFrigo?: boolean;
};

/**
 * Il contesto del piano settimanale: dispensa, persone, voti, storia,
 * la settimana intera e i pasti da scrivere adesso.
 *
 * ⚠️ Scritto UNA VOLTA SOLA e usato da tutti e due i modi: quello vecchio
 * (il telefono guida, `modo:'settimana'`) e la STAFFETTA (il server guida,
 * `modo:'settimana-avvia'`). Se il metodo cambia, cambia per tutti e due:
 * due copie di questo testo si sarebbero scollate alla prima modifica.
 */
function costruisciContestoSettimana(c: Contesto, p: PezziContesto): string {
  const impostazioni = Object.fromEntries(c.setRows.map((s) => [s.key, s.value]));
  const quantiPasti = p.giorni.reduce((n, g) => n + g.pasti.length, 0);

  return `${p.svuotaFrigo ? `## ⚠️ SVUOTA-FRIGO — questa volta comanda questo

Chi ha chiesto questo piano sta per partire, o sta per fare una spesa grossa, e vuole
finire quello che ha. Quindi:

1. **Massimizza il consumo di quello che si deteriora prima**: prima il fresco del
   frigo, poi quello che ha una scadenza vicina o un «?» sospetto, poi la dispensa.
   Una cosa che si butta è peggio di un piatto poco entusiasmante.
2. **Compra il meno possibile**: "manca" dovrebbe essere vuoto o quasi. Se serve
   qualcosa che non c'è, prima cerca una sostituzione fra quello che c'è.
3. **La varietà passa in secondo piano**: ripetere un ingrediente due giorni di fila
   qui va bene, se serve a finirlo. I DIVIETI delle persone invece restano intoccabili,
   e non si negoziano nemmeno adesso.
4. ⚠️ **IL MINIMO PROTEICO DI CIPRIAN RESTA**: 55 g nei suoi pasti principali, come
   sempre. Svuotare il frigo non è una scusa per dargli un piatto di verdure. Se per
   arrivarci serve comprare una fonte proteica, mettila in "manca": è l'unica cosa per
   cui vale la pena andare a fare la spesa.

` : ''}## DISPENSA DI ADESSO

${descriviDispensa(c.inv)}
${p.restaPrima ? `\n⚠️ ATTENZIONE: i giorni precedenti del piano hanno già consumato una parte di questa dispensa.\nDopo quei giorni resta questo:\n${p.restaPrima}\nParti da QUI, non dalla dispensa piena.` : ''}

## LE PERSONE
${c.profili.length ? c.profili.map((x) => descriviProfilo(x, p.ioSlug)).join('\n\n') : '- (profili non configurati: considera una sola persona con gli obiettivi qui sotto)'}

Nel piano le persone si chiamano con questi nomi: "ciprian" è chi ha l'obiettivo
proteico, "lorena" è l'altra, "entrambi" quando mangiano insieme.

## RICETTE GIÀ VOTATE — i voti sono PER PERSONA
${descriviVoti(c)}

## MANGIATO NEGLI ULTIMI GIORNI (per la regola della varietà)
${descriviRecenti(c)}

## L'ULTIMO MESE (memoria fra le settimane)
${descriviMese(c)}

## FREQUENZE DA RISPETTARE — la griglia della nutrizionista
Come si contano sta nella regola 4 ter, e senza quelle regole questa griglia produce
assurdità: si contano solo i pasti condivisi e quelli di Lorena, mai quelli di solo
Ciprian né le sue aggiunte a lato, e restano fuori i liberi e i pasti fuori casa.
${descriviFrequenze(c.frequenze)}

## OBIETTIVI DI RIFERIMENTO
${impostazioni.kcal_target ?? 2200} kcal · ${impostazioni.protein_target ?? 170} g di proteine al giorno, per chi ce li ha.

${p.giaFatti.length ? `## PASTI GIÀ DECISI NEI GIORNI PRECEDENTI DI QUESTO PIANO
Questa roba è già spesa e questi piatti sono già stati usati: non ripeterli se il
profilo di chi mangia chiede varietà, e non riusare gli ingredienti che hanno consumato.
${p.giaFatti.map((x) => `- ${x}`).join('\n')}
` : ''}
${p.settimana.length ? `## LA SETTIMANA INTERA — serve a guardare avanti
Questi sono TUTTI i pasti della settimana, compresi quelli che NON stai scrivendo
adesso: dove si mangia e chi c'è. Guardali prima di decidere le porzioni doppie —
una cena cucina doppio solo se sa chi ci sarà domani a pranzo — e prima di scegliere
la fonte proteica, per non ripetere quella di ieri o di domani.
Scrivi SOLO i pasti che ti vengono chiesti più sotto: gli altri sono contorno.
${p.settimana.map((x) => `- ${x}`).join('\n')}
` : (p.fuoriELiberi.length ? `## GIORNI IN CUI NON SI CUCINA (già segnati, non produrli)
${p.fuoriELiberi.map((x) => `- ${x}`).join('\n')}
` : '')}
## I PASTI DA SCRIVERE ADESSO — esattamente ${quantiPasti}, né uno di più né uno di meno

${p.giorni.map((g) => `### ${g.day}
${g.pasti.map((x) => `- ${x.pasto} — mangia: ${x.chi}${x.nota ? ` — nota di chi ha compilato: "${x.nota}"` : ''}`).join('\n')}`).join('\n\n')}

Scrivi i pasti in ordine di giorno e, dentro il giorno, prima il pranzo e poi la cena.
Alla fine compila "resta" con quello che rimarrà in dispensa dopo questi giorni.`;
}

async function pianificaSettimana(body: Record<string, unknown>): Promise<Response> {
  const ioSlug = String(body.io_slug ?? 'lorena').slice(0, 40);
  const primo   = body.primo === true;
  const restanti = Math.min(BLOCCHI_SETTIMANA, Math.max(1, Number(body.restanti) || 1));

  const giorni = ripulisciGiorni(body.giorni);

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

  const quantiPasti = giorni.reduce((n, g) => n + g.pasti.length, 0);
  const contesto = costruisciContestoSettimana(c, {
    giorni, giaFatti, restaPrima, fuoriELiberi, settimana, ioSlug,
    svuotaFrigo: body.svuota_frigo === true,
  });

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

// ============================================================
//  LA STAFFETTA — la settimana si genera da sola, sul server
//  ============================================================
//
//  Il telefono dice "fai questa settimana" e se ne va. Da lì in poi:
//
//    avvia  →  scrive i giorni in cui non si cucina, crea la riga di
//              lavoro, RISPONDE SUBITO, e in sottofondo parte il primo passo
//    passo  →  genera UN giorno, lo scrive nel calendario, aggiorna la riga
//              di lavoro, sveglia il passo dopo e si spegne
//
//  ⚠️ Perché a staffetta e non tutto in un lavoro solo in sottofondo:
//  Supabase spegne una funzione dopo 150 secondi sul piano gratuito, e
//  lo stesso tetto vale per i lavori in sottofondo (EdgeRuntime.waitUntil).
//  Un giorno costa 86 secondi misurati: ci sta. Una settimana intera, no.
//  Ogni anello riparte con il suo budget pieno.
//
//  ⚠️ Nessun anello si fida del precedente: rilegge la riga di lavoro dal
//  database. Se un anello muore, la catena si ferma e la riga resta con
//  "aggiornato_il" vecchio — l'app se ne accorge e offre di riprendere.
//  Meglio una catena ferma e dichiarata di una che riparte da sola in
//  eterno consumando credito.
// ============================================================

const PASTI_DEL_GIORNO = ['pranzo', 'cena'] as const;

type PastoPassata = { modo: string; chi: string; nota: string };
type GiornoPassata = { day: string; pranzo: PastoPassata; cena: PastoPassata };

/** La passata ripulita: quello che il telefono ha compilato, di cui non ci fidiamo. */
function ripulisciPassata(grezza: unknown): GiornoPassata[] {
  const pasto = (p: any): PastoPassata => ({
    modo: ['casa', 'fuori', 'libero', 'lascia'].includes(String(p?.modo)) ? String(p.modo) : 'casa',
    chi:  ['ciprian', 'entrambi', 'lorena'].includes(String(p?.chi)) ? String(p.chi) : 'entrambi',
    nota: String(p?.nota ?? '').slice(0, 200),
  });
  return (Array.isArray(grezza) ? grezza : [])
    .slice(0, 14)
    .map((g: any) => ({ day: String(g?.day ?? '').slice(0, 10), pranzo: pasto(g?.pranzo), cena: pasto(g?.cena) }))
    .filter((g) => /^\d{4}-\d{2}-\d{2}$/.test(g.day));
}

const haDaCucinare = (g: GiornoPassata) => PASTI_DEL_GIORNO.some((q) => g[q].modo === 'casa');

/** Il giorno dopo, in AAAA-MM-GG. */
function giornoDopo(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Da un pasto della passata (più il piatto generato, se c'è) alla riga di
 * `plan_meals`.
 *
 * ⚠️ È il gemello di `righeDaSalvare()` nel frontend, e le due devono dire
 * la stessa cosa. Non è una copia per pigrizia: da qui in avanti è QUESTA
 * che scrive i pasti generati, e quella di là resta per i pasti scritti a
 * mano e per il modo vecchio. Se cambia lo schema, si toccano tutte e due.
 */
function rigaDiPasto(g: GiornoPassata, quale: string, m: any, oggi: string) {
  const p = (g as any)[quale] as PastoPassata;
  const base = {
    day: g.day,
    pasto: quale,
    modo: p.modo,
    chi: p.chi,
    // oggi e domani sono confermati, il resto è bozza. "oggi" arriva dal
    // telefono: il server sta su UTC e sbaglierebbe di poco, ma sbaglierebbe.
    stato: g.day <= giornoDopo(oggi) ? 'confermato' : 'bozza',
    nota: p.nota.trim() || null,
    a_mano: false,
  };

  if (p.modo !== 'casa') {
    return {
      ...base, piatto: null, perche: null, ingredienti: [], dolce: null, tempo: null,
      prot: null, kcal: null, scongelamento: null, scongelare_il: null,
      avanzo_per: null, dipende_da_spesa: false,
    };
  }

  // I numeri sono di Ciprian: nei pasti di sola Lorena non esistono.
  const suoi = p.chi !== 'lorena';
  const num = (v: unknown) => { const n = Number(v); return suoi && n > 0 ? Math.round(n) : null; };

  return {
    ...base,
    piatto: String(m?.piatto ?? '').trim() || null,
    perche: String(m?.perche ?? '').trim() || null,
    ingredienti: (Array.isArray(m?.ingredienti) ? m.ingredienti : []).map((i: any) => ({
      nome: String(i?.nome ?? '').trim(),
      qta:  String(i?.qta ?? '').trim(),
      per:  ['tutti', 'ciprian', 'lorena'].includes(String(i?.per)) ? String(i.per) : 'tutti',
    })).filter((i: any) => i.nome),
    dolce: String(m?.dolce ?? '').trim() || null,
    tempo: Number(m?.tempo) > 0 ? Math.round(Number(m.tempo)) : null,
    prot: num(m?.prot),
    kcal: num(m?.kcal),
    scongelamento: String(m?.scongelamento ?? '').trim() || null,
    // il promemoria si mostra sul giorno in cui va fatto: se la data non è
    // scritta bene, meglio nessun promemoria che uno sbagliato
    scongelare_il: /^\d{4}-\d{2}-\d{2}$/.test(String(m?.scongelare_il ?? '')) ? m.scongelare_il : null,
    avanzo_per: String(m?.avanzo_per ?? '').trim() || null,
    dipende_da_spesa: (Array.isArray(m?.manca) ? m.manca : []).length > 0,
    // ⚠️ Le due colonne del Blocco 6 si mandano SOLO se il modello ha
    // scritto qualcosa: su un database senza tabelle-blocco6.sql mandarle
    // sempre romperebbe tutta la generazione, che funzionava già.
    ...(passiPuliti(m?.procedimento).length ? { procedimento: passiPuliti(m.procedimento) } : {}),
    ...(sostPulite(m?.sostituzioni).length ? { sostituzioni: sostPulite(m.sostituzioni) } : {}),
    // ⚠️ Stessa prudenza: si manda solo se c'è, perché su un database senza
    // tabelle-frequenze-v8.sql quella colonna non esiste.
    ...(String(m?.categoria_principale ?? '').trim()
      ? { categoria_principale: String(m.categoria_principale).trim().toLowerCase() } : {}),
    // ⚠️ Le calorie di Lorena: solo se ci sono e solo nei pasti che mangia
    // lei. Stessa prudenza delle altre colonne aggiunte dopo — su un
    // database senza tabelle-kcal-lorena.sql mandarla sempre romperebbe la
    // generazione, che funzionava già.
    ...(p.chi !== 'ciprian' && Number(m?.kcal_lorena) > 0
      ? { kcal_lorena: Math.round(Number(m.kcal_lorena)) } : {}),
  };
}

/** I passi buoni: niente righe vuote, niente romanzi, al massimo dieci.
    ⚠️ Il tetto non è estetica: un procedimento che non finisce più non lo
    legge nessuno, e chi ne salta uno si abitua a saltarli tutti. */
const passiPuliti = (v: unknown) => (Array.isArray(v) ? v : [])
  .map((x) => String(x ?? '').trim())
  .filter(Boolean)
  .slice(0, 10);

/** Le sostituzioni buone: servono tutti e tre i pezzi, se no non si
    capisce né cosa manca né cosa ci si mette. */
const sostPulite = (v: unknown) => (Array.isArray(v) ? v : [])
  .map((x: any) => ({
    invece_di: String(x?.invece_di ?? '').trim(),
    uso:       String(x?.uso ?? '').trim(),
    perche:    String(x?.perche ?? '').trim(),
  }))
  .filter((x) => x.invece_di && x.uso)
  .slice(0, 6);

/** Scrive righe nel calendario cancellando SOLO i pasti che riscrive. */
async function scriviNelCalendario(righe: any[]) {
  if (!righe.length) return;
  for (const q of PASTI_DEL_GIORNO) {
    const giorni = righe.filter((r) => r.pasto === q).map((r) => r.day);
    if (!giorni.length) continue;
    await scrivi('DELETE', `plan_meals?pasto=eq.${q}&day=in.(${giorni.join(',')})`, undefined, 'return=minimal');
  }
  try {
    await scrivi('POST', 'plan_meals', righe, 'return=minimal');
  } catch (e) {
    // ⚠️ IL DEPLOY E IL FILE SQL NON ARRIVANO MAI NELLO STESSO ISTANTE.
    // Fra il momento in cui questa function viene reincollata e quello in
    // cui il file SQL viene eseguito passa qualche minuto, e in quei minuti
    // il modello scrive già procedimento e sostituzioni verso colonne che
    // non esistono ancora. Senza questo ripiego una settimana intera si
    // perderebbe per un ordine di operazioni — cioè per niente.
    // Meglio un piano senza procedimento che nessun piano.
    if (!/procedimento|sostituzioni/i.test(String((e as any)?.message ?? ''))) throw e;
    console.error('colonne del Blocco 6 assenti: scrivo senza');
    await scrivi('POST', 'plan_meals',
      righe.map(({ procedimento, sostituzioni, ...resto }) => resto), 'return=minimal');
  }
}

/** Quello che manca finisce nella lista della spesa, senza doppioni. */
async function aggiungiAllaSpesaServer(nomi: string[]) {
  const puliti = [...new Set(nomi.map((n) => String(n).trim()).filter(Boolean))];
  if (!puliti.length) return;
  const gia: any[] = await leggi('shopping_list', 'name');
  const gianomi = new Set(gia.map((x: any) => String(x.name).toLowerCase().trim()));
  const nuovi = puliti.filter((n) => !gianomi.has(n.toLowerCase()));
  if (nuovi.length) await scrivi('POST', 'shopping_list', nuovi.map((name) => ({ name })), 'return=minimal');
}

/** Una riga di lavoro, riletta dal database. Nessun anello si fida del precedente. */
async function leggiLavoro(id: string) {
  const righe: any[] = await leggi(`plan_jobs?id=eq.${encodeURIComponent(id)}`, '*');
  return Array.isArray(righe) && righe.length ? righe[0] : null;
}

const aggiornaLavoro = (id: string, campi: Record<string, unknown>) =>
  scrivi('PATCH', `plan_jobs?id=eq.${encodeURIComponent(id)}`,
    { ...campi, aggiornato_il: new Date().toISOString() }, 'return=minimal');

/** Un pasto già deciso, in una riga: è il testimone che passa di anello in anello. */
function compattaPastoServer(m: any, chi: string): string {
  const ing = (Array.isArray(m?.ingredienti) ? m.ingredienti : [])
    .map((i: any) => `${i.nome} ${i.qta}`).join(', ');
  return `${m.day} ${m.pasto} (mangia: ${chi}): ${m.piatto}` +
    (ing ? ` — usa: ${ing}` : '') +
    (String(m?.avanzo_per ?? '').trim() ? ` — ⚠️ cucinato doppio, l'avanzo va a: ${m.avanzo_per}` : '');
}

/**
 * Chiede al modello UN giorno e raccoglie i pasti. Nessuno sta guardando:
 * il flusso serve solo a poter salvare quello che è arrivato se la risposta
 * si tronca a metà.
 */
async function generaUnGiorno(c: Contesto, pezzi: PezziContesto) {
  const contesto = costruisciContestoSettimana(c, pezzi);
  const chiesti = pezzi.giorni.reduce((n, g) => n + g.pasti.length, 0);

  const chiamata = await chiamaAnthropic(REGOLE_SETTIMANA, contesto, SCHEMA_SETTIMANA, MAX_TOKENS_SETTIMANA);
  if (!chiamata.ok) throw new Error('il generatore non ha risposto');

  const lettore = creaLettore();
  const pasti: any[] = [];
  for await (const pezzo of pezziDiTesto(chiamata.corpo)) {
    if (pezzo.guasto) throw new Error('il generatore si è interrotto');
    if (!pezzo.testo) continue;
    for (const pasto of lettore.aggiungi(pezzo.testo)) {
      if (pasti.length < chiesti) pasti.push(pasto);
    }
  }

  let resta = '';
  try { resta = String(JSON.parse(lettore.testoIntero())?.resta ?? ''); } catch { /* JSON monco: pazienza */ }
  return { pasti, resta };
}

/**
 * Completa un piatto scritto a mano. UNA chiamata al modello, quindi UNA
 * tacca del tetto giornaliero: il bottone parte solo se lo si tocca, e chi
 * lo tocca sa che sta spendendo.
 *
 * Risponde in NDJSON come gli altri mestieri — non perché servano i pezzi
 * man mano (la risposta è una sola) ma per il BATTITO: il modello può
 * pensare a lungo in silenzio, e su un telefono un collegamento muto è un
 * collegamento che cade.
 */
async function completaPiatto(body: Record<string, unknown>): Promise<Response> {
  const nome = String(body.nome ?? '').trim().slice(0, 200);
  if (!nome) return errore('Dimmi prima come si chiama il piatto.', 400);

  const chi = ['ciprian', 'entrambi', 'lorena'].includes(String(body.chi))
    ? String(body.chi) : 'entrambi';
  const pasto = body.pasto === 'cena' ? 'cena' : 'pranzo';

  const scritti = Array.isArray(body.ingredienti)
    ? (body.ingredienti as any[]).slice(0, 30)
        .map((i) => `${String(i?.nome ?? '').slice(0, 80)}${i?.qta ? ` — ${String(i.qta).slice(0, 40)}` : ''}`)
        .filter((s) => s.trim())
    : [];

  // La ricetta che esiste già, se c'è: la manda il client dopo averla
  // trovata con stessoNome(), e qui è LEGGE. Serve a non riscrivere a modo
  // proprio una cosa che qualcuno aveva già approvato.
  const gia = body.ricetta && typeof body.ricetta === 'object'
    ? body.ricetta as Record<string, unknown> : null;

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

  let c: Contesto;
  try { c = await leggiContesto(); }
  catch { return errore('Non riesco a leggere la dispensa. Riprova fra poco.', 500); }

  const chiMangia = chi === 'entrambi'
    ? 'TUTTI E DUE, Ciprian e Lorena'
    : (chi === 'ciprian' ? 'SOLO Ciprian' : 'SOLO Lorena');

  const contesto = `## DISPENSA DI OGGI
⚠️ I nomi degli ingredienti si copiano da qui, lettera per lettera.

${descriviDispensa(c.inv)}

## LE PERSONE
${c.profili.length
  ? c.profili.map((p) => descriviProfilo(p)).join('\n\n')
  : '- (profili non configurati: considera una sola persona)'}

## IL PIATTO DA COMPLETARE
Nome scritto a mano: ${nome}
Pasto: ${pasto}
Chi mangia: ${chiMangia}
${scritti.length
  ? `Ingredienti già scritti a mano (tienili tutti, semmai completali):\n${scritti.map((s) => `- ${s}`).join('\n')}`
  : 'Ingredienti già scritti a mano: nessuno, li scrivi tu.'}

${gia
  ? `## QUESTA RICETTA ESISTE GIÀ — è la verità, riusala com'è
Per una persona: ${JSON.stringify(gia.ingredienti ?? [])}
Proteine: ${gia.prot ?? '(non si sa)'} · Calorie: ${gia.kcal ?? '(non si sa)'}
Copia questi valori in "ricetta_ingredienti", "ricetta_prot" e "ricetta_kcal", e
limitati a dimensionare il pasto di oggi su chi mangia.`
  : '## QUESTA RICETTA NON ESISTE ANCORA\nScrivila tu, per una persona.'}`;

  return flussoNdjson(async (manda) => {
    // ⚠️ QUESTA RIGA SUBITO, PRIMA DI TUTTO: è ciò che fa uscire dal server
    // il primo byte. Senza, il filo restava aperto e MUTO finché non partiva
    // il battito — misurato il 22/08/2026: la risposta non cominciava ad
    // arrivare prima di 11 secondi, e undici secondi di silenzio assoluto su
    // un telefono sono la finestra in cui Safari lascia cadere tutto. Poi
    // l'app riceveva un guasto di rete e diceva «non raggiungo il database»,
    // che mandava a controllare la cosa sbagliata.
    // Gli altri due mestieri aprivano già così: qui non era mai stato messo.
    manda({ tipo: 'stato', testo: 'Sto scrivendo la ricetta…' });

    // ⚠️ Il battito va protetto come negli altri due mestieri: se il filo si
    // è già rotto, `manda` scoppia — e scoppiando dentro un timer non lo
    // prende il try qui sotto, che nel frattempo è in un'altra battuta.
    const battito = setInterval(() => {
      try { manda({ tipo: 'battito' }); } catch { /* il filo è già chiuso */ }
    }, 10_000);
    try {
      const chiamata = await chiamaAnthropic(REGOLE_RICETTA, contesto, SCHEMA_RICETTA, MAX_TOKENS_RICETTA);
      if (!chiamata.ok) { manda({ errore: 'Il generatore non risponde. Riprova fra un minuto.' }); return; }

      let testo = '';
      for await (const pezzo of pezziDiTesto(chiamata.corpo)) {
        if (pezzo.guasto) { manda({ errore: 'Il generatore si è interrotto. Riprova.' }); return; }
        if (pezzo.testo) testo += pezzo.testo;
      }

      let ric: unknown;
      try { ric = JSON.parse(testo); }
      catch { manda({ errore: 'Il generatore ha risposto a metà. Riprova.' }); return; }

      manda({ tipo: 'ricetta', ricetta: ric });
    } finally {
      clearInterval(battito);
    }
  });
}

// ============================================================
//  I COSTI — una stima, e va detto che è una stima
//
//  ⚠️ `generator_usage` ha RLS accesa e ZERO policy: è invisibile alla
//  chiave pubblica, ed è ciò che la rende non manomettibile da chi apre
//  l'indirizzo. Per mostrarne il contenuto NON si aggiunge una policy —
//  si passa di qui, dove c'è la chiave di servizio.
//
//  ⚠️ E questo modo NON consuma una tacca: è una lettura, non una
//  generazione. Fargliela pagare vorrebbe dire che guardare quanto spendi
//  ti fa spendere.
// ============================================================

// Prezzi per MILIONE di token, in dollari. Sono quelli di Sonnet al
// momento in cui questo è stato scritto (18/08/2026).
// ⚠️ I prezzi cambiano: quando cambiano, questi due numeri diventano
// sbagliati in silenzio. È metà del motivo per cui la cifra si chiama
// «stima» e l'app rimanda alla Console di Anthropic per il conto vero.
const COSTO_IN  = 3;
const COSTO_OUT = 15;

async function riepilogoCosti(): Promise<Response> {
  try {
    const righe = await leggi('generator_usage', 'day,count,tok_in,tok_out') as
      Array<{ day: string; count: number; tok_in: number; tok_out: number }>;

    const oggi = new Date().toISOString().slice(0, 10);
    const daInizioMese = oggi.slice(0, 8) + '01';

    const somma = (filtro: (r: typeof righe[number]) => boolean) => {
      const q = righe.filter(filtro);
      const tin = q.reduce((n, r) => n + Number(r.tok_in || 0), 0);
      const tout = q.reduce((n, r) => n + Number(r.tok_out || 0), 0);
      return {
        generazioni: q.reduce((n, r) => n + Number(r.count || 0), 0),
        tok_in: tin,
        tok_out: tout,
        dollari: (tin / 1e6) * COSTO_IN + (tout / 1e6) * COSTO_OUT,
      };
    };

    return json({
      mese:  somma((r) => r.day >= daInizioMese),
      oggi:  somma((r) => r.day === oggi),
      tetto: MAX_AL_GIORNO,
      // serve al client per dire «i conti partono da qui»: prima di questa
      // data i token non venivano registrati, e un totale che parte da zero
      // senza dirlo sembrerebbe dire che non hai speso niente
      dal: righe.filter((r) => Number(r.tok_in || 0) > 0)
                .map((r) => r.day).sort()[0] ?? null,
    });
  } catch (e) {
    console.error('costi', e);
    return errore('Non riesco a leggere i costi. Riprova fra poco.', 500);
  }
}

/** Sveglia l'anello successivo e non aspetta che finisca. */
async function svegliaProssimoPasso(id: string) {
  await fetch(`${SUPABASE_URL}/functions/v1/cosa-cucino`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ modo: 'settimana-passo', lavoro: id }),
  });
}

/** UN anello: un giorno generato, scritto, e il testimone passato. */
async function passoStaffetta(id: string) {
  let lavoro: any = null;
  try {
    lavoro = await leggiLavoro(id);
    if (!lavoro || lavoro.stato !== 'in_corso') return;

    const passata: GiornoPassata[] = lavoro.passata;
    // il prossimo giorno che ha davvero qualcosa da cucinare
    let i = Number(lavoro.prossimo) || 0;
    while (i < passata.length && !haDaCucinare(passata[i])) i++;

    if (i >= passata.length) {
      await aggiornaLavoro(id, { stato: 'finito', passo: null, prossimo: passata.length });
      return;
    }

    const g = passata[i];
    await aggiornaLavoro(id, { passo: `Sto scrivendo ${g.day}`, prossimo: i });

    const usate = await consumaUnaGenerazione();
    if (usate === -1) {
      await aggiornaLavoro(id, {
        stato: 'fermo',
        errore: `Per oggi hai già usato tutte le ${MAX_AL_GIORNO} generazioni. La settimana riprende domani da ${g.day}.`,
      });
      return;
    }

    const c = await leggiContesto();
    const giorni: GiornoChiesto[] = [{
      day: g.day,
      pasti: PASTI_DEL_GIORNO.filter((q) => g[q].modo === 'casa')
        .map((q) => ({ pasto: q, chi: g[q].chi, nota: g[q].nota })),
    }];

    const { pasti, resta } = await generaUnGiorno(c, {
      giorni,
      giaFatti: (Array.isArray(lavoro.fatti) ? lavoro.fatti : []).slice(-20),
      restaPrima: String(lavoro.resta ?? ''),
      fuoriELiberi: [],
      settimana: passata.flatMap((x) => PASTI_DEL_GIORNO.map((q) =>
        `${x.day} ${q}: ${({ casa: 'a casa', fuori: 'fuori casa', libero: 'pasto libero', lascia: 'già deciso, non lo tocchiamo' } as any)[x[q].modo]}` +
        (x[q].modo === 'casa' ? ` — mangia: ${x[q].chi}` : '') +
        (x[q].nota.trim() ? ` — nota: ${x[q].nota.trim()}` : ''))),
      ioSlug: String(lavoro.io_slug ?? 'lorena'),
      // il flag viaggia con la riga di lavoro: ogni anello della staffetta
      // lo rilegge dal database invece di fidarsi di chi l'ha svegliato
      svuotaFrigo: lavoro.svuota_frigo === true,
    });

    // ⚠️ Si scrive quello che è ARRIVATO, non quello che era stato chiesto.
    // Un pasto che il modello ha saltato non diventa una riga finta: resta
    // un buco, e il buco si vede.
    const righe: any[] = [];
    const testimoni: string[] = [];
    for (const q of PASTI_DEL_GIORNO) {
      if (g[q].modo === 'lascia') continue;          // «Lascia» non si tocca mai
      if (g[q].modo !== 'casa') { righe.push(rigaDiPasto(g, q, null, lavoro.oggi)); continue; }
      const m = pasti.find((x: any) => x.day === g.day && x.pasto === q);
      if (!m) continue;
      righe.push(rigaDiPasto(g, q, m, lavoro.oggi));
      testimoni.push(compattaPastoServer({ ...m, day: g.day, pasto: q }, g[q].chi));
    }

    await scriviNelCalendario(righe);
    try {
      await aggiungiAllaSpesaServer(pasti.flatMap((m: any) => Array.isArray(m?.manca) ? m.manca : []));
    } catch (e) { console.error('spesa', e); }   // accessorio: non ferma la staffetta

    const restano = passata.slice(i + 1).filter(haDaCucinare);
    await aggiornaLavoro(id, {
      prossimo: i + 1,
      fatti: [...(Array.isArray(lavoro.fatti) ? lavoro.fatti : []), ...testimoni],
      resta: resta || lavoro.resta,
      stato: restano.length ? 'in_corso' : 'finito',
      passo: restano.length ? `Adesso tocca a ${restano[0].day}` : null,
      errore: null,
    });

    if (restano.length) await svegliaProssimoPasso(id);
  } catch (e) {
    console.error('staffetta', e);
    // ⚠️ Un anello che muore ferma la catena e LO DICE. Non riparte da solo:
    // una catena che si rincorre da sola consuma credito senza che nessuno
    // guardi. L'app mostra «riprendi».
    try {
      await aggiornaLavoro(id, {
        stato: 'fermo',
        errore: 'La generazione si è interrotta. Puoi riprendere da dove si è fermata.',
      });
    } catch { /* se non riusciamo nemmeno a dirlo, l'app se ne accorge dal tempo fermo */ }
  }
}

/** Il telefono chiede la settimana e se ne va. Qui si risponde subito. */
async function avviaStaffetta(body: Record<string, unknown>): Promise<Response> {
  const passata = ripulisciPassata(body.passata);
  if (!passata.length) return errore('Non c’è nessun giorno da pianificare.', 400);

  const daCucinare = passata.filter(haDaCucinare).length;
  if (!daCucinare) return errore('In questi giorni non si cucina niente: non c’è nulla da generare.', 400);

  const oggi = /^\d{4}-\d{2}-\d{2}$/.test(String(body.oggi ?? ''))
    ? String(body.oggi) : new Date().toISOString().slice(0, 10);

  // Il margine deve bastare per TUTTA la settimana: meglio fermarsi prima
  // che a metà lavoro, con mezzo calendario scritto.
  try {
    const usate = await generazioniUsateOggi();
    if (usate + daCucinare > MAX_AL_GIORNO) {
      return errore(
        `Per generare questi giorni servono ${daCucinare} generazioni delle ${MAX_AL_GIORNO} di oggi, e ne restano ${Math.max(0, MAX_AL_GIORNO - usate)}. Riprova domani.`,
        429,
      );
    }
  } catch {
    return errore('Non riesco a controllare il contatore delle generazioni. Riprova fra poco.', 500);
  }

  // I giorni in cui non si cucina non hanno bisogno del modello: si scrivono
  // subito, così il calendario è già vero prima ancora di cominciare.
  try {
    const subito = passata.flatMap((g) => PASTI_DEL_GIORNO
      .filter((q) => g[q].modo === 'fuori' || g[q].modo === 'libero')
      .map((q) => rigaDiPasto(g, q, null, oggi)));
    await scriviNelCalendario(subito);
  } catch (e) {
    console.error('fuori e liberi', e);
    return errore('Non riesco a scrivere nel calendario. Riprova fra poco.', 500);
  }

  let lavoro: any;
  try {
    const creato = await scrivi('POST', 'plan_jobs', {
      passata, oggi, io_slug: String(body.io_slug ?? 'lorena').slice(0, 40),
      giorni_tot: daCucinare, stato: 'in_corso', passo: 'Sto per cominciare…',
      // ⚠️ La colonna si manda SOLO quando serve davvero: su un database in
      // cui tabelle-blocco6.sql non è ancora stato eseguito non esiste, e
      // mandarla sempre romperebbe una generazione normale, che funzionava.
      ...(body.svuota_frigo === true ? { svuota_frigo: true } : {}),
    });
    lavoro = Array.isArray(creato) ? creato[0] : creato;
  } catch (e) {
    console.error('creazione lavoro', e);
    // ⚠️ Due cause diverse, due messaggi diversi: mandare qualcuno a
    // eseguire il file sbagliato è peggio che non dirgli niente.
    if (/svuota_frigo/i.test(String((e as any)?.message ?? '')))
      return errore('Per lo svuota-frigo manca una colonna. Esegui tabelle-blocco6.sql su Supabase.', 500);
    return errore('Manca la tabella dei lavori. Esegui tabelle-staffetta.sql su Supabase.', 500);
  }

  // ⚠️ Da qui in poi il telefono non serve più: si risponde SUBITO e il
  // lavoro continua in sottofondo.
  inSottofondo(passoStaffetta(lavoro.id));
  return json({ lavoro: lavoro.id, giorni: daCucinare });
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
  //
  // Tre modi, e il primo è quello buono:
  //   settimana-avvia → LA STAFFETTA: prende in carico e risponde subito
  //   settimana-passo → un anello della staffetta, chiamato da lei stessa
  //   settimana       → il modo vecchio, in cui è il telefono a guidare.
  //                     Resta perché l'app lo usa come ripiego quando questa
  //                     function non è ancora stata reincollata.
  //
  // E poi c'è «ricetta», il terzo mestiere: completare UN piatto scritto
  // a mano. Sta più sotto perché non c'entra con la settimana.
  if (body.modo === 'settimana-avvia') return await avviaStaffetta(body);

  if (body.modo === 'settimana-passo' || body.modo === 'settimana-riprendi') {
    const id = String(body.lavoro ?? '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) return errore('Lavoro non valido.', 400);

    // «Riprendi» rimette in corsa una staffetta che si era fermata. Riparte
    // dal primo giorno mancante — "prossimo" non l'ha mai superato — quindi
    // i giorni già scritti non si rifanno e non si ripagano.
    if (body.modo === 'settimana-riprendi') {
      try {
        const lavoro = await leggiLavoro(id);
        if (!lavoro) return errore('Quella settimana non esiste più.', 404);
        if (lavoro.stato === 'finito') return json({ ok: true, gia: true });
        await aggiornaLavoro(id, { stato: 'in_corso', errore: null, passo: 'Riprendo…' });
      } catch (e) {
        console.error('riprendi', e);
        return errore('Non riesco a riprendere la settimana. Riprova fra poco.', 500);
      }
    }

    // si risponde subito e si lavora dopo: chi ci ha svegliati non aspetta
    inSottofondo(passoStaffetta(id));
    return json({ ok: true });
  }

  if (body.modo === 'settimana') return await pianificaSettimana(body);

  // Il terzo mestiere: completare un piatto scritto a mano. Parte solo
  // quando qualcuno tocca «Crea la ricetta», mai da sé.
  if (body.modo === 'ricetta') return await completaPiatto(body);

  // ⚠️ Prima del contatore, apposta: guardare quanto si è speso non deve
  // costare una generazione.
  if (body.modo === 'costi') return await riepilogoCosti();

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

## L'ULTIMO MESE (memoria fra le settimane)
${descriviMese(c)}

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
