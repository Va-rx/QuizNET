INSERT INTO roles (description) VALUES ('Student'), ('Admin');

INSERT INTO games (name, description) VALUES ('Czołgi', 'Strzelaj i broń się przed wrogami'), ('Deathmatch', 'Walcz z pozostałymi graczmi o pytania'), ('Platformer', 'Skacz i uważaj na przeszkody');

INSERT INTO users (email, name, surname, nickname, password, role_id) VALUES ('kuba@kuba.pl', 'kuba', 'kubowski', 'kubor', '$2b$10$b/YawXTzqQwFabiLftVq0usZQRZEta0Uc.C1NsYe/kMEbIibnZZ3C', 2);
INSERT INTO users (email, name, surname, nickname, password, role_id) VALUES ('adam@adam.pl', 'adam', 'adamowski', 'adamor', '$2b$10$b/YawXTzqQwFabiLftVq0usZQRZEta0Uc.C1NsYe/kMEbIibnZZ3C', 1);
INSERT INTO users (email, name, surname, nickname, password, role_id) VALUES ('kamil@kamil.pl', 'kamil', 'kamilowski', 'kamilor', '$2b$10$b/YawXTzqQwFabiLftVq0usZQRZEta0Uc.C1NsYe/kMEbIibnZZ3C', 1);