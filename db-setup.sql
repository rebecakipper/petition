DROP TABLE IF EXISTS signers;

CREATE TABLE signers(
    id SERIAL primary key,
    first_name VARCHAR(255) NOT NULL CHECK(first_name != ''),
    last_name VARCHAR(255) NOT NULL CHECK(last_name != ''),
    user_signature text NOT NULL,
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);