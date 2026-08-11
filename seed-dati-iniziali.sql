-- ============================================================
--  Piano & Dispensa — dati iniziali
--  Ricavati da DATI-INIZIALI.txt (fotografia dell'11/08 ore 09:00)
--
--  Da incollare nel SQL Editor di Supabase DOPO setup.sql.
--
--  🛡️  PROTEZIONE ANTI-DOPPIONI: se le tabelle contengono già
--      qualcosa, questo script non inserisce nulla. Puoi rieseguirlo
--      senza il rischio di ritrovarti tutto in doppia copia.
--      Non cancella mai niente.
-- ============================================================


-- ------------------------------------------------------------
--  INVENTARIO — 51 voci (17 frigo · 15 freezer · 19 dispensa)
-- ------------------------------------------------------------
insert into public.inventory_items (name, qty, cat)
select v.name, v.qty, v.cat
from (values
  -- ---- FRIGO (17) ----
  ('Piadine',                  '8',                                                                              'frigo'),
  ('Uova',                     '5',                                                                              'frigo'),
  ('Prosciutto cotto',         '110 g · scad. 29/8',                                                             'frigo'),
  ('Tacchino a fette',         '2×100 g · scad. 29/8',                                                           'frigo'),
  ('Mozzarelle',               '2',                                                                              'frigo'),
  ('Taleggio',                 '100 g',                                                                          'frigo'),
  ('Gentilina',                '1 porzione',                                                                     'frigo'),
  ('Yogurt greco',             '? da contare',                                                                   'frigo'),
  ('Pomodori cuore di bue',    '3',                                                                              'frigo'),
  ('Datterini',                '250 g',                                                                          'frigo'),
  ('Cetrioli',                 '? da verificare',                                                                'frigo'),
  ('Uva',                      '? da verificare',                                                                'frigo'),
  ('Carote',                   '~1 kg',                                                                          'frigo'),
  ('Zucchine',                 '2',                                                                              'frigo'),
  ('Avocado',                  '1',                                                                              'frigo'),
  ('Gnocchi',                  '2×500 g · scad. 2027',                                                           'frigo'),
  ('Base sempre in casa',      'grana · burro · speck 60 g · soia · acciughe · capperi · olive taggiasche · zenzero', 'frigo'),

  -- ---- CONGELATORE (15) ----
  ('Mezzo petto di pollo',     '350 g',                            'freezer'),
  ('Polpi',                    '2',                                'freezer'),
  ('Gamberi',                  '250 g',                            'freezer'),
  ('Hamburger',                '2×300 g',                          'freezer'),
  ('Filetti di pollo',         '370 g',                            'freezer'),
  ('Kebab di pollo',           '300 g',                            'freezer'),
  ('Piselli',                  '500 g',                            'freezer'),
  ('Fagiolini',                '500 g',                            'freezer'),
  ('Spinaci',                  '50 g',                             'freezer'),
  ('Lasagne',                  '2 conf. × 2 porzioni',             'freezer'),
  ('Panzerotti',               '250 g',                            'freezer'),
  ('Pasta di salsiccia',       '250 g',                            'freezer'),
  ('Patate da friggere',       '600 g',                            'freezer'),
  ('Panini burger',            '2',                                'freezer'),
  ('Gruvi mini',               '2',                                'freezer'),

  -- ---- DISPENSA (19) ----
  ('Tonno in vasetto',         '1 × 117 g sgocc.',                 'dispensa'),
  ('Tonno in lattina',         '62 g',                             'dispensa'),
  ('Pesto calabrese',          '185 g',                            'dispensa'),
  ('Ceci cotti',               '400 g',                            'dispensa'),
  ('Fagioli di Spagna',        '? da verificare',                  'dispensa'),
  ('Pasta',                    '5-6 confezioni',                   'dispensa'),
  ('Riso Carnaroli',           '1 kg',                             'dispensa'),
  ('Riso Roma',                '1 kg',                             'dispensa'),
  ('Passata / polpa di pomodoro', '1 kg',                          'dispensa'),
  ('Noodles',                  '600 g',                            'dispensa'),
  ('Spaghetti di riso',        '200 g',                            'dispensa'),
  ('Olive verdi',              '200 g',                            'dispensa'),
  ('Olive nere',               '100 g',                            'dispensa'),
  ('Porcini secchi',           '30 g',                             'dispensa'),
  ('Noci',                     'sì',                               'dispensa'),
  ('Salsa tartara',            '1',                                'dispensa'),
  ('Burro d''arachidi',        'sì',                               'dispensa'),
  ('Bevanda d''avena',         '500 ml',                           'dispensa'),
  ('Extra colazione',          'biscotti · crema Pan di Stelle · tè', 'dispensa')
) as v(name, qty, cat)
where not exists (select 1 from public.inventory_items);


-- ------------------------------------------------------------
--  RICETTE — 14 voci, tutte "senza voto" (pref = null)
-- ------------------------------------------------------------
insert into public.recipes (name, pref)
select v.name, v.pref
from (values
  ('Hamburger con panino e insalata',   null),
  ('Polpi, ceci e verdure',             null),
  ('Filetti di pollo soia e zenzero',   null),
  ('Gnocchi con gamberi e pesto',       null),
  ('Piadina col kebab',                 null),
  ('Insalatona di tonno',               null),
  ('Frittata di pasta (da zaino)',      null),
  ('Lasagne',                           null),
  ('Frittata di verdure al forno',      null),
  ('Omelette in piadina con tacchino',  null),
  ('Riso, pollo e piselli',             null),
  ('Bowl pollo, riso e verdure (prep)', null),
  ('Alette al forno con verdure',       null),
  ('Ravioli + secondo proteico',        null)
) as v(name, pref)
where not exists (select 1 from public.recipes);


-- ------------------------------------------------------------
--  CONTROLLO FINALE — questa query ti dice cosa è entrato.
--  Attesi: frigo 17 · freezer 15 · dispensa 19 · ricette 14
-- ------------------------------------------------------------
select cat as categoria, count(*) as quante
from public.inventory_items
group by cat
union all
select 'RICETTE', count(*) from public.recipes
order by 1;
