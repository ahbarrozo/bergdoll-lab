CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    path TEXT NOT NULL,
    title VARCHAR(100),
    locale VARCHAR(5) NOT NULL
);