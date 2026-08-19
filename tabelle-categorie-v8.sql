-- V8 BLOCCO 1 — LA CATEGORIA ALIMENTARE
-- Da eseguire su Supabase: SQL Editor, incolla, Run.
-- Si puo' rieseguire quante volte si vuole.
--
-- COSA FA
-- 1. Aggiunge a ogni voce di dispensa la colonna "categoria": che COSA e'
--    quella cosa (pesce, legumi, latticini...).
-- 2. Assegna la categoria alle voci che c'erano il 19/08/2026, quelle che
--    hai approvato in chat.
--
-- ⚠️ LA CATEGORIA NON SOSTITUISCE LA POSIZIONE, si aggiunge.
--    "cat" (frigo / freezer / dispensa) dice DOVE sta una cosa, e continua
--    a comandare scongelamenti e deperibili: non viene toccata.
--    "categoria" dice CHE COSA e', e serve a tutt'altro: le sostituzioni
--    fra cose simili e le frequenze settimanali. Sono due domande diverse
--    e vanno tenute separate: il salmone sta in freezer oggi e in frigo
--    domani, ma resta pesce.
--
-- ⚠️ LA COLONNA E' FACOLTATIVA e resta vuota per le voci nuove finche'
--    qualcuno non sceglie. Un "altro" messo d'ufficio sarebbe una risposta
--    inventata, e le frequenze ci conterebbero sopra.
--
-- LE QUATTORDICI CATEGORIE
--   pesce · carne bianca · carne rossa · salumi · uova · latticini ·
--   legumi · cereali e carboidrati · verdura · frutta · frutta secca e semi ·
--   condimenti e grassi · dolci · altro
--
-- ⚠️ Non c'e' un vincolo sui valori, ed e' voluto: aggiungere una categoria
--    un domani non deve costringere a una migrazione. A tenerle pulite
--    pensa il menu a tendina dell'app, che e' l'unico modo per scriverle.

begin;

alter table public.inventory_items
  add column if not exists categoria text;

comment on column public.inventory_items.categoria is
  'CHE COSA e'' l''alimento (pesce, legumi, latticini...). Da non confondere '
  'con "cat", che dice DOVE sta (frigo/freezer/dispensa). La categoria guida '
  'sostituzioni e frequenze; la posizione guida scongelamenti e scadenze.';

-- LA MIGRAZIONE
-- Solo le voci che esistevano il 19/08/2026. Se una l'hai cancellata nel
-- frattempo, la sua riga qui non trova niente e non succede niente.
-- ⚠️ Non sovrascrive una categoria gia' scritta: se hai gia' corretto
--    qualcosa dall'app, resta come l'hai messa tu.

update public.inventory_items t
   set categoria = v.categoria
  from (values

  -- pesce
    ('Trancio salmone',                     'pesce'),
    ('Salmone affumicato',                  'pesce'),
    ('Tonno affumicato',                    'pesce'),

  -- carne bianca
    ('Filetti di pollo',                    'carne bianca'),
    ('Kebab di pollo',                      'carne bianca'),
    ('Fesa tacchino',                       'carne bianca'),

  -- carne rossa
    ('Pulled pork',                         'carne rossa'),

  -- salumi
    ('Prosciutto cotto',                    'salumi'),
    ('Prosciutto crudo',                    'salumi'),
    ('Prosciutto cubetti',                  'salumi'),
    ('Bresaola',                            'salumi'),

  -- uova
    ('Uova',                                'uova'),

  -- latticini
    ('Mozzarella',                          'latticini'),
    ('Scamorza',                            'latticini'),
    ('Cheddar 250)',                        'latticini'),
    ('Stracchino',                          'latticini'),
    ('Ricottina',                           'latticini'),
    ('Parmigiano grattugiato',              'latticini'),
    ('Yogurt greco',                        'latticini'),
    ('Kefir',                               'latticini'),

  -- legumi
    ('Ceci cotti',                          'legumi'),
    ('Fagioli neri',                        'legumi'),
    ('Piselli',                             'legumi'),

  -- cereali e carboidrati
    ('Pasta',                               'cereali e carboidrati'),
    ('Riso Roma',                           'cereali e carboidrati'),
    ('Riso Carnaroli',                      'cereali e carboidrati'),
    ('Noodles',                             'cereali e carboidrati'),
    ('Spaghetti di riso',                   'cereali e carboidrati'),
    ('Gnocchi',                             'cereali e carboidrati'),
    ('Piadine',                             'cereali e carboidrati'),
    ('Panini burger',                       'cereali e carboidrati'),
    ('pasta sfoglia',                       'cereali e carboidrati'),
    ('Patate crude',                        'cereali e carboidrati'),
    ('Patate da friggere',                  'cereali e carboidrati'),
    ('Patate per friggitrice ad aria',      'cereali e carboidrati'),

  -- verdura
    ('Carote',                              'verdura'),
    ('Zucchine',                            'verdura'),
    ('Spinaci',                             'verdura'),
    ('Fagiolini',                           'verdura'),
    ('Cipolle bianche e scalogno',          'verdura'),
    ('Pomodori cuore di bue',               'verdura'),
    ('Porcini secchi',                      'verdura'),

  -- frutta
    ('Pesche gialle',                       'frutta'),
    ('Kiwi gold',                           'frutta'),
    ('Uva',                                 'frutta'),
    ('limoni',                              'frutta'),
    ('Lime',                                'frutta'),

  -- frutta secca e semi
    ('Noci',                                'frutta secca e semi'),
    ('Burro d''arachidi',                   'frutta secca e semi'),

  -- condimenti e grassi
    ('Passata / polpa di pomodoro',         'condimenti e grassi'),
    ('Passata pomodori',                    'condimenti e grassi'),
    ('Pesto calabrese',                     'condimenti e grassi'),
    ('Salsa tartara',                       'condimenti e grassi'),
    ('Olive nere',                          'condimenti e grassi'),

  -- dolci
    ('Grisbi',                              'dolci'),

  -- altro
    ('Base sempre in casa',                 'altro'),
    ('Extra colazione',                     'altro'),
    ('Bevanda d''avena',                    'altro'),
    ('Lasagne alla bolognese fatte da me',  'altro')

  ) as v(name, categoria)
 where t.name = v.name
   and t.categoria is null;

commit;

-- CONTROLLO
-- Quante voci per categoria, e in fondo quelle rimaste senza.
-- Se qui sotto compare una riga con categoria vuota, e' una voce aggiunta
-- dopo il 19/08: la scegli dall'app, in Dispensa.
select coalesce(categoria, '(da scegliere)') as categoria,
       count(*) as quante,
       string_agg(name, ' · ' order by name) as voci
  from public.inventory_items
 group by 1
 order by (categoria is null), 1;
