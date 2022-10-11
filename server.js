/////// validator.js npm module

const db = require("./db");
const bcrypt = require("./bcrypt");
const express = require("express");
const PORT = 3000;
const app = express();
const path = require("path");
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");
//let formStatus = "valid";
const {
    logger,
    ensureSignedIn,
    ensureSignedOut,
    ensurePetitionSigned,
    ensurePetitionNotSigned,
} = require("./middleware");

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

app.use(logger);
//////////////////////////////////////////ROUTES////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
    //if user not loged in(cookie)
    //       redirect to /register
    res.redirect("/register");
    //
    //else
    //res.redirect("/petition");
});

app.get("/register", ensureSignedOut, (req, res) => {
    //if user not loged in(cookie)
    //      render /register
    res.render("register", {
        title: "Register",
    });
    //
    //else
    //res.redirect("/petition");
});

app.post("/register", ensureSignedOut, (req, res) => {
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
                console.log(id);
                req.session.userId = id;
                //db.createProfile(id);
                res.redirect("/profile");
            }
        });
    });
});

app.get("/login", ensureSignedOut, (req, res) => {
    //if user not loged in(cookie)
    //      render /register
    res.render("login", {
        title: "Login",
    });
    //
    //else
    //res.redirect("/petition");
});

app.post("/login", ensureSignedOut, (req, res) => {
    db.getUserByEmail(req.body.user_email).then(([hashed_password, id]) => {
        const uId = id;
        bcrypt
            .authenticate(req.body.user_password, hashed_password)
            .then((result) => {
                if (result === true) {
                    req.session.userId = uId;
                    res.redirect("/profile");
                } else {
                    res.render("login", {
                        title: "Login",
                        error_status:
                            "please try again, something is not correct",
                    });
                }
            });
    });
});

app.get("/profile", ensureSignedIn, (req, res) => {
    //if user not loged in(cookie)
    //      render /register
    res.render("profile", {
        title: "Profile",
    });

    //
    //else
    //res.redirect("/petition");
});

app.post("/profile", ensureSignedIn, (req, res) => {
    console.log(req.session.userId);

    db.createProfile(
        req.session.userId,
        req.body.user_age,
        req.body.user_city,
        req.body.user_homepage
    ).then(() => res.redirect("/petition"));
});

app.get("/petition", ensureSignedIn, ensurePetitionNotSigned, (req, res) => {
    res.render("petition", {
        title: "Welcome",
    });
});

app.post("/petition", ensureSignedIn, ensurePetitionNotSigned, (req, res) => {
    db.createSignature(req.session.userId, req.body.user_signature).then(() => {
        //give cookie that user has signed & redirect to thank you
        req.session.signed = true;
        res.redirect("/thank-you");
    });
});

app.get("/thank-you", ensureSignedIn, ensurePetitionSigned, (req, res) => {
    console.log("thank you : ", req.session.userId);
    Promise.all([db.countSigners(), db.getSignature(req.session.userId)]).then(
        ([count, userSignature]) => {
            console.log(count, userSignature);

            const number_of_signers = count.rows[0].count;
            const user_signature = userSignature.rows[0].user_signature;
            res.render("thank-you", {
                title: "thank you for signing",
                user_signature,
                signatures_page: "/signatures",
                number_of_signers,
                edit_profile: "/profile/edit",
                edit_signature: "/profile/signature/edit",
            });
        }
    );
});

app.get("/signatures", ensureSignedIn, ensurePetitionSigned, (req, res) => {
    db.getAllSigners().then((rows) => {
        res.render("signatures", {
            title: "all signers",
            rows,
        });
    });
});

app.get(
    "/signatures/:city",
    ensureSignedIn,
    ensurePetitionSigned,
    (req, res) => {
        let city = req.params.city;
        db.getSignersByCity(city).then((rows) => {
            res.render("signatures-city", {
                title: "Signers in " + city,
                user_city: city,
                rows,
            });
        });
    }
);

app.get("/logout", ensureSignedIn, (req, res) => {
    req.session = null;
    res.redirect("/register");
    //
    //else
    //res.redirect("/petition");
});

app.get("/profile/edit", ensureSignedIn, (req, res) => {
    console.log(req.session.userId);
    db.getUserData(req.session.userId).then(({ rows: [row] }) => {
        const {
            first_name,
            last_name,
            user_email,
            user_age,
            user_city,
            user_homepage,
        } = row || {};

        return res.render("profile-edit", {
            title: "Edit profile",
            first_name,
            last_name,
            user_email,
            user_age,
            user_city,
            user_homepage,
        });
    });
});

app.post("/profile/edit", ensureSignedIn, (req, res) => {
    db.updateUserData(
        req.session.userId,
        req.body.first_name,
        req.body.last_name,
        req.body.user_email
    ).then(() => {
        db.upsertUserProfile(
            req.session.userId,
            req.body.user_age,
            req.body.user_city,
            req.body.user_homepage
        );
        return res.redirect("/profile/edit");
    });
});

app.get(
    "/profile/edit/signature",
    ensureSignedIn,
    ensurePetitionSigned,
    (req, res) => {
        db.getSignature(req.session.userId).then((result) => {
            const user_signature = result.rows[0].user_signature;
            res.render("delete-signature", {
                title: "Edit signature",
                // user_name,
                user_signature,
                // error_status,
                // edit_signature,
            });
        });
    }
);

app.listen(PORT, () =>
    console.log(`Express project running listeneing on port:${PORT}`)
);
