CREATE TABLE blog_post_types (
    id SERIAL PRIMARY KEY,
    color VARCHAR(30) NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL
);

INSERT INTO blog_post_types (color, name, display_name) 
    VALUES ('oklch(45% 0.187 3.815)', 'events', 'Events');

INSERT INTO blog_post_types (color, name, display_name) 
    VALUES ('oklch(68% 0.169 237.323)', 'music_theory', 'Music Theory');

INSERT INTO blog_post_types (color, name, display_name) 
    VALUES ('oklch(79% 0.184 86.047)', 'personal', 'Personal');

INSERT INTO blog_post_types (color, name, display_name) 
    VALUES ('oklch(27% 0.006 286.033)', 'other', 'Other');