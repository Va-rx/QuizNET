INSERT INTO roles (description) VALUES ('Student'), ('Admin');

INSERT into users (email, index, name, surname, nickname, password, role_id) VALUES ('admin@admin.pl', null, 'admin', 'admin', 'admin', '$2b$10$pMcH4XkCzVPLTbpP/ng6IOURR5lE/TzP8LH0PGry4s0NFIIFOSuZS', 2);  --admin123ADMIN
INSERT INTO games (name, description) VALUES ('Czołgi', 'Strzelaj i broń się przed wrogami'), ('Deathmatch', 'Walcz z pozostałymi graczmi o pytania'), ('Platformer', 'Skacz i uważaj na przeszkody');