# Pregled događaja

GET /api/events podržava q, category, date, maxPrice i page. Vraća do 12 događaja po strani.
GET /api/events/:id vraća detalje. GET /api/categories vraća kategorije.
SQL vrednosti su parametrizovane. Datumi se filtriraju prema Europe/Belgrade.
Frontend čuva filtere u URL-u i prikazuje učitavanje, greške i prazan rezultat.
EventCard se ponovo koristi za svaku karticu.

pnpm --dir backend db:seed dodaje šest jasno označenih izmišljenih događaja.
Ponovno pokretanje ne duplira iste demo događaje. Seed koristi transakciju.
Demo organizator ima nasumičnu lozinku koja se ne ispisuje; nije nalog za prijavu.

Unos, izmena, brisanje i čuvanje događaja nisu deo ove celine.
Testovi HTTP filtera koriste zamenski repository; PostgreSQL i pregled u browseru treba zasebno proveriti.

## Upravljanje događajima
Dodate su GET/POST /api/manage/events i PATCH/DELETE /api/manage/events/:id.
GET /api/manage/locations vraća postojeće lokacije za izbor.
Organizator vidi svoje događaje; administrator sve. Posetilac nema pristup upravljanju.
Vlasništvo se proverava u WHERE uslovu UPDATE/DELETE upita. Vlasnik se određuje iz sesije pri unosu.
Nazivi kolona za PATCH biraju se iz fiksne dozvoljene liste. Vrednosti su SQL parametri.
Sve promene zahtevaju odgovarajući Origin i X-BG-Request.
Frontend /manage ima formu, listu, izmenu i potvrdu brisanja.
Datum forme je u zoni uređaja, zatim se šalje u ISO obliku; javni prikaz koristi Europe/Belgrade.

Za lokalnu dodelu uloge postojećem nalogu:
pnpm --dir backend db:role EMAIL organizer
Ovo je administratorska terminalska skripta, ne javna API ruta.
Posle dodele osvežiti stranicu. Ne menjati ulogu običnim zahtevom registracije.
Provere prave PostgreSQL baze i browser toka ovog dela još predstoje.
