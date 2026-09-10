# BG događaji

Veb aplikacija za pronalaženje događaja u Beogradu, izrađena za predmet Internet tehnologije.

- **Javna aplikacija:** [bg-dogadjaji.onrender.com](https://bg-dogadjaji.onrender.com)
- **Swagger UI:** [API dokumentacija](https://bg-dogadjaji.onrender.com/api/docs/)
- **OpenAPI JSON:** [specifikacija](https://bg-dogadjaji.onrender.com/api/openapi.json)
- **CI:** [GitHub Actions provere](https://github.com/elenimom/bg-dogadjaji/actions)

## Funkcionalnosti

- Registracija, prijava, odjava i pregled korisničkog naloga.
- Pretraga događaja po tekstu, kategoriji, datumu i maksimalnoj ceni, uz paginaciju.
- Detalji događaja, lokacija, cena i opcioni link ka spoljašnjoj prodaji karata.
- Lična lista „Želim da idem“.
- Kreiranje, izmena i brisanje događaja prema ulozi i vlasništvu.
- Administratorsko upravljanje kategorijama, lokacijama i korisničkim ulogama.
- Pretraga koordinata preko Photon API-ja i vremenska prognoza preko Open-Meteo API-ja.
- Leaflet mapa sa OpenStreetMap podlogom, oznakama događaja i slojevima po kategorijama.

Novi nalog ima ulogu posetioca. Organizator upravlja svojim događajima, a administrator svim događajima i zajedničkim podacima. Ovlašćenja proverava backend. Primeri označeni sa `[DEMO]` predstavljaju izmišljene događaje; aplikacija ne obavlja naplatu karata.

## Tehnologije i organizacija

React 19, React Router 7, Vite i CSS čine frontend. Node.js i Express 5 obrađuju REST API, a PostgreSQL čuva podatke preko `pg` drajvera. Testovi koriste `node:test` i Supertest. Swagger prikazuje OpenAPI 3.0.3 specifikaciju sa 28 operacija.

- `frontend/src/` — stranice, višekratne komponente, API klijent i mapa.
- `backend/src/` — rute, kontroleri, repozitorijumi, modeli i integracije.
- `backend/migrations/` — SQL migracije; `backend/test/` — automatizovani testovi.
- `compose.yaml` — lokalna aplikacija; `Dockerfile.render` — javno okruženje.
- `.github/workflows/ci.yml` — automatske provere; `docs/` — objašnjenja projekta.

Šest povezanih modela su korisnik, sesija, događaj, kategorija, lokacija i sačuvani događaj. Zaštite uključuju proveru porekla zahteva (CSRF), bezbedan prikaz teksta (XSS), proveru vlasništva (IDOR) i parametrizovani SQL. Lozinke se čuvaju pomoću scrypt hash funkcije; produkcione sesije koriste Secure, HttpOnly i SameSite=Strict kolačić.

## Javno i lokalno okruženje

Javna aplikacija radi na Renderu, a njena PostgreSQL baza je na Neonu. Lokalna aplikacija koristi zasebnu Docker bazu. Lokalni nalozi i događaji se ne prenose automatski na javnu adresu. Za javnu aplikaciju nije potrebno pokretati Docker na svom računaru.

Prvo otvaranje javnog sajta posle mirovanja servisa može trajati duže. Prognoza je dostupna za datume u podržanom opsegu; nedostupnost spoljašnjeg servisa prikazuje se porukom.

## Lokalno pokretanje pomoću Dockera

Potrebni su Git i pokrenut Docker Desktop sa Docker Compose podrškom.

1. Klonirati projekat i otvoriti njegov folder:

   ```bash
   git clone https://github.com/elenimom/bg-dogadjaji.git
   cd bg-dogadjaji
   ```

2. **Samo pri prvom podešavanju**, ako `.env` ne postoji, napraviti kopiju `.env.example` pod imenom `.env`. U tom privatnom fajlu zameniti primer lozinke sopstvenom lokalnom lozinkom u `DB_PASSWORD` i u `DATABASE_URL`. Ne menjati pristupne podatke već napravljene baze i ne prepisivati postojeći `.env`. Fajl se ne šalje na GitHub.
3. Iz korena projekta pokrenuti:

   ```bash
   docker compose up -d --build
   docker compose ps -a
   ```

4. Otvoriti [lokalnu aplikaciju](http://localhost:5173) ili [lokalni Swagger](http://localhost:5173/api/docs/).

Compose pokreće bazu (`db`), migracije (`migrate`), API (`backend`) i Nginx (`frontend`). Servis migracija treba da završi sa `Exited (0)`, a ostali servisi da rade. Podaci baze čuvaju se u trajnom volumenu.

Za pauzu:

```bash
docker compose stop
```

Za ponovno pokretanje koristiti `docker compose up -d`; posle izmene koda dodati `--build`. Opcija `down -v` uklanja volumen baze i nije deo redovnog zaustavljanja. Detaljnije: [Docker uputstvo](docs/DOCKER.md).

## Lokalni razvoj pomoću pnpm-a

Koristiti Node.js 24.x i pnpm 11.19.0, kao u CI okruženju. Potreban je lokalni `.env` opisan iznad. Ne pokretati istovremeno Docker frontend i `pnpm dev` na portu 5173.

```bash
npm install --global pnpm@11.19.0
pnpm install --frozen-lockfile
docker compose stop frontend backend
docker compose up -d db
pnpm --dir backend db:migrate
pnpm dev
```

`pnpm dev` zajedno pokreće backend i frontend. Aplikacija je na `http://localhost:5173`, a API na `http://localhost:3001/api/health`. `Ctrl+C` zaustavlja razvojne procese. Za prvi unos označenih demonstracionih podataka opciono pokrenuti `pnpm --dir backend db:seed` u drugom terminalu.

## Testovi i izgradnja

```bash
pnpm test
pnpm build
```

API testovi proveravaju autentifikaciju, uloge, događaje, administraciju, integracije, Swagger i Cloud postavku. Test stvarnih modela baze uključen je odvojeno, uz pokrenut Docker backend:

```bash
docker compose exec -T -e RUN_DB_TESTS=1 backend node --test test/models.integration.test.js
```

Taj test koristi privremenu izolovanu šemu. Bez `RUN_DB_TESTS=1` uslovno se preskače u običnom `pnpm test` izvršavanju. Detalji: [modeli i integraciona provera](docs/MODELI.md).

## CI i Cloud postavljanje

GitHub Actions na svaki push i pull request pokreće testove, gradi React, proverava lokalne Docker servise i gradi i pokreće Render sliku sa privremenom CI bazom. CI ne koristi privatnu lokalnu ili Neon bazu.

Javna aplikacija je uspešno postavljena sa grane `main`. Za automatsko postavljanje tek posle prolaska provera koristi se Render opcija **After CI Checks Pass**; `render.yaml` navodi `autoDeployTrigger: checksPass`. Kod ručno kreiranog servisa tu opciju treba proveriti na Render kontrolnoj tabli — samo prisustvo YAML fajla nije potvrda aktivnog podešavanja.

Uputstva i dokazi: [CI/CD](docs/CI_CD.md), [Render i Neon](docs/CLOUD.md), [Swagger](docs/SWAGGER.md). Javni Swagger je 10. septembra 2026. proveren kroz „Try it out“: `GET /api/health` vratio je HTTP 200 i `status: ok`.

## Grane i dokumentacija

Razvoj je praćen granama `main`, `develop`, `feature/app-foundation`, `feature/auth` i `feature/events`. `main` je stabilna verzija, a `develop` integraciona grana.

- [Pojmovi](docs/POJMOVI.md)
- [Baza i migracije](docs/BAZA.md)
- [Autentifikacija](docs/AUTENTIFIKACIJA.md)
- [Događaji](docs/DOGADJAJI.md)
- [Integracije i mapa](docs/INTEGRACIJE.md)
- [Arhitektura backenda](docs/ARHITEKTURA_BACKENDA.md)
