// import package
const express = require('express');
const session = require('express-session');
const mysql_query = require('./utils/mysql_query');
const {body, validationResult, check} = require('express-validator');

// express setup
const app = express();
const port = 3000;
app.use(express.static('public', {root: __dirname}));

// parse incoming data
app.use(express.urlencoded({extended: true}));

// ejs setup
app.set('view engine', 'ejs');

// session middleware
const expired = 1000 * 60 * 60;
app.use(session({
    secret: 'thismysecretbroqwerty12345',
    saveUninitialized: true,
    cookie: {maxAge: expired},
    resave: false
}));

// home
app.get('/', (req, res) => {
    db.query(`SELECT * FROM videos`, (errror, result) => {
        res.render('index', {
            videos: result
        })
    });
});


app.get('/login', (req, res) => {
   res.render('login'); 
})

// login
app.post('/login', async (req, res) => {
    const users = await mysql_query.readTable('users');
    const errors = {common: 0, admin: 0};

    users.forEach(user => {
        if(user.username === req.body.username && user.password === req.body.password) {
            req.session.userid = req.body.username;
            errors.common = 0;
        } else {
            errors.common = 1;
        }

        if(req.body.checkbox === 'on' && user.admin_pass === req.body.admin_pass) {
            errors.admin = 0;
        } else if(typeof req.body.checkbox === 'undefined') {
            errors.admin = 0;
        } else {
            errors.admin = 1;
        }
        req.session.role = user.role;
    });
    console.log(errors);
});

// listen
app.listen(port, () => {
    console.log(`TrackTube is listening on port https://localhost:${port}`)
});
