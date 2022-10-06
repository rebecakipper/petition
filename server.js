/////// validator.js npm module

const db = require("./db");
const bcrypt = require("./bcrypt");
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
    res.redirect("/register");
    //
    //else
    //res.redirect("/petition");
});

app.get("/register", (req, res) => {
    //if user not loged in(cookie)
    //      render /register
    res.render("register", {
        title: "Register",
        error_status: formStatus,
    });
    //
    //else
    //res.redirect("/petition");
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
    bcrypt.hash(req.body.user_password).then((hashed_password) => {
        db.createUser(
            req.body.first_name,
            req.body.last_name,
            req.body.user_email,
            hashed_password
        ).then((id) => {
            if (!id) {
                console.error("Error in insert:", err);
                res.end("somethiung went wrong while creating user");
            } else {
                req.session.userId = id;
                res.redirect("/profile");
            }
        });
    });
});

app.get("/login", (req, res) => {
    //if user not loged in(cookie)
    //      render /register
    res.render("login", {
        title: "Login",
        error_status: formStatus,
    });
    //
    //else
    //res.redirect("/petition");
});

app.post("/login", (req, res) => {
    db.getUserByEmail(req.body.user_email).then((hashed_password, id) => {
        console.log({
            hashed_password,
            id,
        });
        bcrypt
            .authenticate(req.body.user_password, hashed_password)
            .then((result, id) => {
                if (result === "true") {
                    req.session.userId = id;
                    res.redirect("/profile");
                }
                formStatus = "invalid";
                res.render("login", {
                    title: "Login",
                    error_status: formStatus,
                });
            });
    });
});

app.get("/profile", (req, res) => {
    //if user not loged in(cookie)
    //      render /register
    res.render("profile", {
        title: "Profile",
        error_status: formStatus,
    });
    //
    //else
    //res.redirect("/petition");
});

app.post("/profile", (req, res) => {
    console.log(req.session.userId[0].id);
    db.createProfile(
        req.session.userId[0].id,
        req.body.user_age,
        req.body.user_city,
        req.body.user_homepage
    ).then(() => res.redirect("/petition"));
});

app.get("/petition", (req, res) => {
    // if user has NOT signed:
    //    render the petition page with the form
    res.render("petition", {
        title: "Welcome",
        error_status: formStatus,
    });
    // if (!req.session.signatureId) {
    //     res.render("petition", {
    //         title: "Welcome",
    //         error_status: formStatus,
    //     });
    // } else {
    //     res.redirect("/thank-you");
    // }
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

    db.createSignature(req.session.userId[0].id, req.body.user_signature).then(
        () => {
            //give cookie that user has signed & redirect to thank you
            req.session.signed = "true";
            res.redirect("/thank-you");
        }
    );
});

app.get("/thank-you", (req, res) => {
    if (req.session.signed) {
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
    if (req.session.signatureId) {
        db.getAllSigners().then((rows) => {
            res.render("signatures", {
                title: "all signers",
                rows,
            });
        });
    } else {
        res.redirect("/");
    }
});

app.get("/signatures/:city", (req, res) => {
    let city = req.params.city;
    db.getSignersByCity(city).then((rows) => {
        res.render("signatures-city", {
            title: "Signers in " + city,
            rows,
        });
    });
});

app.get("logout", (req, res) => {
    //if user not loged in(cookie)
    //       redirect to /register
    req.session = null;
    res.redirect("/register");
    //
    //else
    //res.redirect("/petition");
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
