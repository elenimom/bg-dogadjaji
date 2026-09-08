# Pokretanje kroz Docker

Potrebni su Docker Desktop i .env u korenu projekta sa postojecim DB_PASSWORD.
Ne menjati lozinku postojece baze. DATABASE_URL ostaje za lokalni pnpm dev;
kontejneri koriste PG* promenljive i ime db kao adresu baze.

## Pokretanje

Zaustaviti pnpm dev pomocu Ctrl+C, da port 5173 bude slobodan.
Iz korena projekta:

```bash
docker compose up -d --build
docker compose ps -a
```

Otvoriti http://localhost:5173 i http://localhost:5173/api/docs/.
Prva izgradnja preuzima osnovne slike i biblioteke i moze trajati nekoliko minuta.

- db: PostgreSQL, isti postgres_data volumen kao ranije.
- migrate: jednom proverava i primenjuje nove migracije. Exited (0) je uspeh.
- backend: Node/Express API bez pracenja promena fajlova.
- frontend: Nginx prikazuje izgradjeni React i prosledjuje /api/ backendu.

Compose ceka zdravu bazu, uspesne migracije i zdrav backend.
Nema automatskog unosa demo podataka niti brisanja postojecih podataka.
Po potrebi: docker compose exec backend node scripts/seed.js

## Zaustavljanje i izmene

```bash
docker compose stop
```

Kontejneri rade u pozadini (-d), pa zatvaranje terminala ne zaustavlja aplikaciju.
Posle izmena koda ponoviti docker compose up -d --build.
Za povratak na pnpm dev: docker compose stop frontend backend, zatim pnpm dev.
Ne koristiti docker compose down -v: opcija -v brise volumen baze.

Za dijagnostiku: docker compose logs --tail=80 backend migrate frontend
Ne deliti izlaz docker compose config jer moze sadrzati lozinku.

## Lokalni HTTP i produkcija

Ovaj Compose je za lokalni rad: portovi su vezani za 127.0.0.1,
APP_ORIGIN je http://localhost:5173 i NODE_ENV je development zbog HTTP kolacica.
Frontend ipak koristi izgradjen paket, a backend radi bez watch rezima.
Za javno postavljanje potrebni su HTTPS, odgovarajuci APP_ORIGIN i NODE_ENV=production.
Dockerfile podrazumeva production; lokalni Compose to eksplicitno menja.
.env, Git istorija i lokalne biblioteke ne ulaze u Docker build kontekst.

Reference: https://docs.docker.com/compose/how-tos/startup-order/
i https://nginx.org/en/docs/http/ngx_http_proxy_module.html
