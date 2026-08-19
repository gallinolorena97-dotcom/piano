-- LO SPESONE PER LA SETTIMANA 22-28 AGOSTO 2026 — VERSIONE NUOVA
-- Da eseguire su Supabase: SQL Editor, incolla, Run.
--
-- PERCHE' UN FILE NUOVO
-- Il 18 agosto era gia' stato caricato uno spesone per questa settimana.
-- Il piano pero' e' cambiato: domenica a pranzo entrano le fettine di
-- vitello, mercoledi' sera la polenta al posto del pure', giovedi' sera la
-- zuppa di lenticchie al posto del minestrone, e venerdi' cambiano tutti e
-- due i pasti. Questo file porta la lista alla versione di oggi.
--
-- COSA FA, IN TRE MOSSE
-- 1. TOGLIE dalla lista dieci voci che servivano solo al piano vecchio.
--    Sono elencate qui sotto una per una: se una ti serve lo stesso,
--    cancella la sua riga prima di premere Run.
-- 2. AGGIORNA quantita' e data delle voci che c'erano gia'.
-- 3. AGGIUNGE le voci nuove.
--
-- COSA NON TOCCA
-- Le voci scritte da te a mano restano dove sono: Prezzemolo, Limone,
-- cipolla, Bicarbonato, Tonno in scatola. L'unica tua che cambia e' Uova,
-- che prende la quantita' (12) e la data: era senza.
-- Le voci gia' spuntate non vengono mai cancellate.
--
-- IL RISO NON C'E', ED E' VOLUTO
-- Il piano ne usa circa 290 g e in dispensa c'e' 1 kg di Riso Roma.

begin;

-- 1) LE DIECI VOCI DEL PIANO VECCHIO CHE ESCONO
--    Minestrone surgelato  la cena di giovedi' ora e' zuppa di lenticchie
--    Ceci cotti            stessa cena, e in dispensa ce ne sono gia' 250 g
--    Fiocchi di patate     mercoledi' sera e' polenta, non pure'
--    Pancarre'             il pranzo di venerdi' ora e' pasta in bianco
--    Avena                 rientra sotto il nome giusto, Farina di avena
--    Mais, Olive nere, Avocado, Albicocche o uva, Yogurt bianco
--                          erano scorte del piano vecchio, non di questo

delete from public.shopping_list
 where done = false
   and name in ('Minestrone surgelato', 'Ceci cotti', 'Fiocchi di patate',
                'Pancarré', 'Avena', 'Mais', 'Olive nere', 'Avocado',
                'Albicocche o uva', 'Yogurt bianco');

-- 2) e 3) LA LISTA DI OGGI
--    Ogni riga ha il nome (che e' la chiave con cui l'app collega spesa,
--    piano e dispensa), QUANTO comprarne e PER QUANDO serve.
--    La data e' quella del primo pasto che aspetta quella cosa: e' cosi'
--    che la lista si ordina da se'. Le voci senza data (colazione, dolci,
--    scorte) vanno in fondo, e si comprano stasera come tutto il resto.

