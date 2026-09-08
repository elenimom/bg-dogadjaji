# Mapa i eksterni API-ji
Photon: GET https://photon.komoot.io/api/ sa q, limit, lat, lon i bbox.
Backend /api/integrations/geocode?q=... vraća rezultate sa koordinatama.
Administrator bira rezultat pre čuvanja lokacije; ručni unos je i dalje moguć.
Javni Photon servis dozvoljava razumnu upotrebu i nema garanciju dostupnosti.
Dokumentacija: https://github.com/komoot/photon

Open-Meteo: GET https://api.open-meteo.com/v1/forecast za koordinate događaja.
Backend /api/integrations/weather/:id bira datum po Europe/Belgrade.
Vraća dnevni minimum/maksimum temperature i verovatnoću padavina.
Datumi van narednih 16 dana dobijaju poruku umesto izmišljene prognoze.
Besplatni servis je namenjen nekomercijalnoj upotrebi; za drugačiju upotrebu proveriti plan.
Dokumentacija: https://open-meteo.com/en/docs i https://open-meteo.com/en/pricing

Oba poziva imaju timeout 8 sekundi, keš 15 minuta (do 200 unosa) i ograničenje zahteva.
Spoljašnja nedostupnost vraća JSON grešku 503, bez blokiranja glavnog prikaza.

Leaflet prikazuje OSM raster mapu, sopstvene circle markere, popup detalje, slojeve po kategorijama,
fitBounds, zum i dugme za centar Beograda. Mapa sledi trenutnu stranu filtriranih rezultata.
Na istoj lokaciji markeri mogu da se preklapaju; slojevi i lista omogućavaju izbor događaja.
Popup i imena slojeva kodiraju se kao tekst radi zaštite od XSS-a.
Obavezna vidljiva atribucija ostaje na mapi. Nema offline ili masovnog preuzimanja pločica.
Pravila: https://operations.osmfoundation.org/policies/tiles/
Leaflet: https://leafletjs.com/reference.html

Integracije i pločice treba proveriti iz stvarnog browsera i deployment okruženja.
