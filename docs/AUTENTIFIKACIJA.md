# Autentifikacija — za naknadni zajednički prolazak

Ovo poglavlje još treba proći sa studentkinjom; izvršavanje koda nije zamena za razumevanje.

POST /api/auth/register pravi posetioca i sesiju.
POST /api/auth/login proverava lozinku i rotira sesiju.
POST /api/auth/logout briše sesiju.
GET /api/auth/me vraća prijavljenog korisnika ili HTTP 401.

Lozinke koriste scrypt sa nasumičnom soli. Baza čuva hash.
Kolačić bg_session je HttpOnly i SameSite=Strict; u produkciji i Secure.
Baza čuva SHA-256 hash nasumičnog tokena sesije. Sesija traje osam sati.
Frontend mora slati X-BG-Request: 1 na promenama; server proverava Origin prema APP_ORIGIN.
Ograničenje broja zahteva štiti auth rute od prekomernih pokušaja.
SQL vrednosti su parametrizovane. Korisnik ne može izabrati ulogu registracijom.
requireRole proverava uloge; povezivanje sa budućim rutama organizatora i administratora tek sledi.

Migracija 004 dodaje sessions. Testovi auth.test.js koriste zamensku bazu u memoriji i proveravaju HTTP ponašanje, ne PostgreSQL integraciju.
Frontend forme još nisu dodate.
