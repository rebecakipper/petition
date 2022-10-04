/////// validator.js npm module

const db = require("./db");
const express = require("express");
const PORT = 3000;
const app = express();
const path = require("path");
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");
let formStatus = "valid";

//////////////////////////////////////////MIDDLEWARES////////////////////////////////////////////////////////////

app.use(express.urlencoded({ extended: false })); // makes req.body readable
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(
    cookieSession({
        secret: process.env.SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

//////////////////////////////////////////ROUTES////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
    // if user has NOT signed:
    //    render the petition page with the form

    if (!req.session.signatureId) {
        res.render("welcome", {
            title: "Welcome",
            error_status: formStatus,
        });
    } else {
        res.redirect("/thank-you");
    }
});

app.post("/", (req, res) => {
    if (req.body.first_name && req.body.last_name && req.body.user_signature) {
        formStatus = "valid";
        db.createSigner(
            req.body.first_name,
            req.body.last_name,
            req.body.user_signature
        ).then((id) => {
            if (!id) {
                console.error("Error in insert:", err);
                res.end("somethiung went wrong in insert");
            } else {
                req.session.signatureId = id;
                res.redirect("/thank-you");
            }
        });
    } else {
        formStatus = "invalid";
        res.redirect("/");
    }
});

app.get("/thank-you", (req, res) => {
    if (req.session.signatureId) {
        const sigId = req.session.signatureId[0].id;
        Promise.all([db.countSigners(), db.getSignature(sigId)]).then(
            (results) => {
                const number_of_signers = results[0].rows[0].count;
                const user_signature = results[1].rows[0].user_signature;
                res.render("thank-you", {
                    title: "thank you for signing",
                    user_signature,
                    signatures_page: "/signatures",
                    number_of_signers,
                });
            }
        );
        return;
    } else {
        // else:
        //     REDIRECT to home/petition page
        res.redirect("/");
    }
});

app.get("/signatures", (req, res) => {
    // if user has signed:
    //     Get data from db
    if (req.session.signatureId) {
        db.getAllSigners().then((rows) => {
            // console.log("Here are all the signers");
            // console.log(rows);
            res.render("signatures", {
                title: "all signers",
                rows,
            });
        });
    } else {
        res.redirect("/");
    }
});

app.listen(PORT, () =>
    console.log(`Express project running listeneing on port:${PORT}`)
);
