-- QUANTO NE DEVO COMPRARE
-- Da eseguire su Supabase: SQL Editor, incolla, Run.
-- Si puo' rieseguire quante volte si vuole: non cancella niente.
--
-- PERCHE'
-- La lista della spesa aveva solo il NOME. Per due o tre cose aggiunte al
-- volo va benissimo, per uno spesone settimanale no: "uova" e "uova 12"
-- sono due spese diverse.
--
-- ATTENZIONE, LA QUANTITA' NON PUO' STARE DENTRO AL NOME
-- Il nome e' la chiave con cui l'app riconosce le cose: e' con quello che
-- capisce che il "Pane" del piano e il "Pane" della spesa sono la stessa
-- cosa, e che quando spunti la riga puo' proporti di metterla in dispensa
-- con quel nome. Scrivere "Pane morbido 1 kg" romperebbe tutti e due i
-- collegamenti: il piano continuerebbe a segnalare il pane come mancante,
-- e in dispensa finirebbe una voce chiamata "Pane morbido 1 kg" che non
-- corrisponde a niente.
-- Per questo la quantita' ha una colonna sua.

alter table public.shopping_list
  add column if not exists qta text;

comment on column public.shopping_list.qta is
  'Quanto comprarne, come testo libero: "12", "2 kg", "2-3 confezioni". NULL = non specificato, e la riga si comporta come prima. NON va mai messa dentro name: il nome e'' la chiave che collega spesa, piano e dispensa.';

-- CONTROLLO
select name, qta, serve_il, done
from public.shopping_list
order by serve_il nulls last, created_at;
