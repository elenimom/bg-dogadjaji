export const selection = `SELECT e.*, c.name AS category_name, l.name AS location_name,
 l.address, l.latitude, l.longitude, u.name AS organizer_name
 FROM events e JOIN categories c ON c.id=e.category_id
 JOIN locations l ON l.id=e.location_id JOIN users u ON u.id=e.organizer_id`;
