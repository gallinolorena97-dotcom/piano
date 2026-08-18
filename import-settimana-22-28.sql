-- IMPORT DELLA SETTIMANA 22-28 AGOSTO 2026
-- Da eseguire su Supabase: SQL Editor, incolla, Run.
-- Si puo' rieseguire quante volte si vuole: riscrive gli stessi 14 pasti.
--
-- COSA FA
-- Scrive nel calendario i 14 pasti gia' decisi (sabato 22 -> venerdi' 28),
-- come pasti SCRITTI A MANO. Non chiama il generatore, quindi non consuma
-- nessuna delle 30 generazioni giornaliere.
--
-- ATTENZIONE, QUESTO CANCELLA DUE COSE
-- Sabato 22 ha gia' due pasti generati, e verranno sostituiti:
--    pranzo -> "Hamburger con panino, patatine e insalata di carote"
--    cena   -> "Pasta con salsiccia, piselli e porcini secchi"
-- Se ti servono ancora, copiateli da qualche parte prima di premere Run.
-- Gli altri sei giorni sono vuoti: li' non si cancella niente.
--
-- COME SONO FATTI I PASTI
-- * "ingredienti" contiene ESATTAMENTE la lista "Scala" del piano, cioe'
--   quello che va tolto dalla dispensa quando si cucina. E' gia' al netto
--   degli avanzi e del batch di giovedi' 20.
-- * Le porzioni delle due persone stanno nella NOTA del pasto, che l'app
--   mostra sotto il piatto. Sono due informazioni diverse: quanto si toglie
--   dalla dispensa e quanto va nel piatto di ciascuno.
-- * "prot" sono le proteine stimate di Ciprian. "kcal" resta VUOTO apposta.
-- * "a_mano" e' true: e' il bollino SCRITTO DA TE, ed e' anche cio' che
--   impedisce a "Genera la settimana" di passarci sopra.

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
   {"nome":"Patatine","qta":"a lato","per":"tutti"}]'::jsonb,
 55, null, null, null, null, null, null,
 'Lorena: pane 60 g, prosciutto crudo 50 g, 1 mozzarella, patatine a lato. Ciprian: pane 80 g, prosciutto crudo 100 g, 1 mozzarella.'),

('2026-08-22', 'cena', 'casa', 'entrambi', 'confermato', true,
 'Verdure al forno con stracchino e pane',
 '[{"nome":"Zucchine","qta":"2","per":"tutti"},
   {"nome":"Melanzane","qta":"1","per":"tutti"},
   {"nome":"Carote","qta":"2","per":"tutti"},
   {"nome":"Patate","qta":"3","per":"tutti"},
   {"nome":"Cipolle","qta":"1","per":"tutti"},
   {"nome":"Stracchino","qta":"120 g","per":"tutti"},
   {"nome":"Pane","qta":"100 g","per":"tutti"},
   {"nome":"Tonno","qta":"2 scatolette","per":"ciprian"},
   {"nome":"Olio","qta":"q.b.","per":"tutti"}]'::jsonb,
 57, null, 'Gelato', null, null, null, null,
 'Lorena: verdure a volontà, stracchino 70 g, pane. Se manca l''appetito, ripiego: pastina in brodo. Ciprian: verdure 300 g, stracchino 50 g, tonno 160 g sgocciolato, pane 40 g. Le verdure sono quelle del batch di giovedì 20: si scalano qui perché il batch non e'' nel piano.'),

-- DOMENICA 23
('2026-08-23', 'pranzo', 'casa', 'entrambi', 'confermato', true,
 'Pasta al pomodoro e basilico',
 '[{"nome":"Pasta","qta":"180 g","per":"tutti"},
   {"nome":"Passata / polpa di pomodoro","qta":"350 g","per":"tutti"},
   {"nome":"Basilico","qta":"q.b.","per":"tutti"},
   {"nome":"Parmigiano","qta":"30 g","per":"tutti"},
   {"nome":"Uova","qta":"3","per":"ciprian"}]'::jsonb,
 39, null, null, null, null, null, null,
 'Lorena: pasta 80 g, parmigiano. Ciprian: pasta 100 g, parmigiano 15 g, 3 uova sode. In serata cuocere 170 g di riso per lunedì e tenerlo in frigo.'),

