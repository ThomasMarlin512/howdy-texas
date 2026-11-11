begin;
create table public.howdy_ideas (
 id text primary key default gen_random_uuid()::text check(length(id) between 1 and 80),
 kind text not null check(kind in ('destination','hotel')),
 title text not null check(length(trim(title)) between 2 and 120),
 location text not null check(length(trim(location)) between 2 and 120),
 region text not null check(region in ('Tennessee','Arkansas','Texas','Andere')),
 description text not null check(length(trim(description)) between 10 and 2000),
 url text not null default '' check(length(url)<=2000 and (url='' or url ~ '^https://[^/@[:space:]]+([/?#]|$)')),
 photo_key text not null check(photo_key in ('nashville','memphis','hotsprings','dallas','fortworth','waco','austin','hillcountry','sanantonio','roadtrip')),
 author_key text references howdy_private.members(member_key),
 archived boolean not null default false,
 revision integer not null default 0 check(revision>=0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index howdy_ideas_author_idx on public.howdy_ideas(author_key);
alter table public.howdy_ideas enable row level security;
revoke all on public.howdy_ideas from public,anon,authenticated;
grant select on public.howdy_ideas to authenticated;
grant insert(kind,title,location,region,description,url,photo_key,author_key) on public.howdy_ideas to authenticated;
grant update(kind,title,location,region,description,url,photo_key,archived,revision) on public.howdy_ideas to authenticated;
create policy howdy_ideas_read on public.howdy_ideas for select to authenticated using((select howdy_private.my_key()) is not null);
create policy howdy_ideas_insert on public.howdy_ideas for insert to authenticated with check(author_key=(select howdy_private.my_key()) and not archived and revision=0);
create policy howdy_ideas_update on public.howdy_ideas for update to authenticated using(author_key=(select howdy_private.my_key())) with check(author_key=(select howdy_private.my_key()));
create trigger howdy_ideas_revision before update on public.howdy_ideas for each row execute function howdy_private.check_plan();
create table public.howdy_idea_votes (
 member_key text not null references howdy_private.members(member_key),
 idea_id text not null references public.howdy_ideas(id),
 primary key(member_key,idea_id)
);
create index howdy_idea_votes_idea_idx on public.howdy_idea_votes(idea_id);
alter table public.howdy_idea_votes enable row level security;
revoke all on public.howdy_idea_votes from public,anon,authenticated;
grant select,insert,delete on public.howdy_idea_votes to authenticated;
create policy howdy_idea_votes_read on public.howdy_idea_votes for select to authenticated using((select howdy_private.my_key()) is not null);
create policy howdy_idea_votes_insert on public.howdy_idea_votes for insert to authenticated with check(member_key=(select howdy_private.my_key()) and exists(select 1 from public.howdy_ideas i where i.id=idea_id and not i.archived));
create policy howdy_idea_votes_delete on public.howdy_idea_votes for delete to authenticated using(member_key=(select howdy_private.my_key()));
insert into public.howdy_ideas(id,kind,title,location,region,description,url,photo_key) values
('destination-nashville','destination','Nashville','Nashville','Tennessee','Live-Musik am Broadway, die Country Music Hall of Fame oder eine Show im Ryman. Nashville ist eine Idee für alle, die den Trip mit Musik verbinden möchten.','https://www.visitmusiccity.com/','nashville'),
('destination-memphis','destination','Memphis','Memphis','Tennessee','Beale Street am Abend, Sun Studio oder Graceland: Gemeinsam auswählen, was uns interessiert. Die Highlights brauchen Zeit; ein zusätzlicher Aufenthalt ist eine Option.','https://www.memphistravel.com/','memphis'),
('destination-hotsprings','destination','Hot Springs','Hot Springs','Arkansas','Bathhouse Row und ein Spaziergang durch den Nationalpark. Ein Thermalbad im Badehaus könnte die entspannte Pause zwischen den Musikstädten und Texas sein.','https://www.nps.gov/hosp/index.htm','hotsprings'),
('destination-dallas','destination','Dallas','Dallas','Texas','Downtown entdecken, gemeinsam essen oder das Sixth Floor Museum besuchen. Dallas kann ein eigener Aufenthalt oder ein Ausgangspunkt für die Umgebung werden.','https://www.visitdallas.com/','dallas'),
('destination-fortworth','destination','Fort Worth','Fort Worth','Texas','Westernläden, historische Stockyards und Country-Musik. Viehtrieb, Konzert oder Rodeo nach dem tatsächlichen Reisetermin auswählen.','https://www.fortworth.com/','fortworth'),
('destination-waco','destination','Waco','Waco','Texas','Magnolia Market oder ein Spaziergang an der Suspension Bridge. Waco kann ein kurzer Stopp oder eine Übernachtung werden. Öffnungstage vorher prüfen.','https://www.destinationwaco.org/','waco'),
('destination-austin','destination','Austin','Austin','Texas','South Congress, Texas State Capitol und abends Musik. Bei passendem Wetter wäre Barton Springs eine zusätzliche Idee. Genug freie Zeit lassen.','https://www.austintexas.org/','austin'),
('destination-hillcountry','destination','Fredericksburg & Luckenbach','Fredericksburg & Luckenbach','Texas','Main Street in Fredericksburg, Landstraßen und ein Country-Abstecher nach Luckenbach. Musiktermine prüfen; die Aufenthaltsdauer bleibt offen.','https://www.visitfredericksburgtx.com/','hillcountry'),
('destination-sanantonio','destination','San Antonio','San Antonio','Texas','Am River Walk spazieren, die Alamo besuchen oder einfach die Stadt genießen. San Antonio ist ein mögliches Reiseziel, kein bereits festgelegter Rückflugort.','https://www.visitsanantonio.com/','sanantonio'),
('hotel-nashville','hotel','Drury Plaza Hotel Nashville Downtown','Nashville','Tennessee','Downtown als Ausgangspunkt für Broadway und Musikmuseen. Frühstück und ein Pool gehören zum Angebot. Parkkosten und Zimmeraufteilung vor der Buchung prüfen.','https://www.druryhotels.com/locations/nashville-tn/drury-plaza-hotel-nashville-downtown','nashville'),
('hotel-memphis','hotel','The Peabody Memphis','Memphis','Tennessee','Historisches Hotel in Downtown für einen besonderen Aufenthalt in Memphis. Eine eher gehobene Hotelidee; Gesamtpreis inklusive Zusatzgebühren vergleichen.','https://peabodymemphis.com/','memphis'),
('hotel-hotsprings','hotel','The Waters Hot Springs','Hot Springs','Arkansas','Tapestry Collection by Hilton: direkt gegenüber der Bathhouse Row. Eine Idee für kurze Wege zu den Badehäusern; mit Restaurant und Rooftop-Bar.','https://www.hilton.com/en/hotels/hottsup-the-waters-hot-springs/','hotsprings'),
('hotel-dallas','hotel','Hampton Inn & Suites Dallas Downtown','Dallas','Texas','Zentrale Unterkunft an der Commerce Street mit Frühstück und Innenpool. Als Basis für einen Stadtaufenthalt in Dallas vormerken.','https://www.hilton.com/en/hotels/daldxhx-hampton-suites-dallas-downtown/','dallas'),
('hotel-fortworth','hotel','Hyatt Place Fort Worth Historic Stockyards','Fort Worth','Texas','Übernachten direkt im Stockyards-Viertel: interessant, wenn wir den Abend dort verbringen möchten. Mit Außenpool; Zimmer und Parkbedingungen prüfen.','https://www.hyatt.com/hyatt-place/en-US/dfwzf-hyatt-place-fort-worth-historic-stockyards','fortworth'),
('hotel-waco','hotel','Hotel Indigo Waco – Baylor','Waco','Texas','Im Warehouse District in Downtown, nahe Magnolia. Eine Hotelidee, falls Waco mehr als ein kurzer Zwischenstopp werden soll.','https://www.ihg.com/hotelindigo/hotels/us/en/waco/actin/hoteldetail','waco'),
('hotel-austin','hotel','Hyatt Place Austin Downtown','Austin','Texas','Zentrale Basis an der East 3rd Street für Austins Innenstadt und Musikangebote. Frühstück im Angebot; Parkkosten gesondert prüfen.','https://www.hyatt.com/hyatt-place/en-US/auszd-hyatt-place-austin-downtown','austin'),
('hotel-hillcountry','hotel','Fredericksburg Inn & Suites','Fredericksburg','Texas','Nur einen Block von der Main Street entfernt. Frühstück, Parkplätze und Außenbereich machen das Hotel zu einer Idee für unsere Hill-Country-Pause.','https://www.fredericksburg-inn.com/','hillcountry'),
('hotel-sanantonio','hotel','Drury Plaza Hotel San Antonio Riverwalk','San Antonio','Texas','Hotel am River Walk im ehemaligen Alamo-National-Bank-Gebäude. Mit Frühstück und Dachpool; eine Idee für einen Aufenthalt in San Antonio.','https://www.druryhotels.com/locations/san-antonio-tx/drury-plaza-hotel-san-antonio-riverwalk','sanantonio');
-- Keep the previous day-based vote table for a reversible rollout.
commit;
