const bcrypt = require("bcryptjs");

module.exports.hash = (password) => {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
};

module.exports.authenticate = (
    password_input,
    user_hashed_password,
    user_id
) => {
    return bcrypt
        .compare(password_input, user_hashed_password)
        .then((result, id) => console.log("is password correct?: ", result));
};
