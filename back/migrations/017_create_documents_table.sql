CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    path TEXT NOT NULL,
    title VARCHAR(100),
    locale VARCHAR(5) NOT NULL
);

CREATE TABLE blog_posts_documents (
    blog_post_id INTEGER REFERENCES blog_posts(id),
    document_id INTEGER REFERENCES documents(id),
    PRIMARY KEY (blog_post_id, document_id)
);