# Postavljanje na Render i Neon

## Status

Aplikacija je uspešno postavljena na [Render](https://bg-dogadjaji.onrender.com), sa PostgreSQL bazom na Neonu. Render log je potvrdio „Your service is live“. Korisnica je potvrdila registraciju, administratorski pristup i tok kreiranja demonstracionog događaja, lokacije, mape, prognoze i čuvanja događaja.

Javni [Swagger](https://bg-dogadjaji.onrender.com/api/docs/) je 10. septembra 2026. učitao specifikaciju i kroz „Try it out“ vratio HTTP 200 za `GET /api/health`, uz `{"status":"ok","service":"bg-events-api"}`.

Vlasnica projekta je 10. septembra 2026. potvrdila da je u Render Settings sačuvano **Auto-Deploy: After CI Checks Pass**. Podešavanje je uključeno. Za završni dokaz automatskog toka prati se novi commit: uspešne GitHub provere, pa automatski Render deployment sa statusom Live za isti commit.

## Arhitektura

Render koristi Dockerfile.render: gradi React, instalira backend zavisnosti i
pravi sliku koja pokrece Express i prikazuje frontend. Neon cuva PostgreSQL podatke.
Pregledac koristi istu HTTPS adresu za stranicu i API; nema cross-origin kolacica.
Lokalni Compose sa zasebnim Nginx frontend servisom ostaje dostupan.

start-cloud.js izvrsava postojece migracije pre servera. Ovo omogucava pokretanje
na Free planu bez zasebnog placenog pre-deploy koraka. Migrator pamti primenjene
migracije i koristi advisory lock. Za ovu verziju koristiti DIREKTNU Neon konekciju
(Connection pooling iskljucen), jer session advisory lock zahteva istu konekciju.
Ne gasiti proveru TLS sertifikata. Koristiti Neon URL sa SSL parametrima.

## Render podesavanja

Povezati GitHub nalog i izabrati elenimom/bg-dogadjaji, grana main.
Servis: Web Service; runtime: Docker; plan: Free; region: Frankfurt.
Root Directory ostaviti prazno. Dockerfile Path: ./Dockerfile.render.
Docker Build Context: .; Docker Command ostaviti prazno (koristi CMD iz slike).
Health Check Path: /api/health.
Auto-Deploy: After CI Checks Pass (odnosno checksPass u render.yaml).

Promenljive:

| Ključ | Vrednost |
| --- | --- |
| DATABASE_URL | Direktan Neon connection string, bez psql komande i spoljasnjih navodnika; tajna vrednost samo u Render Environment |
| NODE_ENV | production |
| SERVE_FRONTEND | true |
| SEED_DEMO | Opciono true za unos oznacenih demonstracionih dogadjaja |

Render sam prosledjuje RENDER_EXTERNAL_URL i PORT. Server koristi tu adresu za
proveru Origin zaglavlja i slusa na 0.0.0.0. APP_ORIGIN nije potrebno unositi osim
ako kasnije koristimo sopstveni domen. Sesijski kolacic u produkciji ima Secure,
HttpOnly i SameSite=Strict. Kada RENDER=true, Express veruje jednom posrednickom
proxy koraku da bi ogranicavanje zahteva radilo po IP adresi klijenta.

render.yaml opisuje iste vrednosti za Blueprint postavljanje. DATABASE_URL je
sync:false i ne nalazi se u Git-u. Biramo ili rucno kreiranje servisa ili Blueprint,
ne oba, da ne napravimo duplikat. Prvi deployment se proverava u Render logovima.

## Podaci i nalog

Neon koristi zasebnu bazu, koja je pri prvom postavljanju bila prazna; lokalni korisnici i događaji ne prenose se automatski.
Migracije prave tabele. SEED_DEMO=true dodaje samo oznacene izmisljene dogadjaje,
bez javnih pristupnih lozinki. Posle prvog uspesnog unosa vratiti ga na false.
Na javnoj aplikaciji registrovati korisnicki nalog. Promenu njegove uloge u admin
izvrsiti zasebno preko administratorskog pristupa bazi, nikada kroz otvoren API.

## Provere posle postavljanja

- /api/health daje 200 i JSON.
- / i /events prikazuju aplikaciju; osvezavanje duboke rute radi.
- /api/docs/ ucitava Swagger i Try it out.
- Registracija, prijava i odjava rade; kolacic je Secure i HttpOnly.
- Kreiranje i cuvanje dogadjaja nakon potrebnog podesavanja uloge.
- Mapa i prognoza rade; tuđe poreklo zahteva za izmenu se odbija.

## CI i ogranicenja

GitHub Actions gradi i pokrece i Render sliku pomocu compose.cloud-test.yaml,
sa lokalnom probnom bazom u CI okruzenju. To nije deployment na Neon/Render.
Render podesavanje After CI Checks Pass omogucava automatski deployment main grane
tek nakon prolaska provera. Uključena opcija potvrđena je na kontrolnoj tabli;
uspešan automatski tok novog commita beleži se zasebno u CI/CD dokumentaciji.
Besplatan Render servis se uspavljuje posle neaktivnosti; prvo otvaranje moze biti sporije.
Javni link je dodat u README. Za završnu dokumentaciju sačuvati dokaz Auto-Deploy podešavanja i odgovarajućeg uspešnog deploymenta.

Reference:
- https://render.com/docs/web-services
- https://render.com/docs/environment-variables
- https://render.com/docs/deploys
- https://render.com/docs/blueprint-spec
- https://neon.com/docs/connect/connection-pooling
