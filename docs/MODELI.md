# Modeli i veze podataka

Aplikacija koristi sest konkretnih modela u backend/src/models.
Svaki model ima metode za pristup podacima i koristi pg biblioteku.
Ne koristi se ORM; veze i integritet podataka obezbedjuju SQL strani kljucevi.
Repozitorijumi grupisu metode modela za kontrolere, a sami vise ne sadrze SQL.

| Model | Tabela | Odgovornost |
| --- | --- | --- |
| UserModel | users | Kreiranje i pronalazenje korisnika, pregled korisnika, promena uloge uz zastitu poslednjeg administratora |
| SessionModel | sessions | Kreiranje, pronalazenje i brisanje sesija povezanih sa korisnikom |
| EventModel | events | Pretraga, pregled, kreiranje, izmena i brisanje dogadjaja uz proveru vlasnistva |
| CategoryModel | categories | Citanje i administracija kategorija dogadjaja |
| LocationModel | locations | Citanje i administracija lokacija i koordinata |
| SavedEventModel | saved_events | Licna lista, cuvanje i uklanjanje sacuvanog dogadjaja |

## Veze

- users 1:N events preko events.organizer_id.
- categories 1:N events preko events.category_id.
- locations 1:N events preko events.location_id.
- users 1:N sessions preko sessions.user_id.
- users N:N events preko saved_events (user_id, event_id).

Slozeni primarni kljuc saved_events sprecava dupliranje istog para korisnik-dogadjaj.
Brisanje dogadjaja automatski uklanja njegovo cuvanje iz licnih lista (ON DELETE CASCADE).
Kategorija ili lokacija koju dogadjaj koristi ne moze biti obrisana dok postoji ta veza.
Provere vlasnistva ostaju deo parametrizovanih SQL upita EventModel-a.

## Provera sa pravom bazom

Postojeci API testovi proveravaju odgovore i autorizaciju uz zamenske repozitorijume.
Dodatni test backend/test/models.integration.test.js proverava svih sest modela
sa stvarnom bazom. Pravi nasumicno imenovanu test semu, primenjuje postojece
migracije u njoj, proverava veze, ogranicenja, sesije i vlasnistvo, pa uklanja samo
tu test semu. Ne menja semu public sa podacima aplikacije.

GitHub Actions ga izvrsava u privremenoj Docker bazi. Rucno pokretanje:

```bash
docker compose exec -T -e RUN_DB_TESTS=1 backend node --test test/models.integration.test.js
```

Za lokalno pnpm test, integracioni test se preskace bez RUN_DB_TESTS=1.
Posle promena koda prvo izgraditi novu Docker sliku.
