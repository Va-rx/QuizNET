INSERT INTO roles (description) VALUES ('Student'), ('Admin');

INSERT into users (email, index, name, surname, nickname, password, role_id) VALUES ('admin@agh.edu.pl', null, 'admin', 'admin', 'admin', 'admin123', 2),
                                                                           ('test@student.agh.edu.pl', 213700, 'test', 'test', 'test', 'test123', 1);