-- Please specify password strong for blogclient user!
CREATE ROLE blogclient WITH LOGIN CREATEDB PASSWORD 'strongpassword'; -- Creating a role which would be used by our application to connect to the database

CREATE DATABASE blog OWNER blogclient; -- Create a database of our application and assign the role blogclient as the owner of the database

-- Switch to that database 

CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(80) NOT NULL,
    password VARCHAR(80) NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE posts (
    id INT GENERATED ALWAYS AS IDENTITY,
    author_id INT NOT NULL,
    title VARCHAR(80) NOT NULL,
    content TEXT NOT NULL,
    PRIMARY KEY (post_id),
    FOREIGN KEY (author_id) REFERENCES users(author_id)
);

CREATE TABLE sessions (
    id CHAR(36) NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (session_id)
);

-- Filling with values

-- INSERT INTO users (username, password) VALUES ('admin', 'strongpassword');
-- INSERT INTO users (username, password) VALUES ('user1', 'strongpassword');

-- INSERT INTO posts (id, title, content) VALUES (1, 'Post 1', 'This is the first post');
-- INSERT INTO posts (id, title, content) VALUES (1, 'Post 2', 'This is the second post');
-- INSERT INTO posts (id, title, content) VALUES (2, 'Post 3', 'This is the third post');