-- La cena di domenica e' un PASTO LIBERO. Nel metodo e' una scelta, non uno
-- sgarro: l'app lo mostra come tale e non scala niente dalla dispensa.
-- Il totale del giorno scende, ed e' giusto cosi': non si compensa altrove.
('2026-08-23', 'cena', 'libero', 'entrambi', 'confermato', true,
 'Pizza d''asporto',
 '[]'::jsonb,
 null, null, null, null, null, null, null,
 'Pasto libero: niente da scalare dalla dispensa.'),

-- LUNEDI 24
('2026-08-24', 'pranzo', 'casa', 'entrambi', 'confermato', true,
 'Riso alla cantonese',
 '[{"nome":"Riso Roma","qta":"170 g","per":"tutti"},
   {"nome":"Uova","qta":"4","per":"tutti"},
   {"nome":"Prosciutto cotto","qta":"140 g","per":"tutti"},
   {"nome":"Piselli","qta":"160 g","per":"tutti"},
   {"nome":"Salsa di soia","qta":"q.b.","per":"tutti"},
   {"nome":"Olio","qta":"q.b.","per":"tutti"}]'::jsonb,
 49, null, null, 10, null, null, null,
 'Lorena: riso 70 g, 1 uovo. Ciprian: riso 100 g, 3 uova, prosciutto cotto 100 g. Il riso e'' quello cotto domenica sera, saltato in padella.'),

('2026-08-24', 'cena', 'casa', 'entrambi', 'confermato', true,
 'Torta salata zucchine, provolone e cotto',
 '[{"nome":"Pasta sfoglia","qta":"1 rotolo","per":"tutti"},
   {"nome":"Provolone","qta":"150 g","per":"tutti"},
   {"nome":"Zucchine","qta":"2","per":"tutti"},
   {"nome":"Prosciutto cotto","qta":"100 g","per":"tutti"},
   {"nome":"Uova","qta":"2","per":"ciprian"},
   {"nome":"Insalata","qta":"q.b.","per":"tutti"}]'::jsonb,
 42, null, 'Ciambella', null, null, null, 'pranzo di martedì',
 'Otto fette in tutto. Lorena: 2 fette e insalata. Ciprian: 3 fette e 2 uova sode. Le 3 fette che restano sono il pranzo di martedì.'),

-- MARTEDI 25
-- Avanzo: scala SOLO quello che si aggiunge oggi, non la torta salata, che
-- era gia' stata scalata lunedi' sera. Scalarla due volte svuoterebbe la
-- dispensa di roba che non e' mai stata usata.
('2026-08-25', 'pranzo', 'casa', 'entrambi', 'confermato', true,
 'Torta salata avanzata con insalata',
 '[{"nome":"Insalata","qta":"q.b.","per":"tutti"},
   {"nome":"Tonno","qta":"2 scatolette","per":"ciprian"}]'::jsonb,
 59, null, null, null, null, null, null,
 'Avanzo della torta salata di lunedì sera: la torta non si riscala, era già contata. Lorena: 1 fetta. Ciprian: 2 fette e tonno 160 g sgocciolato.'),

('2026-08-25', 'cena', 'casa', 'entrambi', 'confermato', true,
 'Merluzzo al forno con patate',
 '[{"nome":"Filetti di merluzzo","qta":"450 g","per":"tutti"},
   {"nome":"Patate","qta":"500 g","per":"tutti"},
   {"nome":"limoni","qta":"1","per":"tutti"},
   {"nome":"Olio","qta":"q.b.","per":"tutti"}]'::jsonb,
 59, null, 'Pesche', null,
 'Filetti di merluzzo dal freezer', '2026-08-25', null,
 'Lorena: merluzzo 150 g. Ciprian: merluzzo 300 g e patate 300 g.'),

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
 49, null, null, null, null, null, 'pranzo di giovedì',
 'Si preparano 4 burritos: 2 si mangiano oggi, 2 restano per giovedì. Lorena: 1 burrito e patatine a lato. Ciprian: 1 burrito con 150 g di pollo.'),

