alter table public.howdy_ideas drop constraint howdy_ideas_photo_key_check;
alter table public.howdy_ideas add constraint howdy_ideas_photo_key_check
  check(photo_key in ('nashville','memphis','hotsprings','dallas','fortworth','waco','austin','hillcountry','sanantonio','roadtrip','gruene','bandera','houston','galveston','littlerock','neworleans','mountvernon'));

insert into public.howdy_ideas (id,kind,title,location,region,description,url,photo_key) values
  ('destination-mountvernon','destination','Mount Vernon','Mount Vernon','Texas','Ranchaufenthalt in Osttexas mit geführtem Ausritt und einem freien Geburtstag am See.','https://deerlakecabins.com/','mountvernon'),
  ('hotel-mountvernon','hotel','Deer Lake Cabins Ranch Resort','Mount Vernon','Texas','Zwei Nächte vom 25. bis 27. April. Cabin mit Küche, zwei Schlafzimmern und zwei Bädern anfragen. Verfügbarkeit, Anfängerausritt und veganes Essen sind offen.','https://deerlakecabins.com/','mountvernon')
on conflict(id) do nothing;
