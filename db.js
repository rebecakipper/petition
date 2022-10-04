// loads all variables that are found in the .env file,
// and adds them to process.env! Now you can use them in your script below.
require("dotenv").config();

const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;

// create a db object. it can talk to the database: use db.query(...)
const db = spicedPg(DATABASE_URL);

module.exports.getAllSigners = function () {
    const sql = "SELECT * FROM signers;";
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

module.exports.createSigner = function (first_name, last_name, user_signature) {
    const sql = `
        INSERT INTO signers (first_name, last_name, user_signature)
        VALUES ($1, $2, $3)
        RETURNING id;
    `;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [first_name, last_name, user_signature])
        .then((result) => result.rows)
        .catch((error) => console.log("error inserting signer", error));
};

module.exports.countSigners = function () {
    const sql = `SELECT COUNT(*) FROM signers;`;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql)
        .catch((error) => console.log("error counting signers", error));
};

module.exports.getSignature = function (userID) {
    const sql = `SELECT user_signature FROM signers WHERE id=$1;`;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [userID])
        .catch((error) =>
            console.log("error retrieving signature from signers", error)
        );
};
// Example of an SQL injection attack!
// createCity("Berlin'; DROP TABLE users;")
