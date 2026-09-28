CREATE TYPE user_role AS ENUM ('reviewer','submitter');

CREATE TYPE submission_status AS ENUM ('pending','in_review','approved','changes_requested');


CREATE TABLE users(
id SERIAL PRIMARY KEY ,
name VARCHAR(50) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
role user_role NOT NULL,
profile_picture VARCHAR(255),
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects(
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
description TEXT,
owner_id INTEGER NOT NULL REFERENCES users(id),
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE submissions(
id SERIAL PRIMARY KEY,
project_id  INTEGER NOT NULL REFERENCES projects(id),
submitted_by INTEGER NOT NULL REFERENCES users(id),
code_content TEXT NOT NULL,
status submission_status NOT NULL DEFAULT 'pending',
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments(
id SERIAL PRIMARY KEY ,
submission_id INTEGER NOT NULL REFERENCES submissions(id),
author_id INTEGER NOT NULL REFERENCES users(id),
content TEXT NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);