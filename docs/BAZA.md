# Baza događaja

PostgreSQL radi u Docker kontejneru. Port 5433 na računaru vodi do porta 5432 u kontejneru.
Volume postgres_data čuva podatke i kada se kontejner ponovo napravi.

## Povezani entiteti
- users: korisnik i njegova uloga; čuva se hash lozinke, nikada originalna lozinka.
- categories: kategorija događaja.
- locations: mesto održavanja i koordinate.
- events: događaj povezan sa organizatorom, kategorijom i lokacijom.
- saved_events: povezuje korisnika sa sačuvanim događajem; isti par ne može se ponoviti.

Organizator ima više događaja (1:N). Jedan događaj može sačuvati više korisnika, a korisnik više događaja (N:N).

## Tri vrste migracija
001 kreira tabele i njihove veze.
002 dodaje opcionu kolonu ticket_url.
003 dodaje ograničenje da cena ne sme biti negativna i indekse za pretragu.

Strani ključ (REFERENCES) sprečava vezu ka nepostojećem zapisu.
Transakcija obezbeđuje da se jedna migracija primeni u celini ili poništi.
Tabela schema_migrations pamti izvršene migracije i njihov kontrolni zbir.

## Lokalno pokretanje
Kopirati .env.example u .env u korenu projekta.
U .env postaviti DB_PASSWORD i istu lozinku u DATABASE_URL.
Pokrenuti iz korena: docker compose up -d db
Zatim: pnpm --dir backend db:migrate

Ova celina još ne sadrži implementaciju prijave niti model klase/repozitorijume.
