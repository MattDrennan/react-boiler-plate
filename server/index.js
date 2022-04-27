const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3001;
const session = require('express-session');
const app = express();
var mysql = require('mysql');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');

/**
 * Prevent issues with sending requests
*/

app.use(cors({
    origin: ["http://localhost:3000"],
    method: ["GET", "POST"],
    credentials: true,
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Set up session
*/

app.use(session({
    key: "userID",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24,
    }
}));

app.use(cookieParser());

/**
 * Connect to mail server
 */

var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Connect to MySQL server
*/

const conn = mysql.createConnection({
    host: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    port: process.env.DB_PORT
});

// Connect to database
conn.connect((err) => {
    if (err) throw err;
    console.log('Mysql Connected!');
});

/**
 * Bcrypt Password Variables
*/
const saltRounds = 10;

/**
 * Verifys the user is valid using JWT
 */
const verifyJWT = (req, res, next) => {
    const token = req.cookies["access-token"];

    if (!token) {
        //return res.status(400).json({ error: "User Not Authenticated!" });
    } else {
        jwt.verify(token, process.env.SESSION_SECRET, (err, decoded) => {
            if (err) {
                //return res.status(400).json({ error: err });
            } else {
                req.authenticated = true;
                next();
            }
        });
    }
}

/**
* Logs in the user
*/
app.post("/login", (req, res) => {
    // Query
    let sql = 'SELECT * FROM users WHERE email = "' + req.body.info.email + '"';
    let query = conn.query(sql, (err, results, fields) => {
        if (results.length > 0) {
            // Check password
            bcrypt.compare(req.body.info.password, results[0].password, function (err, result) {
                if (result) {
                    const id = results[0].id;
                    const token = jwt.sign({ id }, process.env.SESSION_SECRET, {
                        expiresIn: 300,
                    });
                    const accountType = results[0].type;

                    // Token
                    res.cookie("access-token", token, {
                        maxAge: 60 * 60 * 24 * 30 * 1000,
                        httpOnly: true,
                    });

                    // User ID
                    res.cookie("id", id, {
                        maxAge: 60 * 60 * 24 * 30 * 1000,
                        httpOnly: true,
                    });

                    // Admin
                    res.cookie("accountType", accountType, {
                        maxAge: 60 * 60 * 24 * 30 * 1000,
                        httpOnly: true,
                    });

                    res.json({ auth: true, token: token, result: results });
                } else {
                    res.json({ auth: false, message: "Incorrect e-mail or password." });
                }
            });
        } else {
            res.json({ auth: false, message: "Incorrect e-mail or password." });
        }
    });
});

/**
 * Registers the user into the database
*/
app.post("/register", (req, res) => {
    // Hash password
    bcrypt.hash("" + req.body.password, saltRounds, function (err, hash) {
        let data = { email: req.body.email, password: hash };

        let sql = 'INSERT INTO users SET ?';
        let query = conn.query(sql, data, (err, results) => {
            if (err) throw err;
            res.json({ 'success': true, 'response': results });
        });
    });
});

/**
 * Check if e-mail exists
*/
app.get("/checkuser", (req, res) => {
    let sql = 'SELECT * FROM users WHERE email = "' + req.query.email + '"';
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.json({ 'success': true, 'result': true });
        } else {
            res.json({ 'success': true, 'result': false });
        }
    });
});

/**
 * Send recovery e-mail to user
*/
app.post("/forgot", (req, res) => {
    // Query - Get user
    let sql = 'SELECT * FROM users WHERE email = "' + req.body.email + '"';
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            let random = Math.floor(Math.random() * 9999) + 1000;

            // Hash password
            bcrypt.hash("" + random, saltRounds, function (err, hash) {
                // Query - Update user password
                let sql2 = 'UPDATE users SET password = "' + hash + '" WHERE email = "' + req.body.email + '"';
                let query2 = conn.query(sql2);

                var mailOptions = {
                    from: process.env.EMAIL_FROM,
                    to: req.body.email,
                    subject: 'Account Recovery',
                    text: 'E-mail: ' + req.body.email + '\n\nPassword: ' + random + ''
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        res.json({ 'success': true, 'response': error });
                    } else {
                        res.json({ 'success': true, 'response': info.response });
                    }
                });
            });
        } else {
            res.json({ 'success': true, 'message': "Unable to locate an account with this e-mail address." });
        }
    });
});

/**
 * Send recovery e-mail to user
*/
app.post("/changepass", verifyJWT, (req, res) => {
    // Hash password
    bcrypt.hash("" + req.body.newpassword, saltRounds, function (err, hash) {
        // Query
        let sql = 'UPDATE users SET password = "' + hash + '" WHERE id = "' + req.cookies["id"] + '"';
        let query = conn.query(sql, (err, results, fields) => {
            res.json({ 'success': true, result: results });
        });
    });
});

/**
 * Logs the user out
*/
app.post("/logout", verifyJWT, (req, res) => {
    if (req.cookies["access-token"] && req.cookies["id"]) {
        // Destroy cookies
        res.clearCookie("access-token");
        res.clearCookie("id");
        res.clearCookie("accountType");
        res.end();
    }
});

/**
 * Get's if user is authenticated
*/
app.get("/isUserAuth", verifyJWT, (req, res) => {
    if (req.cookies["access-token"] && req.cookies["id"]) {
        res.json({ 'loggedIn': true, 'accountType': req.cookies["accountType"] });
    }
    else {
        res.json({ 'loggedIn': false });
    }
});

/**
 * Start listening on server, print information to screen
*/
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});