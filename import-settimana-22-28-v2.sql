-- IMPORT DELLA SETTIMANA 22-28 AGOSTO 2026 — VERSIONE NUOVA
-- Da eseguire su Supabase: SQL Editor, incolla, Run.
-- Si puo' rieseguire quante volte si vuole: riscrive gli stessi 14 pasti.
--
-- COSA FA
-- Scrive nel calendario i 14 pasti decisi in chat (sabato 22 -> venerdi' 28),
-- come pasti SCRITTI A MANO. Non chiama il generatore, quindi non consuma
-- nessuna delle 30 generazioni giornaliere.
--
-- ATTENZIONE, QUESTO SOSTITUISCE LA SETTIMANA GIA' CARICATA IL 18 AGOSTO.
-- Cinque pasti su quattordici cambiano davvero:
--    domenica pranzo   "Pasta al pomodoro e basilico"  ->  al sugo con le fettine di vitello
--    mercoledi' cena   polpette con il pure'           ->  polpette con la polenta
--    giovedi' cena     minestrone con ceci             ->  zuppa di lenticchie con pastina
--    venerdi' pranzo   "Avanzi o toast"                ->  pasta in bianco col cotto magro
--    venerdi' cena     pollo alle erbe                 ->  straccetti di tacchino al limone
-- Gli altri nove restano quelli, con qualche porzione ritoccata.
-- Se di quelli vecchi ti serviva qualcosa, copiatelo prima di premere Run.
--
-- COME SONO FATTI I PASTI
-- * "ingredienti" contiene ESATTAMENTE la lista "Scala" del piano, cioe'
--   quello che va tolto dalla dispensa quando si cucina. Non sono le
--   porzioni: e' la somma di quello che si consuma quel giorno.
-- * Le porzioni delle due persone stanno nella NOTA del pasto, che l'app
--   mostra sotto il piatto, insieme alle alternative proteiche di Ciprian
--   (le righe da 12 g della tabella delle equivalenze).
-- * I pasti di avanzi (martedi' e giovedi' a pranzo) scalano SOLO quello
--   che si aggiunge quel giorno: la torta salata e i burritos erano gia'
--   stati contati quando sono stati cucinati. Contarli due volte
--   svuoterebbe la dispensa di roba che nessuno ha usato.
-- * "prot" sono le proteine stimate di Ciprian. "kcal" resta VUOTO apposta.
-- * "a_mano" e' true: e' il bollino SCRITTO DA TE, ed e' anche cio' che
--   impedisce a "Genera la settimana" di passarci sopra.
--
-- DUE NOMI SCRITTI DIVERSI DA COME LI HAI DETTI, E IL PERCHE'
-- * "grana" di mercoledi' sera e' scritto Parmigiano, che e' il nome con
--   cui la stessa cosa sta nella lista della spesa: un nome solo per un
--   ingrediente solo, altrimenti l'app non riconosce che ce l'hai.
-- * il riso e' "Riso Roma", il nome esatto che ha in dispensa.

begin;

delete from public.plan_meals
 where day between date '2026-08-22' and date '2026-08-28';

insert into public.plan_meals
  (day, pasto, modo, chi, stato, a_mano, piatto, ingredienti, prot, kcal,
   dolce, tempo, scongelamento, scongelare_il, avanzo_per, nota)
values

-- SABATO 22
('2026-08-22', 'pranzo', 'casa', 'entrambi', 'confermato', true,
 'Pane, prosciutto crudo e mozzarella',
 '[{"nome":"Pane","qta":"140 g","per":"tutti"},
   {"nome":"Prosciutto crudo","qta":"150 g","per":"tutti"},
   {"nome":"Mozzarelle","qta":"2","per":"tutti"},
   {"nome":"Patatine","qta":"a lato","per":"lorena"}]'::jsonb,
 55, null, null, null, null, null, null,
 'Lorena: pane 60 g, prosciutto crudo 50 g, 1 mozzarella, patatine a lato. Ciprian: pane 80 g, prosciutto crudo 100 g, 1 mozzarella.'),

