# Automatske provere na GitHub-u

Workflow je u .github/workflows/ci.yml.
Pokrece se na push i pull request, kao i rucno kroz Actions > Run workflow
(kada workflow postoji na podrazumevanoj grani).

## Sta GitHub radi

1. Preuzima kod iz commita koji proverava.
2. Priprema Node.js 24 i pnpm 11.19.0.
3. Instalira verzije biblioteka prema pnpm-lock.yaml (frozen lockfile).
4. Pokrece API testove i gradi React frontend.
5. Ako provere prodju, u drugom poslu gradi Docker slike i pokrece Compose.
6. Migracije pripreme privremenu CI bazu.
7. Proverava stranicu, API health, Swagger specifikaciju i listu dogadjaja kroz Nginx.
8. Zaustavlja CI kontejnere; pri gresci prikazuje logove za dijagnostiku.

CI okruzenje je poseban privremeni racunar na GitHub-u. Koristi sopstvenu
probnu lozinku i praznu bazu. Ne pristupa bazi na racunaru autora niti zahteva
kopiranje licnog .env fajla. Provera /api/events koristi stvarnu PostgreSQL bazu
u CI okruzenju, dok postojeci API testovi uglavnom koriste zamenske repozitorijume.

## Status i ogranicenja

Pipeline je pripremljen lokalno. Uspesno izvrsavanje na GitHub-u potvrdjuje se
zelenim statusom tek nakon slanja commita. Samo postojanje YAML fajla nije dokaz
uspesnog CI izvrsavanja.

Ova verzija implementira kontinuiranu integraciju (CI): testove, build i proveru
pokretanja. Ne objavljuje Docker slike u registru i jos ne postavlja aplikaciju
na Cloud. Javna produkcija i automatsko postavljanje predstavljaju naredni korak.

Za dokumentaciju sacuvati sliku uspesnog Actions izvrsavanja, naziv commita i
objasnjenje poslova. GitHub: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
