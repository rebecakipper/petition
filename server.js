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
    //if user not loged in(cookie)
    //       redirect to /register
    //else
    res.redirect("/petition");
});

app.get("/resgister", (req, res) => {
    //if user not loged in(cookie)
    //      render /register
    //
    //else
    res.redirect("/petition");
});

app.post("/register", (req, res) => {
    //if all fields are complete
    //      keep going
    //else
    //      send error message(must fill everything) aka formStatus = "invalid"
    //if user already exists
    //      send error message (try again)
    // else
    //      hash password(with bcryptjs package)
    ///     send user_data to db(insertUser())
    //      give cookie
    //      res.redirect("/petition")
    //
});

app.get("/petition", (req, res) => {
    // if user has NOT signed:
    //    render the petition page with the form

    if (!req.session.signatureId) {
        res.render("petition", {
            title: "Welcome",
            error_status: formStatus,
        });
    } else {
        res.redirect("/thank-you");
    }
});

app.post("/petition", (req, res) => {
    // if user signed
    //      formStatus = "valid"
    //    get uId from cookie.session
    //    use id to create matching user_signature
    //
    // db.createSignature(1st param= uId from cookie.session, 2nd param= signature itself req.body.user_signature)
    //      give cookie that user has signed & redirect to thank you
    //.then((id) => {
    // if (!id) {
    //     console.error("Error in insert:", err);
    //     res.end("somethiung went wrong in insert");
    // } else {
    //     req.session.signatureId = id;
    //     res.redirect("/thank-you");
    // }
    //
    //

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

/* register flow
1.GET/ render registration page with form
2.POST/ hash and send data to db, set session cookie
3.redirect to GET/ petiton page...


login flow
1. GET/ render login page
2. POST/ check credential and redirect to GET/ petition page


*/