('2026-08-26', 'cena', 'casa', 'entrambi', 'confermato', true,
 'Polpette pronte con purè e fagiolini',
 '[{"nome":"Polpette pronte","qta":"450 g","per":"tutti"},
   {"nome":"Fiocchi di patate","qta":"q.b.","per":"tutti"},
   {"nome":"Latte","qta":"q.b.","per":"tutti"},
   {"nome":"Fagiolini","qta":"300 g","per":"tutti"},
   {"nome":"Grana","qta":"20 g","per":"ciprian"}]'::jsonb,
 49, null, 'Cioccolato', null, null, null, null,
 'Lorena: polpette 150 g. Ciprian: polpette 300 g e grana sul purè.'),

-- GIOVEDI 27
-- Avanzo: non scala niente. Il burrito era gia' stato contato mercoledi'.
('2026-08-27', 'pranzo', 'casa', 'entrambi', 'confermato', true,
 'Burrito avanzato',
 '[]'::jsonb,
 49, null, null, 10, null, null, null,
 'Avanzo di mercoledì: niente da scalare, era già contato. In forno 10 minuti avvolto nella stagnola.'),

('2026-08-27', 'cena', 'casa', 'entrambi', 'confermato', true,
 'Minestrone con ceci e crostini',
 '[{"nome":"Minestrone surgelato","qta":"600 g","per":"tutti"},
   {"nome":"Ceci cotti","qta":"1 barattolo","per":"tutti"},
   {"nome":"Pane","qta":"80 g","per":"tutti"},
   {"nome":"Petto di pollo","qta":"150 g","per":"ciprian"},
   {"nome":"Olio","qta":"q.b.","per":"tutti"}]'::jsonb,
 50, null, 'Gelato', null,
 'Petto di pollo dal freezer, per stasera', '2026-08-26', null,
 'Lorena: minestrone, ceci e crostini. Ciprian: aggiunge 150 g di petto di pollo in padella, 8 minuti. Stasera tirare fuori dal freezer il pollo per venerdì.'),

-- VENERDI 28
('2026-08-28', 'pranzo', 'casa', 'entrambi', 'confermato', true,
 'Avanzi o toast',
 '[{"nome":"Pancarré","qta":"100 g","per":"tutti"},
   {"nome":"Tonno","qta":"2 scatolette","per":"tutti"},
   {"nome":"Maionese","qta":"q.b.","per":"tutti"}]'::jsonb,
 49, null, null, null, null, null, null,
 'Voce flessibile: se ci sono avanzi si mangiano quelli. Ciprian: pancarré 4 fette, tonno 160 g sgocciolato, maionese. La verifica "Ho cucinato questo" del mattino dopo corregge a consuntivo.'),

('2026-08-28', 'cena', 'casa', 'entrambi', 'confermato', true,
 'Pollo alle erbe con patate al forno e insalata',
 '[{"nome":"Petto di pollo","qta":"400 g","per":"tutti"},
   {"nome":"Patate","qta":"500 g","per":"tutti"},
   {"nome":"Insalata","qta":"q.b.","per":"tutti"},
   {"nome":"Olio","qta":"q.b.","per":"tutti"},
   {"nome":"Erbe aromatiche","qta":"q.b.","per":"tutti"}]'::jsonb,
 63, null, 'Ciambella', null,
 'Petto di pollo dal freezer, per stasera', '2026-08-27', null,
 'Lorena: pollo 100-120 g e tanta insalata. Ciprian: pollo 250 g.');

commit;

-- CONTROLLO
-- Devi vedere 14 righe, due per ogni giorno, tutte con a_mano = true.
-- Domenica cena deve avere modo = 'libero'.
select day, pasto, modo, piatto, prot,
       jsonb_array_length(ingredienti) as ingredienti,
       a_mano
from public.plan_meals
where day between date '2026-08-22' and date '2026-08-28'
order by day, pasto desc;
