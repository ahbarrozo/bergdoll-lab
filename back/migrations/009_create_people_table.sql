CREATE TABLE people (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    description TEXT NOT NULL,
    title TEXT NOT NULL,
    link TEXT,
    locale VARCHAR(5),
    last_modification TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE people_images (
    person_id INTEGER REFERENCES people(id),
    image_id INTEGER REFERENCES images(id),
    PRIMARY KEY (person_id, image_id)
);

