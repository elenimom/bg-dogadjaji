# Administracija
Stranica /admin namenjena je samo administratorima.
Kategorije i lokacije: pregled, unos, izmena i brisanje preko /api/admin/categories i /api/admin/locations.
Korisnici: pregled bez password_hash i promena uloge preko PATCH /api/admin/users/:id/role.
Promene proveravaju Origin i X-BG-Request, sve rute proveravaju sesiju i admin ulogu.
Kategorija ili lokacija korišćena u događaju ne može se obrisati; FK greška vraća HTTP 409.
Poslednji administrator ne može se demotirati kroz API. Transakcija i zaključavanje tabele sprečavaju konkurentne democije.
Lokalna db:role skripta je operatorski pristup za inicijalnu dodelu; ne izlaže se kao javna ruta.
UI potvrđuje brisanje i promene uloga. PostgreSQL i browser tokove tek treba ručno proveriti.
