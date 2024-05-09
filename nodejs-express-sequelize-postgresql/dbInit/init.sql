CREATE TABLE answers (
    answer_id int  NOT NULL,
    question_id int  NOT NULL,
    answer varchar(100)  NOT NULL,
    is_correct boolean  NOT NULL,
    CONSTRAINT answers_pk PRIMARY KEY (answer_id)
);

CREATE TABLE questions (
    question_id int  NOT NULL,
    question varchar(300)  NOT NULL,
    image_link varchar(100)  NULL,
    CONSTRAINT questions_pk PRIMARY KEY (question_id)
);

CREATE TABLE sets (
    set_id int  NOT NULL,
    test_id int  NOT NULL,
    question_id int  NOT NULL,
    CONSTRAINT sets_pk PRIMARY KEY (set_id)
);

CREATE TABLE students (
    index char(6)  NOT NULL,
    name varchar(20)  NOT NULL,
    surname varchar(30)  NOT NULL,
    nickname varchar(20)  NOT NULL,
    group_id varchar(2)  NOT NULL,
    CONSTRAINT students_pk PRIMARY KEY (index)
);

CREATE TABLE tests (
    test_id int  NOT NULL,
    name varchar(50)  NOT NULL,
    desciption varchar(500)  NULL,
    CONSTRAINT tests_pk PRIMARY KEY (test_id)
);

ALTER TABLE answers ADD CONSTRAINT answers_questions
    FOREIGN KEY (question_id)
    REFERENCES questions (question_id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

ALTER TABLE sets ADD CONSTRAINT sets_questions
    FOREIGN KEY (question_id)
    REFERENCES questions (question_id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

ALTER TABLE sets ADD CONSTRAINT sets_tests
    FOREIGN KEY (test_id)
    REFERENCES tests (test_id)
    NOT DEFERRABLE
    INITIALLY IMMEDIATE
;

CREATE SEQUENCE tests_id_seq;
ALTER TABLE tests ALTER COLUMN test_id SET DEFAULT nextval('tests_id_seq');

CREATE SEQUENCE questions_id_seq;
ALTER TABLE questions ALTER COLUMN question_id SET DEFAULT nextval('questions_id_seq');

CREATE SEQUENCE sets_id_seq;
ALTER TABLE sets ALTER COLUMN set_id SET DEFAULT nextval('sets_id_seq');

CREATE SEQUENCE answers_id_seq;
ALTER TABLE answers ALTER COLUMN answer_id SET DEFAULT nextval('answers_id_seq');

ALTER TABLE questions
ALTER COLUMN question_id SET DATA TYPE INTEGER,
ALTER COLUMN question_id SET DEFAULT nextval('questions_id_seq');