# Vodič kroz događaje u Beogradu

Projekat iz predmeta Internet tehnologije.

## Opis

Aplikacija za pregled događaja u Beogradu: izložbi, stand-up
nastupa, žurki, svirki i radionica.

## Planirane funkcionalnosti

- Pretraga i filtriranje događaja.
- Pregled detalja i lokacije događaja.
- Čuvanje događaja u listu „Želim da idem“.
- Dodavanje i izmena sopstvenih događaja za organizatore.
- Administratorsko upravljanje sadržajem.

## Planirane tehnologije

React, Node.js, Express i PostgreSQL.

## Status

Implementirani su prijava i registracija, dogadjaji, sacuvani dogadjaji, administracija, integracije i Swagger dokumentacija.
## Pokretanje početne razvojne verzije

Potrebni su Node.js 22.12 ili noviji i pnpm 11.19.0.
Instalacija pnpm-a: `npm install -g pnpm@11.19.0`.

Iz korena projekta:
- `pnpm install` instalira biblioteke.
- `pnpm dev` pokreće frontend i backend.
- Otvorite http://localhost:5173.
- `pnpm test` pokreće API testove.
- `pnpm build` pravi frontend produkcioni paket.

API provera: http://localhost:3001/api/health.

Objašnjenja pojmova nalaze se u docs/POJMOVI.md.

## Swagger API dokumentacija
Uz pokrenutu aplikaciju otvoriti http://localhost:5173/api/docs/.
Specifikacija je na /api/openapi.json i u backend/src/docs/openapi.json.
Za uputstvo i autentifikaciju pogledati docs/SWAGGER.md.

## Cela aplikacija kroz Docker

Uz postojeci .env i pokrenut Docker Desktop, zaustaviti pnpm dev pa pokrenuti:

```bash
docker compose up -d --build
```

Aplikacija: http://localhost:5173. Uputstvo: [docs/DOCKER.md](docs/DOCKER.md).

## Organizacija backenda

Tok zahteva i raspored ruta, kontrolera i repozitorijuma opisani su u [docs/ARHITEKTURA_BACKENDA.md](docs/ARHITEKTURA_BACKENDA.md).

## Automatske provere

GitHub Actions konfiguracija pokrece testove, frontend build i Docker proveru na push i pull request. Detalji i status: [docs/CI_CD.md](docs/CI_CD.md). Cloud deployment jos nije podesen.
