require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
const BearerStrategy = require("passport-azure-ad").BearerStrategy;

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

passport.use(new BearerStrategy({
    identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.CLIENT_ID,
    audience: process.env.AUDIENCE,
    validateIssuer: false, // Set to true if you want to validate the issuer - recommended for production
    passReqToCallback: false,
    loggingLevel: 'info'
}, (token, done) => {
    return done(null, token);
}));

app.use(passport.initialize());

app.get("/api/secure", passport.authenticate("oauth-bearer", { session: false }), (req, res) => {
    res.json({ message: "You have accessed a protected API!", user: req.user });
});

app.get("/api/public", (req, res) => {
    res.json({ message: "This is a public endpoint." });
});

app.listen(process.env.PORT, () => console.log(`API running on http://localhost:${process.env.PORT}`));