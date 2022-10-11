const bcrypt = require("bcryptjs");

module.exports.hash = (password) => {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
};

module.exports.authenticate = (password_input, user_hashed_password) => {
    return bcrypt
        .compare(password_input, user_hashed_password)
        .then((result) => result);
};
