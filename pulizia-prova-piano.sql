-- Piano & Dispensa — via la settimana finta di collaudo
-- Da incollare nel SQL Editor di Supabase e premere RUN.
--
-- PERCHE' SERVE
-- Il 13/08/2026 e' saltato fuori che la settimana di prova caricata con
-- prova-piano-v5.sql era ancora nel database: nel calendario si vedevano
-- piatti finti che sembravano veri.
--
-- COSA CANCELLA — e cosa NON cancella
-- Solo le righe che hanno ESATTAMENTE i nomi dei piatti finti scritti qui
-- sotto. Un piatto generato davvero non ha nessuno di questi nomi, quindi
-- non puo' essere toccato per sbaglio. Se piu' avanti generi davvero un
-- "Riso, tonno e piselli", questo file non lo tocchera' comunque: cancella
-- solo nei giorni 11-17 agosto 2026.
--
-- Puoi rieseguirlo quante volte vuoi: la seconda volta non trova piu' niente.

-- 1) GUARDA PRIMA COSA STAI PER CANCELLARE
--    Esegui il file: questo elenco compare in fondo, nel primo risultato.
--    Se qui vedi un piatto che NON e' finto, fermati e dimmelo.

select day, pasto, chi, piatto
  from public.plan_meals
 where day between date '2026-08-11' and date '2026-08-17'
   and piatto in (
     'Frittata di zucchine con insalata e pane',
     'Frittata di zucchine con insalata',
     'Riso, tonno e piselli',
     'Ceci con feta e verdure grigliate',
     'Petto di pollo al limone con riso e piselli',
     'Pollo al limone avanzato, con riso e insalata',
     'Merluzzo al forno con patate',
     'Uova strapazzate con spinaci e pane integrale',
     'Pasta con pesto di zucchine e ricotta',
     'Hamburger di manzo con insalata e patate',
     'Vellutata di zucca con crostini'
   )
 order by day, pasto;

-- 2) E ADESSO CANCELLA
--    Stesse condizioni identiche del controllo qui sopra.

delete from public.plan_meals
 where day between date '2026-08-11' and date '2026-08-17'
   and piatto in (
     'Frittata di zucchine con insalata e pane',
     'Frittata di zucchine con insalata',
     'Riso, tonno e piselli',
     'Ceci con feta e verdure grigliate',
     'Petto di pollo al limone con riso e piselli',
     'Pollo al limone avanzato, con riso e insalata',
     'Merluzzo al forno con patate',
     'Uova strapazzate con spinaci e pane integrale',
     'Pasta con pesto di zucchine e ricotta',
     'Hamburger di manzo con insalata e patate',
     'Vellutata di zucca con crostini'
   );

-- 3) I DUE GIORNI SENZA PIATTO
--    Nella settimana finta c'erano anche un pranzo "fuori" (il 14) e una
--    cena "libera" (il 15): non hanno un nome di piatto, quindi le due
--    condizioni qui sopra non le prendono. Si tolgono per data, ma solo
--    se sono rimaste vuote come le aveva lasciate il file di prova.

delete from public.plan_meals
 where day between date '2026-08-11' and date '2026-08-17'
   and modo in ('fuori','libero')
   and piatto is null
   and nota in (
     'Pranzo fuori, siamo invitati.',
     'Uno dei due pasti liberi della settimana.'
   );

-- CONTROLLO FINALE
-- Deve rispondere 0 righe, o solo i pasti che hai generato davvero.

select day, pasto, modo, chi, coalesce(piatto, '(senza piatto)') as piatto
  from public.plan_meals
 where day between date '2026-08-11' and date '2026-08-17'
 order by day, pasto;