('2026-08-22', 'cena', 'casa', 'entrambi', 'confermato', true,
 'Verdure al forno con stracchino e pane',
 '[{"nome":"Zucchine","qta":"2","per":"tutti"},
   {"nome":"Melanzane","qta":"1","per":"tutti"},
   {"nome":"Carote","qta":"2","per":"tutti"},
   {"nome":"Patate","qta":"450 g","per":"tutti"},
   {"nome":"Cipolle","qta":"1","per":"tutti"},
   {"nome":"Stracchino","qta":"120 g","per":"tutti"},
   {"nome":"Pane","qta":"120 g","per":"tutti"},
   {"nome":"Tonno","qta":"2 scatolette","per":"ciprian"},
   {"nome":"Olio","qta":"q.b.","per":"tutti"}]'::jsonb,
 58, null, 'Gelato', null, null, null, null,
 'Lorena: verdure a volonta'', stracchino 70 g, pane. Se manca l''appetito, ripiego: pastina in brodo. Ciprian: verdure 300 g, stracchino 50 g, pane 60 g, piu'' tonno 160 g sgocciolato. Al posto del tonno: fettine di vitello 210 g oppure 5 uova.'),

-- DOMENICA 23
('2026-08-23', 'pranzo', 'casa', 'entrambi', 'confermato', true,
 'Pasta al sugo con parmigiano e fettine di vitello',
 '[{"nome":"Pasta","qta":"180 g","per":"tutti"},
   {"nome":"Passata / polpa di pomodoro","qta":"350 g","per":"tutti"},
   {"nome":"Basilico","qta":"q.b.","per":"tutti"},
   {"nome":"Parmigiano","qta":"30 g","per":"tutti"},
   {"nome":"Fettine di vitello","qta":"150 g","per":"ciprian"},
   {"nome":"Olio","qta":"q.b.","per":"tutti"}]'::jsonb,
 48, null, null, null, null, null, null,
 'Lorena: pasta 80 g, sugo, parmigiano. Ciprian: pasta 100 g, parmigiano 15 g, piu'' fettine di vitello 150 g a parte. Al posto del vitello: petto di pollo 160 g oppure tonno 110 g sgocciolato. In serata cuocere 170 g di riso per lunedi'' e tenerlo in frigo.'),

-- La cena di domenica e' un PASTO LIBERO. Nel metodo e' una scelta, non uno
-- sgarro: l'app lo mostra come tale e non scala niente dalla dispensa.
-- Il totale del giorno scende, ed e' giusto cosi': non si compensa altrove.
('2026-08-23', 'cena', 'libero', 'entrambi', 'confermato', true,
 'Pizza d''asporto',
 '[]'::jsonb,
 50, null, null, null, null, null, null,
 'Pasto libero: niente da scalare dalla dispensa.'),

-- LUNEDI 24
('2026-08-24', 'pranzo', 'casa', 'entrambi', 'confermato', true,
 'Riso alla cantonese',
 '[{"nome":"Riso Roma","qta":"170 g","per":"tutti"},
   {"nome":"Uova","qta":"3","per":"tutti"},
   {"nome":"Prosciutto cotto","qta":"140 g","per":"tutti"},
   {"nome":"Petto di pollo","qta":"100 g","per":"ciprian"},
   {"nome":"Piselli","qta":"160 g","per":"tutti"},
   {"nome":"Salsa di soia","qta":"q.b.","per":"tutti"},
   {"nome":"Olio","qta":"q.b.","per":"tutti"}]'::jsonb,
 68, null, null, 10, null, null, null,
 'Lorena: riso 70 g, 1 uovo, piselli, poco prosciutto cotto. Ciprian: riso 100 g, 2 uova, prosciutto cotto 100 g, petto di pollo 100 g a cubetti, piselli 80 g. Il riso e'' quello cotto domenica sera, saltato in padella: 10 minuti.'),

