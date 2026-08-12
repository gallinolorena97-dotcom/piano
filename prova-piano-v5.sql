-- Piano & Dispensa — UNA SETTIMANA FINTA per provare il calendario
--
-- ⚠️ Questo file mette dentro dei DATI DI PROVA, non dati veri.
--    Serve solo a vedere il calendario funzionare finche' non c'e'
--    "Genera la settimana" (arriva col Blocco 2).
--    In fondo al file c'e' scritto come toglierli.
--
-- Da incollare nel SQL Editor di Supabase e premere RUN.
-- I giorni si calcolano da soli a partire da oggi, quindi va bene
-- eseguirlo in qualsiasi momento.
--
-- Prima di questo devi aver eseguito tabelle-piano-v5.sql.

-- La settimana di prova copre apposta tutti i casi:
--   ieri        due pasti gia' passati
--   oggi        pranzo insieme + cena di solo Ciprian che cucina doppio
--   domani      il pranzo e' l'avanzo di ieri sera, mangiato da tutti e due
--   fra 2 gg    un pranzo FUORI
--   fra 3 gg    una cena LIBERA
--   fra 4 gg    un pasto che DIPENDE DALLA SPESA
--   fra 5 gg    un pranzo di sola Lorena (senza numeri) e nessuna cena
--   fra 6 gg    giornata ancora vuota

insert into public.plan_meals
  (day, pasto, modo, chi, stato, piatto, perche, ingredienti, dolce, tempo,
   prot, kcal, scongelamento, scongelare_il, avanzo_per, dipende_da_spesa, nota)
