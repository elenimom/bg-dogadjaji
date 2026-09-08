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

Projekat je u početnoj fazi razvoja.
Uputstvo za pokretanje biće dodato tokom implementacije.
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
Trenutna verzija sadrži početnu stranicu i proveru API veze.
Baza, autentifikacija, događaji, Docker i Swagger još nisu implementirani.
Objašnjenja pojmova nalaze se u docs/POJMOVI.md.
