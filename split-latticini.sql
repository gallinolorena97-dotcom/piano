-- ============================================================
-- «latticini» si spacca in due: formaggi · latticini freschi
-- 20/08/2026 — Giro 1, Blocco 2
--
-- ⚠️ GIÀ ESEGUITO il 20/08/2026, non dall'SQL Editor ma dall'app
--    (le stesse scritture, fatte con la chiave publishable). Sta qui
--    come storia e per poter ricostruire il database da zero.
--    NON serve rieseguirlo: è comunque scritto per essere rieseguibile
--    senza danni.
--
-- PERCHÉ. Con una categoria sola l'app proponeva lo yogurt greco al posto
-- del provolone. Un formaggio è un piatto, e la nutrizionista ne conta al
-- massimo uno a settimana; uno yogurt è una colazione e non conta niente.
-- Erano due cose diverse tenute insieme da un nome — e la vecchia riga
-- delle frequenze lo diceva già in una nota («solo come PIATTO: yogurt,
-- kefir e latte non contano»), cioè con le parole invece che con lo schema.
--
-- ⚠️ Burro e panna NON stanno in nessuna delle due: sono «condimenti e
--    grassi». È grasso di cottura, e con «latticini freschi» acceso fra i
--    sostituibili tenerli di là voleva dire proporre il kefir al posto del
--    burro. In dispensa non c'è nessuna voce che si chiami così (il burro
--    sta dentro la quantità di «Base sempre in casa»), quindi qui non c'è
--    niente da spostare: la scelta vive nel dizionario dentro index.html.
-- ============================================================

-- 1 · Le voci di dispensa. Sei formaggi e due latticini freschi.
update inventory_items set categoria = 'formaggi'
 where name in ('Mozzarella', 'Scamorza affumicata', 'Stracchino',
                'Ricottina', 'Parmigiano grattugiato', 'Cheddar 250)');

update inventory_items set categoria = 'latticini freschi'
 where name in ('Kefir', 'Yogurt greco');

-- 2 · La griglia delle frequenze. Il tetto di 1 a settimana RESTA, e resta
--     sui formaggi: era lì che aveva senso anche prima.
update frequenze_categorie
   set categoria = 'formaggi',
       nota = 'come piatto: il tetto e sul formaggio, non sullo yogurt'
 where categoria = 'latticini';

insert into frequenze_categorie (categoria, min_sett, max_sett, rotazione_max, nota)
values ('latticini freschi', null, null, null,
        'yogurt, kefir, latte: nessun vincolo, non sono un piatto')
on conflict (categoria) do nothing;

-- 3 · I pasti. Niente da fare: al 20/08/2026 `plan_meals.categoria_principale`
--     è vuoto su TUTTE le righe — il generatore non ha ancora mai girato con
--     quella colonna. Se un domani si rieseguisse questo file dopo che il
--     campo è stato riempito, servirebbe anche:
--
--     update plan_meals set categoria_principale = 'formaggi'
--      where categoria_principale = 'latticini';
--
--     ⚠️ e sarebbe una scelta da fare a mano pasto per pasto, non in blocco:
--     un pasto contato come «latticini» poteva essere una cena di formaggio
--     (che va nei formaggi e consuma il tetto) o uno yogurt (che non conta).
--     Deciderlo con una riga di SQL vorrebbe dire inventare.
