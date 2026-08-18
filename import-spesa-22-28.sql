-- LO SPESONE PER LA SETTIMANA 22-28 AGOSTO 2026
-- Da eseguire su Supabase: SQL Editor, incolla, Run.
-- ATTENZIONE: prima va eseguito tabelle-spesa-qta.sql, che aggiunge la
-- colonna della quantita'. Senza, questo file da' errore.
--
-- COSA FA
-- Riempie la tab Spesa con lo spesone. Ogni riga porta due cose in piu'
-- del solo nome: QUANTO comprarne, e PER QUANDO serve.
--
-- L'ORDINE DELLA LISTA
-- L'app mette in cima quello che serve prima. Le voci senza data (caffe',
-- zucchero, carta forno: la roba che non aspetta nessun pasto) vanno in
-- fondo. E' l'ordine in cui conviene guardare gli scaffali.
--
-- I NOMI
-- Sono scritti come li usa il piano, non come vengono in mente. E' cio'
-- che fa sparire gli avvisi "ti manca" man mano che compri, e che permette
-- di spuntare una riga e mandarla in dispensa col nome giusto.
-- Il riso non c'e': e' gia' in dispensa, ed e' voluto.
--
-- QUESTO NON CANCELLA NIENTE
-- Aggiunge in fondo a quello che c'e' gia'. Se una riga con lo stesso nome
-- esiste gia', viene saltata invece di essere duplicata.

begin;

insert into public.shopping_list (name, qta, serve_il, done)
select v.name, v.qta, v.serve_il, false
from (values

-- Freezer
  ('Gelato',                '2 vaschette',  date '2026-08-22'),
  ('Filetti di merluzzo',   '450-500 g',     date '2026-08-25'),
  ('Fagiolini',             '300 g',         date '2026-08-26'),
  ('Minestrone surgelato',  '600 g',         date '2026-08-27'),
  ('Piselli',               '200 g',         date '2026-08-24'),
  ('Pizza surgelata',       '1, di scorta',  null),

-- Dispensa
  ('Pasta',                 '500 g, corta',  date '2026-08-23'),
  ('Passata / polpa di pomodoro', '700 g di passata piu'' 1 barattolo di polpa', date '2026-08-23'),
  ('Tonno',                 '8 scatolette da 80 g',  date '2026-08-22'),
  ('Patatine',              '2 sacchetti',   date '2026-08-22'),
  ('Salsa di soia',         '1',             date '2026-08-24'),
  ('Tortillas',             '6-8, grandi',   date '2026-08-26'),
  ('Fagioli',               '1 barattolo, neri o rossi', date '2026-08-26'),
  -- Non era nel tuo elenco, ma lunedi' sera la torta salata non si fa
  -- senza: senza questa riga il piano resterebbe con un buco.
  ('Pasta sfoglia',         '1 rotolo',      date '2026-08-24'),
  ('Maionese',              '1',             date '2026-08-26'),
  ('Fiocchi di patate',     'per il pure''', date '2026-08-26'),
  ('Ceci cotti',            '1 barattolo',   date '2026-08-27'),
  ('Cioccolato',            '1',             date '2026-08-26'),
  ('Mais',                  '1 barattolo',   null),
  ('Olive nere',            '1 barattolo',   null),
  ('Pastina',               '1 pacco',       null),
  ('Brodo granulare',       '1',             null),
  ('Crackers o fette biscottate', '1',       null),
  ('Miele',                 '1',             null),
  ('Marmellata',            '1',             null),
  ('Biscotti',              '1',             null),
  ('Budini',                '2-3',           null),
  ('Farina',                '500 g',         null),
  ('Zucchero',              '1',             null),
  ('Lievito per dolci',     '1 bustina',     null),
  ('Caffe''',               '1',             null),
  ('The o camomilla',       '1',             null),
  ('Avena',                 '1 kg',          null),
  ('Carta forno',           '1',             null),

-- Fresco e banco frigo
  ('Pane',                  'morbido, meta'' da congelare a fette', date '2026-08-22'),
  ('Prosciutto crudo',      '200 g',         date '2026-08-22'),
  ('Mozzarelle',            '2-3',           date '2026-08-22'),
  ('Stracchino',            '120 g',         date '2026-08-22'),
  ('Zucchine',              '5-6',           date '2026-08-22'),
  ('Melanzane',             '1-2',           date '2026-08-22'),
  ('Carote',                '4',             date '2026-08-22'),
  ('Patate',                '2 kg',          date '2026-08-22'),
  ('Cipolle',               '2-3',           date '2026-08-22'),
  ('Uova',                  '12',            date '2026-08-23'),
  ('Parmigiano',            '1 pezzo da grattugiare', date '2026-08-23'),
  ('Basilico',              '1 mazzo',       date '2026-08-23'),
  ('Prosciutto cotto',      '250 g',         date '2026-08-24'),
  ('Provolone',             '200 g',         date '2026-08-24'),
  ('Insalata',              '2-3',           date '2026-08-24'),
  ('limoni',                '2',             date '2026-08-25'),
  ('Pesche',                'per il tocco dolce', date '2026-08-25'),
  ('Pulled chicken',        '2 confezioni',  date '2026-08-26'),
  ('Cheddar',               '100-150 g',     date '2026-08-26'),
  ('Polpette pronte',       '450-500 g',     date '2026-08-26'),
  ('Latte',                 '2-3 litri',     date '2026-08-26'),
  ('Petto di pollo',        '650 g, di cui 550 g da congelare subito', date '2026-08-27'),
  ('Pancarré',              '1',             date '2026-08-28'),
  ('Erbe aromatiche',       'q.b.',          date '2026-08-28'),
  ('Yogurt greco',          '2 kg',          null),
  ('Yogurt bianco',         '1 vasetto',     null),
  ('Avocado',               '2-3',           null),
  ('Banane',                '1 casco',       null),
  ('Albicocche o uva',      'q.b.',          null)

) as v(name, qta, serve_il)
where not exists (
  select 1 from public.shopping_list s where lower(s.name) = lower(v.name)
);

commit;

-- CONTROLLO
-- La lista in ordine di quando serve, come la vedrai nell'app.
select serve_il, name, qta
from public.shopping_list
where done = false
order by serve_il nulls last, name;
