// loads all variables that are found in the .env file,
// and adds them to process.env! Now you can use them in your script below.
require("dotenv").config();

const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;

// create a db object. it can talk to the database: use db.query(...)
const db = spicedPg(DATABASE_URL);

module.exports.getAllSigners = function () {
    const sql =
        "SELECT user_homepage, first_name, last_name, user_age, user_city FROM signatures JOIN profiles ON signatures.user_id = profiles.user_id JOIN users ON users.id = profiles.user_id;";
    // NB! remember to RETURN the promise!
    return db
        .query(sql)
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("error selecting signers", error);
        });
};

module.exports.createUser = function (
    first_name,
    last_name,
    user_email,
    user_password
) {
    const sql = `
        INSERT INTO users (first_name, last_name, user_email, user_password)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
    `;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [first_name, last_name, user_email, user_password])
        .then((result) => result.rows)
        .catch((error) => console.log("error inserting signer", error));
};

module.exports.countSigners = function () {
    const sql = `SELECT COUNT(*) FROM signatures;`;
    return db
        .query(sql)
        .catch((error) => console.log("error counting signers", error));
};

module.exports.getSignature = function (userID) {
    const sql = `SELECT user_signature FROM signatures WHERE id=$1;`;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [userID])
        .catch((error) =>
            console.log("error retrieving signature from signers", error)
        );
};

module.exports.createProfile = function (
    user_id,
    user_age,
    user_city,
    user_homepage
) {
    const sql = `
        INSERT INTO profiles (user_id, user_age, user_city, user_homepage)
        VALUES ($1, $2, $3, $4);
    `;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [user_id, user_age, user_city, user_homepage])
        .then((result) => result.rows)
        .catch((error) => console.log("error creating profile", error));
};

module.exports.createSignature = function (user_id, user_signature) {
    const sql = `
        INSERT INTO signatures (user_id, user_signature)
        VALUES ($1, $2);
    `;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [user_id, user_signature])
        .then((result) => result.rows)
        .catch((error) => console.log("error creating profile", error));
};

module.exports.getUserByEmail = function (user_email) {
    const sql = `SELECT * FROM users WHERE user_email=$1 RETURNING user_password, id;`;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [user_email])
        .catch((error) => console.log("error retrieving user by email", error));
};

module.exports.getSignersByCity = function (city) {
    const sql =
        "SELECT user_homepage, first_name, last_name, user_age FROM signatures JOIN profiles ON signatures.user_id = profiles.user_id JOIN users ON users.id = profiles.user_id WHERE user_city=$1;";
    // NB! remember to RETURN the promise!
    return db
        .query(sql, [city])
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("error selecting signers by city", error);
        });
};
