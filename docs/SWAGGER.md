# API specifikacija i Swagger

Specifikacija: backend/src/docs/openapi.json (OpenAPI 3.0.3, 28 operacija).
Javni Swagger UI: https://bg-dogadjaji.onrender.com/api/docs/
Javni JSON: https://bg-dogadjaji.onrender.com/api/openapi.json
Lokalni Swagger UI: http://localhost:5173/api/docs/
Lokalni JSON: http://localhost:5173/api/openapi.json

Pokrenuti pnpm dev uz aktivnu bazu. Koristiti istu adresu kao frontend (localhost:5173), jer promene zahtevaju APP_ORIGIN.
GET /health ili GET /events mogu se isprobati bez prijave kroz Try it out > Execute.
Za zaštićene rute prijaviti se kroz aplikaciju ili /auth/login u Swagger-u.
Server postavlja HttpOnly kolačić; ne upisivati ga ručno u Authorize.
Swagger dodaje X-BG-Request zaglavlje; Origin postavlja pregledač.
Try it out šalje stvarne zahteve: POST/PATCH/DELETE menjaju stvarnu bazu.

Dokumentovani su ulazni modeli, parametri filtera, odgovori, statusi grešaka i potrebne uloge.
Swagger ne zamenjuje automatizovane testove. Pri promeni ruta ažurirati specifikaciju.

Za seminarsku dokumentaciju priložiti JSON specifikaciju i slike Swagger prikaza:
pregled grupa, GET /events sa odgovorom, primer zaštićene rute i model EventInput.
Dokumentacija koristi lokalnu Swagger biblioteku; eksterni online validator je isključen.
Referenca: https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/

## Provera javnog okruženja

Dana 10. septembra 2026. Swagger UI je učitao specifikaciju sa javne adrese. Izvršeno je GET /health preko Try it out > Execute; odgovor je HTTP 200 i JSON `{"status":"ok","service":"bg-events-api"}`. Provera nije menjala podatke.