values

  (current_date - 1, 'pranzo', 'casa', 'entrambi', 'passato',
   'Frittata di zucchine con insalata e pane',
   'Zucchine da finire prima che passassero.',
   '[{"nome":"Uova","qta":"3","per":"ciprian"},
     {"nome":"Uova","qta":"2","per":"lorena"},
     {"nome":"Zucchine","qta":"200 g","per":"tutti"},
     {"nome":"Pane integrale","qta":"60 g","per":"tutti"}]'::jsonb,
   'Yogurt bianco con miele', 20, 38, 590, null, null, null, false, null),

  (current_date - 1, 'cena', 'casa', 'ciprian', 'passato',
   'Riso, tonno e piselli', null,
   '[{"nome":"Riso","qta":"80 g","per":"ciprian"},
     {"nome":"Tonno al naturale","qta":"160 g","per":"ciprian"},
     {"nome":"Piselli","qta":"150 g","per":"ciprian"}]'::jsonb,
   null, 15, 55, 640, null, null, null, false, null),

  (current_date, 'pranzo', 'casa', 'entrambi', 'confermato',
   'Ceci con feta e verdure grigliate',
   'Usa la feta aperta, che scade fra poco.',
   '[{"nome":"Ceci lessati","qta":"200 g","per":"ciprian"},
     {"nome":"Ceci lessati","qta":"120 g","per":"lorena"},
     {"nome":"Feta","qta":"60 g","per":"tutti"},
     {"nome":"Zucchine e melanzane","qta":"250 g","per":"tutti"}]'::jsonb,
   'Due quadretti di cioccolato fondente', 20, 46, 620,
   null, null, null, false, null),

  (current_date, 'cena', 'casa', 'ciprian', 'confermato',
   'Petto di pollo al limone con riso e piselli',
   'Cucino il doppio: meta'' resta per il pranzo di domani.',
   '[{"nome":"Petto di pollo","qta":"300 g","per":"ciprian"},
     {"nome":"Riso","qta":"120 g","per":"ciprian"},
     {"nome":"Piselli","qta":"200 g","per":"ciprian"}]'::jsonb,
   null, 30, 62, 720, null, null,
   'pranzo di domani, per tutti e due', false, null),

  (current_date + 1, 'pranzo', 'casa', 'entrambi', 'confermato',
   'Pollo al limone avanzato, con riso e insalata',
   'Nessun vincolo di Lorena toccato: niente pomodoro crudo ne'' cetrioli.',
   '[{"nome":"Pollo e riso avanzati","qta":"la meta'' cucinata ieri sera","per":"tutti"},
     {"nome":"Insalata","qta":"un piatto","per":"tutti"}]'::jsonb,
   'Mela cotta con cannella', 5, 44, 590, null, null, null, false,
   'Arriva dalla cena di ieri: non c''e'' niente da cucinare.'),

  (current_date + 1, 'cena', 'casa', 'entrambi', 'confermato',
   'Merluzzo al forno con patate', null,
   '[{"nome":"Filetti di merluzzo","qta":"250 g","per":"ciprian"},
     {"nome":"Filetti di merluzzo","qta":"150 g","per":"lorena"},
     {"nome":"Patate","qta":"400 g","per":"tutti"}]'::jsonb,
   null, 35, 50, 660,
   'Sposta il merluzzo dal freezer al frigo', current_date,
   null, false, null),

  (current_date + 2, 'pranzo', 'fuori', 'entrambi', 'bozza',
   null, null, '[]'::jsonb, null, null, null, null, null, null, null, false,
   'Pranzo fuori, siamo invitati.'),

  (current_date + 2, 'cena', 'casa', 'ciprian', 'bozza',
   'Uova strapazzate con spinaci e pane integrale', null,
   '[{"nome":"Uova","qta":"4","per":"ciprian"},
     {"nome":"Spinaci","qta":"200 g","per":"ciprian"},
     {"nome":"Pane integrale","qta":"80 g","per":"ciprian"}]'::jsonb,
   null, 15, 40, 560, null, null, null, false, null),

  (current_date + 3, 'pranzo', 'casa', 'ciprian', 'bozza',
   'Riso, tonno e piselli',
   'Per lui ripetere va bene: e'' veloce e centra le proteine.',
   '[{"nome":"Riso","qta":"80 g","per":"ciprian"},
     {"nome":"Tonno al naturale","qta":"160 g","per":"ciprian"},
     {"nome":"Piselli","qta":"150 g","per":"ciprian"}]'::jsonb,
   null, 15, 58, 690, null, null, null, false, null),

  (current_date + 3, 'cena', 'libero', 'entrambi', 'bozza',
   null, null, '[]'::jsonb, null, null, null, null, null, null, null, false,
   'Uno dei due pasti liberi della settimana.'),

  (current_date + 4, 'pranzo', 'casa', 'entrambi', 'bozza',
   'Pasta con pesto di zucchine e ricotta', null,
   '[{"nome":"Pasta","qta":"100 g","per":"ciprian"},
     {"nome":"Pasta","qta":"70 g","per":"lorena"},
     {"nome":"Zucchine","qta":"300 g","per":"tutti"},
     {"nome":"Ricotta","qta":"150 g","per":"tutti"}]'::jsonb,
   null, 25, 32, 640, null, null, null, true,
   'Manca la ricotta: e'' in lista della spesa.'),

  (current_date + 4, 'cena', 'casa', 'ciprian', 'bozza',
   'Hamburger di manzo con insalata e patate', null,
   '[{"nome":"Hamburger di manzo","qta":"250 g","per":"ciprian"},
     {"nome":"Patate","qta":"300 g","per":"ciprian"}]'::jsonb,
   null, 25, 52, 700,
   'Sposta gli hamburger dal freezer al frigo', current_date + 3,
   null, false, null),

  (current_date + 5, 'pranzo', 'casa', 'lorena', 'bozza',
   'Vellutata di zucca con crostini',
   'Pochi ingredienti, come piace a lei.',
   '[{"nome":"Zucca","qta":"350 g","per":"lorena"},
     {"nome":"Pane per crostini","qta":"50 g","per":"lorena"}]'::jsonb,
   'Due biscotti secchi', 30, null, null, null, null, null, false, null)

on conflict (day, pasto) do nothing;

-- Due righe nel diario, per far vedere che i giorni PASSATI mostrano
-- quello che si e' mangiato davvero e non il piano.

insert into public.meals_log (day, pasto, piatto, prot, kcal)
values
  (current_date - 1, 'pranzo', 'Frittata di zucchine con insalata', 38, 590),
  (current_date - 1, 'cena',   'Riso, tonno e piselli',             55, 640);

-- CONTROLLO FINALE
-- Devi vedere 13 righe, da ieri a fra 5 giorni.

select day, pasto, modo, chi, stato, piatto
from public.plan_meals
order by day, pasto desc;

-- COME TOGLIERE I DATI DI PROVA
-- Togli i due trattini davanti alle due righe qui sotto ed esegui.
-- ⚠️ Cancellano TUTTI i pasti da ieri a fra 6 giorni e le due righe di
--    diario di ieri: falle solo finche' non hai un piano vero.
--
-- delete from public.plan_meals where day between current_date - 1 and current_date + 6;
-- delete from public.meals_log  where day = current_date - 1
--   and piatto in ('Frittata di zucchine con insalata', 'Riso, tonno e piselli');
