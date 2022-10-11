const db = require("./db");

// Define a middleware function to log every single request.
function logger(req, res, next) {
    if (process.env.DEBUG) {
        console.log("---");
        const { method, url } = request;
        const time = new Date().toLocaleTimeString();
        console.log(`${method} ${url} [${time}]`);
        ["query", "body", "session"].forEach((item) =>
            console.log(item, { ...request[item] })
        );
        console.log("---\n");
    }
    next();
}

function ensureSignedIn(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
}

function ensureSignedOut(req, res, next) {
    if (req.session.userId) {
        return res.redirect("/petition");
    }
    // If we DO NOT have a userId:
    next();
}

function ensurePetitionNotSigned(req, res, next) {
    return db.getSignature(req.session.userId).then((result) => {
        if (result.rowCount > 0) {
            return res.redirect("/thank-you");
        }
        next();
    });
}

function ensurePetitionSigned(req, res, next) {
    return db.getSignature(req.session.userId).then((result) => {
        if (result.rowCount === 0) {
            return res.redirect("/petition");
        }
        next();
    });
    // OR if you previously put `.signed` in the session
    // when the user signed (or on login, if the user signed earlier),
    // just check for that instead of making the DB query here.
}

module.exports = {
    logger,
    ensureSignedIn,
    ensureSignedOut,
    ensurePetitionSigned,
    ensurePetitionNotSigned,
};
