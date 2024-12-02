INSERT INTO roles (description) VALUES ('Student'), ('Admin');

INSERT into users (email, index, name, surname, nickname, password, role_id) VALUES ('', null, 'admin', 'admin', 'admin', '$2b$10$7f7LnJzhWSo8iFovJyRoje73CL6B6YeU8sOWYR8kwe0F9ir.ECH.a', 2),  --admin123
                                                                           ('test@student.agh.edu.pl', 213700, 'test', 'test', 'test', '$2b$10$GD7pKKuLbq6K8.QL1U95G.tMOnMsNwI.7KHzBpsqXYH.WMPJzmCzC', 1);   --test123


INSERT INTO games (name, description) VALUES ('Czołgi', 'Strzelaj i broń się przed wrogami'), ('Deathmatch', 'Walcz z pozostałymi graczmi o pytania'), ('Platformer', 'Skacz i uważaj na przeszkody');