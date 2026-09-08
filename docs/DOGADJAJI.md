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
