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

U Render kontrolnoj tabli sačuvano je sledeće podešavanje; vlasnica projekta ga je potvrdila 10. septembra 2026:

- Branch: `main`.
- Auto-Deploy: **After CI Checks Pass**.

`render.yaml` sadrži odgovarajući `autoDeployTrigger: checksPass`. Potvrda aktivne opcije dolazi iz Render Settings prikaza, a ne samo iz YAML fajla. Podešavanje je potvrđeno; završna provera automatskog postavljanja novog commita još treba da zabeleži uspešan CI i Render Live za isti commit.

Sa ovom opcijom Render čeka uspešne provere novog commita na `main`, pa pokreće novu verziju. Push na `develop` pokreće CI, ali ne menja produkciju povezanu sa `main`.

Za seminarski rad sačuvati najnoviji zeleni Actions rezultat, Render opciju Auto-Deploy i uspešan deployment istog commita. [Render dokumentacija](https://render.com/docs/deploys#integrating-with-ci).

## Spremnost kontejnera

Pokrenut kontejner ne mora odmah primati HTTP zahteve. Prvo izvršavanje je zato imalo curl grešku 56. Ispravka u commitu `f9c04ac` dodaje čekanje healthcheck-a i ograničeno ponavljanje početnog GET zahteva. Naknadne provere su prošle; trajna greška i dalje obara CI.

## Završna provera automatskog toka

1. Sačuvati ovu dopunu dokumentacije u novi commit i poslati granu `main` na GitHub.
2. Zabeležiti oznaku commita i otvoriti njegovo Actions izvršavanje za `main`. Sačekati da oba posla završe uspešno.
3. U Render Deploys proveriti da je bez korišćenja Manual Deploy pokrenuto postavljanje tog istog commita i da je završilo statusom **Live**.
4. Otvoriti javnu aplikaciju i proveriti `GET /api/health` kroz Swagger.
5. Sačuvati slike zelenih provera, Render Live prikaza sa oznakom istog commita i opcije After CI Checks Pass za seminarsku dokumentaciju.

Ne pokretati ručni deployment tokom ove provere, jer on ne dokazuje da je postavljanje automatski sačekalo CI. Ako novo automatsko postavljanje izostane ili ne uspe, pregledati njegov status i logove pre zaključka da je tok potvrđen.
