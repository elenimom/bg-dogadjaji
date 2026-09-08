-- Baza odbija negativnu cenu cak i ako zahtev zaobidje proveru u aplikaciji.
ALTER TABLE events ADD CONSTRAINT events_price_nonnegative CHECK (price >= 0);
CREATE INDEX events_starts_at_idx ON events(starts_at);
CREATE INDEX events_organizer_id_idx ON events(organizer_id);
