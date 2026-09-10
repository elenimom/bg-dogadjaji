# Automatske provere i javno postavljanje

Workflow je u [.github/workflows/ci.yml](../.github/workflows/ci.yml). Pokreće se na svaki push i pull request, kao i ručno kroz GitHub Actions.

## Šta GitHub proverava

1. Preuzima kod konkretnog commita i priprema Node.js 24 i pnpm 11.19.0.
2. Instalira zaključane verzije zavisnosti, pokreće API testove i gradi React frontend.
3. Posle uspeha prvog posla proverava Compose konfiguraciju, gradi slike i pokreće servise.
4. Primenjuje migracije na privremenu CI bazu i čeka spremnost frontend kontejnera.
5. Preko Nginx-a proverava početnu stranicu, API health, OpenAPI specifikaciju i listu događaja.
6. Izvršava integracioni test šest povezanih modela sa stvarnim PostgreSQL serverom u izolovanoj šemi.
7. Pomoću `compose.cloud-test.yaml` gradi i pokreće sliku iz `Dockerfile.render`, zatim proverava njen health, direktno otvaranje `/events` i događaje iz API-ja.
8. Pri grešci prikazuje ograničene logove, a na kraju zaustavlja privremene CI kontejnere.

CI koristi zasebnu privremenu bazu, ne privatni `.env`, lokalne korisničke podatke ili Neon bazu. Većina API testova koristi zamenske repozitorijume; test modela i Docker provere rade sa stvarnim PostgreSQL serverom.

## Potvrđeno stanje

Uspešno GitHub Actions izvršavanje za Cloud commit `97614b1` potvrđeno je zelenim statusom. Render je potom uspešno postavio aplikaciju na [javnu adresu](https://bg-dogadjaji.onrender.com). To su zasebni koraci: CI proverava verziju koda, a deployment je pokreće na javnom serveru.

GitHub workflow ne objavljuje Docker image u registru i ne poziva direktno Render deploy hook. Render je povezan sa GitHub repozitorijumom i sam gradi sliku na osnovu `Dockerfile.render`.

## Automatsko postavljanje posle provera

Za CI/CD tok u Render servisu podesiti:

- Branch: `main`.
- Auto-Deploy: **After CI Checks Pass**.

`render.yaml` sadrži `autoDeployTrigger: checksPass`. Kod ručno kreiranog servisa ovo nije dokaz podešavanja na kontrolnoj tabli. Dok se izabrana vrednost ne potvrdi, potvrđeni su uspešan CI i javni deployment, a uslov za automatsko postavljanje ostaje za proveru.

Kada je opcija aktivna, Render čeka uspešne provere novog commita na `main`, pa pokreće novu verziju. Push na `develop` pokreće CI, ali ne menja produkciju povezanu sa `main`.

Za seminarski rad sačuvati najnoviji zeleni Actions rezultat, Render opciju Auto-Deploy i uspešan deployment istog commita. [Render dokumentacija](https://render.com/docs/deploys#integrating-with-ci).

## Spremnost kontejnera

Pokrenut kontejner ne mora odmah primati HTTP zahteve. Prvo izvršavanje je zato imalo curl grešku 56. Ispravka u commitu `f9c04ac` dodaje čekanje healthcheck-a i ograničeno ponavljanje početnog GET zahteva. Naknadne provere su prošle; trajna greška i dalje obara CI.