('2026-08-24', 'cena', 'casa', 'entrambi', 'confermato', true,
 'Torta salata zucchine, provolone e cotto',
 '[{"nome":"Pasta sfoglia","qta":"1 rotolo","per":"tutti"},
   {"nome":"Provolone","qta":"150 g","per":"tutti"},
   {"nome":"Zucchine","qta":"2","per":"tutti"},
   {"nome":"Prosciutto cotto","qta":"100 g","per":"tutti"},
   {"nome":"Uova","qta":"2","per":"ciprian"},
   {"nome":"Insalata","qta":"q.b.","per":"tutti"}]'::jsonb,
 44, null, 'Pesche', null, null, null, 'pranzo di martedì',
 'Teglia da 8 fette, circa 110 g l''una. Lorena: 220 g di torta (2 fette) e insalata. Ciprian: 330 g (3 fette) piu'' 2 uova sode. Al posto delle uova: fettine di vitello 60 g oppure tonno 45 g sgocciolato. Le 3 fette che restano sono il pranzo di martedi''.'),

-- MARTEDI 25
-- Avanzo: scala SOLO quello che si aggiunge oggi, non la torta salata, che
-- era gia' stata scalata lunedi' sera.
('2026-08-25', 'pranzo', 'casa', 'entrambi', 'confermato', true,
 'Torta salata avanzata con insalata',
 '[{"nome":"Insalata","qta":"q.b.","per":"tutti"},
   {"nome":"Finocchi","qta":"1","per":"tutti"},
   {"nome":"Carote","qta":"2","per":"tutti"},
   {"nome":"Tonno","qta":"2 scatolette","per":"ciprian"}]'::jsonb,
 52, null, null, null, null, null, null,
 'Avanzo della torta salata di lunedi'' sera: la torta non si riscala, era gia'' contata. Lorena: 110 g di torta, finocchi e carote. Ciprian: 220 g di torta, insalata e tonno 120 g sgocciolato. Al posto del tonno: fettine di vitello 160 g oppure petto di pollo 130 g.'),

('2026-08-25', 'cena', 'casa', 'entrambi', 'confermato', true,
 'Merluzzo al forno con patate',
 '[{"nome":"Filetti di merluzzo","qta":"450 g","per":"tutti"},
   {"nome":"Patate","qta":"500 g","per":"tutti"},
   {"nome":"limoni","qta":"1","per":"tutti"},
   {"nome":"Olio","qta":"q.b.","per":"tutti"}]'::jsonb,
 60, null, 'Cioccolato fondente', null,
 'Filetti di merluzzo dal freezer, tirarli fuori in mattinata', '2026-08-25', null,
 'Lorena: merluzzo 150 g e patate. Ciprian: merluzzo 300 g e patate 300 g.'),

-- MERCOLEDI 26
('2026-08-26', 'pranzo', 'casa', 'entrambi', 'confermato', true,
 'Burritos col pulled chicken',
 '[{"nome":"Tortillas","qta":"4","per":"tutti"},
   {"nome":"Pulled chicken","qta":"2 confezioni","per":"tutti"},
   {"nome":"Riso Roma","qta":"120 g","per":"tutti"},
   {"nome":"Fagioli","qta":"1 barattolo","per":"tutti"},
   {"nome":"Cheddar","qta":"100 g","per":"tutti"},
   {"nome":"Maionese","qta":"q.b.","per":"tutti"},
   {"nome":"Patatine","qta":"a lato","per":"lorena"}]'::jsonb,
 54, null, null, null, null, null, 'pranzo di giovedì',
 'Si preparano 4 burritos: 2 si mangiano oggi, 2 restano per giovedi''. Lorena: 1 burrito normale e patatine a lato. Ciprian: 1 tortilla con pulled chicken 150 g, riso cotto 80 g, fagioli 80 g, cheddar 30 g e maionese.'),

('2026-08-26', 'cena', 'casa', 'entrambi', 'confermato', true,
 'Polpette con polenta e fagiolini',
 '[{"nome":"Polpette pronte","qta":"450 g","per":"tutti"},
   {"nome":"Polenta istantanea","qta":"90 g","per":"tutti"},
   {"nome":"Fagiolini","qta":"300 g","per":"tutti"},
   {"nome":"Parmigiano","qta":"20 g","per":"ciprian"}]'::jsonb,
 54, null, 'Budino', null, null, null, null,
 'Lorena: polpette 150 g, polenta e fagiolini. Ciprian: polpette 300 g, polenta 50 g a crudo, fagiolini 150 g e grana 15 g. In serata tirare fuori dal freezer il petto di pollo per giovedi''.'),

