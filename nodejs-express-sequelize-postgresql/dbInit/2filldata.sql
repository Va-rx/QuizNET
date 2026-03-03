INSERT INTO roles (description) VALUES ('Student'), ('Admin');

INSERT into users (email, index, name, surname, nickname, password, role_id) VALUES ('admin@admin.pl', null, 'admin', 'admin', 'admin', '$2b$10$R4UYPwELz5B4xmEq7L/DL.pjib6eALumwEsMCPeaIxamIEABzF2cu', 2);  --adminADMIN
INSERT INTO games (name, description) VALUES ('Czołgi', 'Strzelaj i broń się przed wrogami'), ('Deathmatch', 'Walcz z pozostałymi graczmi o pytania'), ('Platformer', 'Skacz i uważaj na przeszkody');