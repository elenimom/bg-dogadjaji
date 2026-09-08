# Organizacija backenda

## Tok jednog zahteva

Kada korisnik otvori detalje dogadjaja broj 5:

1. React posalje GET /api/events/5.
2. app.js usmerava zahtev u events/routes.js.
3. Ruta /events/:id bira controller.details.
4. events/controller.js proverava identifikator i poziva repository.get(5).
5. events/repository.js izvrsava parametrizovan SQL upit preko pg biblioteke.
6. PostgreSQL vraca podatke; kontroler salje JSON odgovor ili 404 ako dogadjaj ne postoji.
7. React prikazuje odgovor korisniku.

Za izmene dogadjaja provere prijave i uloge prethode kontroleru.
Repozitorijum dodatno proverava vlasnistvo u SQL upitu, pa organizator ne moze
izmeniti tudji dogadjaj samo promenom broja u URL-u.

## Odgovornosti

- Ruta: HTTP metoda, putanja, zastitne provere i izbor kontrolera.
- Kontroler: podaci iz zahteva, validacija, poziv repozitorijuma, HTTP status i JSON odgovor.
- Repozitorijum: citanje i upis podataka pomocu SQL upita.
- Migracije: verzionisana struktura baze (tabele, kolone, ogranicenja).
- Model podataka: korisnici, kategorije, lokacije, dogadjaji, sacuvani dogadjaji i sesije i njihove veze.

Ne koristimo ORM; pristup podacima implementiran je pg bibliotekom i repozitorijumima.
Kontroleri ne sadrze SQL. Funkcije koje kreiraju kontrolere dobijaju repozitorijum
kao argument, sto omogucava testovima da proslede zamenski repozitorijum.

## Raspored kontrolera

| Fajl unutar backend/src | Namena |
| --- | --- |
| auth/controller.js | Registracija, prijava, podaci prijavljenog korisnika, odjava |
| events/controller.js | Javni pregled, filteri, detalji i kategorije |
| events/manage-controller.js | Organizatorsko i administratorsko upravljanje dogadjajima |
| events/saved-controller.js | Licna lista sacuvanih dogadjaja |
| admin/controller.js | Korisnicke uloge, kategorije i lokacije |
| integrations/controller.js | Geokodiranje, vremenska prognoza i kesiranje odgovora |

Pomocne funkcije za sesiju nalaze se u auth/session.js.
Swagger i zdravstvena provera servera ostaju tehnicke rute.

## Pokretanje posle promene koda

U Docker nacinu rada kod je deo izgradjene slike; potrebno je ponovo izgraditi:

```bash
docker compose up -d --build
```

Proveriti prijavu, detalje dogadjaja i Swagger GET /health.
Lokalni API testovi: pnpm test (31 test u trenutku ovog izdvajanja).
Ovo izdvajanje kontrolera ne menja API adrese, tabele niti podatke.
