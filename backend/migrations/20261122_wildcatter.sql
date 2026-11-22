alter table public.howdy_ideas drop constraint howdy_ideas_photo_key_check;
alter table public.howdy_ideas add constraint howdy_ideas_photo_key_check
  check(photo_key in ('nashville','memphis','hotsprings','dallas','fortworth','waco','austin','hillcountry','sanantonio','roadtrip','gruene','bandera','houston','galveston','littlerock','neworleans','mountvernon','wildcatter'));

insert into public.howdy_ideas (id, kind, title, location, region, description, url, photo_key) values
  ('destination-mountvernon', 'destination', 'Deer Lake Cabins', 'Deer Lake bei Mount Vernon', 'Texas', '25.–27. April · Zwei Nächte am Deer Lake. Am Geburtstag zu viert im UTV durch die Piney Woods, dann Kajak und BBQ am See.', 'https://deerlakecabins.com/', 'mountvernon'),
  ('hotel-mountvernon', 'hotel', 'Deer Lake · Kangaroo Corner', 'Mount Vernon', 'Texas', '25.–27. April. Ganzes Haus mit zwei Schlafzimmern mit je eigenem Bad, privatem Steg und Feuerstelle. Listenpreis 425 US-$ pro Nacht, bei zwei Nächten rund 213 US-$ pro Person vor möglichen Steuern und Gebühren. Verfügbarkeit offen.', 'https://deerlakecabins.com/kc/', 'mountvernon'),
  ('destination-dallas', 'destination', 'Dallas', 'Dallas', 'Texas', '19.–21. April · Mit dem Muscle-Car zum White Rock Lake, abends Line Dance im Round-Up Saloon.', 'https://www.visitdallas.com/', 'dallas'),
  ('destination-wildcatter', 'destination', 'Wildcatter Ranch', 'Wildcatter Ranch bei Graham', 'Texas', '21.–23. April · Auf dem Weg wandern, in Cabin Suites schlafen und am nächsten Morgen mit den Wranglern ausreiten.', 'https://wildcatterranch.com/', 'wildcatter'),
  ('hotel-wildcatter', 'hotel', 'Wildcatter Ranch · Cabin Suites', 'Wildcatter Ranch bei Graham', 'Texas', '21.–23. April. Je Paar eine Cabin Suite anfragen. Für zwei Nächte den Gesamtpreis samt Steuern sowie ein veganes Abendessen und Frühstück bestätigen lassen.', 'https://wildcatterranch.com/rooms/cabins/', 'wildcatter')
on conflict (id) do update set
  revision = howdy_ideas.revision + 1,
  title = excluded.title,
  location = excluded.location,
  description = excluded.description,
  url = excluded.url,
  photo_key = excluded.photo_key
where howdy_ideas.author_key is null;
