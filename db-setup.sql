DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS profiles;


CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL CHECK(first_name != ''),
    last_name VARCHAR(255) NOT NULL CHECK(last_name != ''),
    user_email VARCHAR(255) NOT NULL CHECK(user_email != '') UNIQUE,
    user_password TEXT NOT NULL CHECK (user_password != ''),
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    user_signature text NOT NULL,
    user_id INT NOT NULL REFERENCES users(id),
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles(
    id SERIAL PRIMARY KEY,
    user_age INT,
    user_city VARCHAR(255),
    user_homepage VARCHAR(255),
    user_id INT NOT NULL REFERENCES users(id),
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