-- GIOVEDI 27
-- Avanzo: non scala niente. I burritos erano gia' stati contati mercoledi'.
('2026-08-27', 'pranzo', 'casa', 'entrambi', 'confermato', true,
 'Burrito avanzato',
 '[]'::jsonb,
 54, null, null, 10, null, null, null,
 'Avanzo di mercoledi'': niente da scalare, era gia'' contato. Un burrito a testa, in forno 10 minuti avvolto nella stagnola.'),

('2026-08-27', 'cena', 'casa', 'entrambi', 'confermato', true,
 'Zuppa di lenticchie con carote e pastina, pollo a parte',
 '[{"nome":"Lenticchie","qta":"2 barattoli","per":"tutti"},
   {"nome":"Carote","qta":"2","per":"tutti"},
   {"nome":"Pastina","qta":"80 g","per":"tutti"},
   {"nome":"Petto di pollo","qta":"250 g","per":"tutti"},
   {"nome":"Brodo granulare","qta":"q.b.","per":"tutti"},
   {"nome":"Olio","qta":"q.b.","per":"tutti"}]'::jsonb,
 58, null, 'Mela cotta con cannella', null,
 'Petto di pollo dal freezer, per stasera', '2026-08-26', null,
 'Lorena: zuppa piena e petto di pollo 100 g. Ciprian: lenticchie sgocciolate 240 g, pastina 40 g, carote, piu'' petto di pollo 150 g a parte. Al posto del pollo: fettine di vitello 180 g oppure merluzzo 190 g. In serata tirare fuori dal freezer il tacchino per venerdi''.'),

-- VENERDI 28
('2026-08-28', 'pranzo', 'casa', 'entrambi', 'confermato', true,
 'Pasta in bianco con prosciutto cotto magro',
 '[{"nome":"Pasta","qta":"180 g","per":"tutti"},
   {"nome":"Prosciutto cotto magro","qta":"200 g","per":"tutti"},
   {"nome":"Parmigiano","qta":"35 g","per":"tutti"},
   {"nome":"Olio","qta":"q.b.","per":"tutti"}]'::jsonb,
 49, null, null, null, null, null, null,
 'Lorena: pasta 80 g, prosciutto cotto, parmigiano. Ciprian: pasta 100 g, prosciutto cotto magro 150 g, parmigiano 20 g.'),

('2026-08-28', 'cena', 'casa', 'entrambi', 'confermato', true,
 'Straccetti di tacchino al limone con farro e fagiolini',
 '[{"nome":"Straccetti di tacchino","qta":"320 g","per":"tutti"},
   {"nome":"Farro perlato","qta":"140 g","per":"tutti"},
   {"nome":"Fagiolini","qta":"300 g","per":"tutti"},
   {"nome":"limoni","qta":"1","per":"tutti"},
   {"nome":"Erbe aromatiche","qta":"q.b.","per":"tutti"},
   {"nome":"Olio","qta":"q.b.","per":"tutti"}]'::jsonb,
 60, null, 'Ciambella, se qualcuno la prepara', null,
 'Straccetti di tacchino dal freezer, per stasera', '2026-08-27', null,
 'Lorena: tacchino 100 g, farro 60 g e tanta verdura. Ciprian: tacchino 220 g, farro 80 g e fagiolini.');

commit;

-- CONTROLLO
-- Devi vedere 14 righe, due per ogni giorno, tutte con a_mano = true.
-- Domenica cena deve avere modo = 'libero'.
-- I due pasti di avanzi (martedi' e giovedi' a pranzo) hanno pochi
-- ingredienti o nessuno: e' giusto cosi'.
select day, pasto, modo, piatto, prot,
       jsonb_array_length(ingredienti) as ingredienti,
       a_mano
from public.plan_meals
where day between date '2026-08-22' and date '2026-08-28'
order by day, pasto desc;