with nuovo(name, qta, serve_il) as (
  values

  -- Freezer
    ('Gelato'::text,                '2 vaschette, gusti diversi'::text, date '2026-08-22'),
    ('Fagiolini',                   '600 g surgelati',                  date '2026-08-26'),
    ('Piselli',                     '1 busta da 300 g',                 date '2026-08-24'),
    ('Filetti di merluzzo',         '500 g surgelati',                  date '2026-08-25'),
    ('Pizza surgelata',             '1, scorta di emergenza',           null::date),

  -- Dispensa
    ('Pasta',                       '1 kg, corta',                      date '2026-08-23'),
    ('Pastina',                     '1 confezione da 250 g',            date '2026-08-27'),
    ('Passata / polpa di pomodoro', '1 bottiglia di passata da 700 g',  date '2026-08-23'),
    ('Polenta istantanea',          '1 confezione',                     date '2026-08-26'),
    ('Farro perlato',               '250 g',                            date '2026-08-28'),
    ('Tortillas',                   '1 confezione da 6, grandi',        date '2026-08-26'),
    ('Fagioli',                     '1 barattolo, neri o rossi',        date '2026-08-26'),
    ('Lenticchie',                  '2 barattoli da 400 g',             date '2026-08-27'),
    ('Tonno',                       '6 scatolette da 120 g',            date '2026-08-22'),
    ('Olio',                        '1 litro, extravergine di oliva',   date '2026-08-22'),
    ('Salsa di soia',               '1 bottiglietta',                   date '2026-08-24'),
    ('Maionese',                    '1 tubetto',                        date '2026-08-26'),
    ('Brodo granulare',             '1 barattolo',                      date '2026-08-27'),
    ('Stagnola',                    '1 rotolo, per i burritos',         date '2026-08-27'),
    ('Farina di avena',             '500 g',                            null::date),
    ('Semi di chia',                '1 confezione da 200 g',            null::date),
    ('Burro d''arachidi',           '1 barattolo da 350 g',             null::date),
    ('Zucchero',                    '1 kg',                             null::date),
    ('Patatine',                    '2 sacchetti',                      date '2026-08-22'),
    ('Crackers o fette biscottate', '1 confezione',                     null::date),
    ('Miele',                       '1 vasetto',                        null::date),
    ('Marmellata',                  '1 vasetto',                        null::date),
    ('Biscotti',                    '1 confezione',                     null::date),
    ('Cioccolato',                  '1 tavoletta, fondente',            null::date),
    ('Budini',                      '3',                                null::date),
    ('Farina',                      '500 g, tipo 00 (ciambella facoltativa)',   null::date),
    ('Lievito per dolci',           '1 bustina (ciambella facoltativa)',        null::date),
    ('Caffe''',                     '1 confezione, se manca',           null::date),
    ('The o camomilla',             '1 scatola, se manca',              null::date),
    ('Carta forno',                 '1 rotolo',                         null::date),

  -- Fresco e banco frigo
    ('Uova',                        '12',                               date '2026-08-24'),
    ('Latte',                       '2 litri',                          null::date),
    ('Yogurt greco',                '1,5 kg, magro',                    null::date),
    ('Parmigiano',                  '250 g in pezzo (va bene anche il grana)',  date '2026-08-23'),
    ('Provolone',                   '150 g',                            date '2026-08-24'),
    ('Stracchino',                  '150 g',                            date '2026-08-22'),
    ('Cheddar',                     '100 g',                            date '2026-08-26'),
    ('Mozzarelle',                  '2 da 125 g',                       date '2026-08-22'),
    ('Prosciutto crudo',            '150 g',                            date '2026-08-22'),
    ('Prosciutto cotto',            '250 g',                            date '2026-08-24'),
    ('Prosciutto cotto magro',      '200 g',                            date '2026-08-28'),
    ('Pulled chicken',              '2 confezioni, circa 500 g',        date '2026-08-26'),
    ('Polpette pronte',             '500 g',                            date '2026-08-26'),
    ('Fettine di vitello',          '400 g',                            date '2026-08-23'),
    ('Petto di pollo',              '500 g, porzionare e congelare subito',     date '2026-08-24'),
    ('Straccetti di tacchino',      '350 g',                            date '2026-08-28'),
    ('Pasta sfoglia',               '1 rotolo rettangolare',            date '2026-08-24'),
    ('Pane',                        '500 g morbido, meta'' da congelare a fette', date '2026-08-22'),

  -- Ortofrutta
    ('Zucchine',                    '4',                                date '2026-08-22'),
    ('Melanzane',                   '1',                                date '2026-08-22'),
    ('Carote',                      '8',                                date '2026-08-22'),
    ('Patate',                      '1,5 kg',                           date '2026-08-22'),
    ('Cipolle',                     '2',                                date '2026-08-22'),
    ('Insalata',                    '2 buste',                          date '2026-08-24'),
    ('Finocchi',                    '2',                                date '2026-08-25'),
    ('limoni',                      '3',                                date '2026-08-25'),
    ('Basilico',                    '1 mazzetto',                       date '2026-08-23'),
    ('Erbe aromatiche',             '1 mazzetto, rosmarino o altre erbe',       date '2026-08-28'),
    ('More o ribes',                '2 vaschette (in alternativa banana a fette)', null::date),
    ('Pesche',                      '6',                                null::date),
    ('Mele',                        '4',                                null::date),
    ('Banane',                      '6',                                null::date)

),

-- Le voci che c'erano gia' cambiano solo quantita' e data. La spunta no:
-- se hai gia' preso qualcosa, resta presa.
aggiornate as (
  update public.shopping_list s
     set qta      = n.qta,
         serve_il = n.serve_il
    from nuovo n
   where lower(s.name) = lower(n.name)
  returning s.id
)

insert into public.shopping_list (name, qta, serve_il, done)
select n.name, n.qta, n.serve_il, false
  from nuovo n
 where not exists (
   select 1 from public.shopping_list s
    where lower(s.name) = lower(n.name)
 );

commit;

-- CONTROLLO
-- La lista in ordine di quando serve, come la vedrai nell'app.
-- Ogni riga deve avere una quantita' accanto al nome, tranne le cinque
-- voci scritte da te a mano.
select serve_il, name, qta
  from public.shopping_list
 where done = false
 order by serve_il nulls last, name;
