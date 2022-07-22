// import package
const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const {body, validationResult, check} = require('express-validator');
const flash = require('connect-flash');
const mysql_query = require('./utils/mysql_query');
const getHash = require('./utils/hash');

// express setup
const app = express();
const port = 3000;
app.use(express.static('public', {root: __dirname}));

// parse incoming data
app.use(express.urlencoded({extended: true}));
app.use(express.json());

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

// flash setup
app.use(flash());

// home
app.get('/', async (req, res) => {
    const videos = await mysql_query.readTable('videos');
    console.log(req.session);
    if(req.session.username && req.session.role) {
        res.render('index', {
            videos,
            account: {username: req.session.username, role: req.session.role}
        });
    } else {
        res.redirect('/login');
    }
});

// login form
app.get('/login', (req, res) => {
    if(req.session.username && req.session.role) {
        res.redirect('/');
    } else {
        res.render('login'); 
    }
})

// login
app.post('/login', async (req, res) => {
    // prepare for login authorization
    const users = await mysql_query.readTable('users');
    const errors = {common: 0, admin: 0};

    // login authorization
    users.forEach(user => {
        if(user.username === req.body.username) {
            if(user.password === getHash(req.body.password)) {
                req.session.username = req.body.username;
                req.session.role = 'user';
                errors.common = 0;
                if(req.body.checkbox === 'on') {
                    if(user.admin_pass === getHash(req.body.admin_pass)) {
                        req.session.role = 'admin';
                        errors.admin = 0;
                    } else {
                        errors.admin = 1;
                    }
                }
            }
        } else {
            errors.common = 1;
        }
    });

    // if login error
    if(errors.common || errors.admin) {
        res.render('login', {
            errors
        });
    } else {
        res.redirect('/');
    }
});

app.get('/new', (req, res, next) => {
    if(req.session.username && req.session.role === 'admin') {
        res.render('new', {
            account: {username: req.session.username, role: req.session.role}
        });
    } if(!req.session.username && !req.session.role) {
        res.redirect('/login');
    } else {
        next();
    }
});

app.post('/update', (req, res) => {
    fetch(`https://www.googleapis.com/youtube/v3/videos?id=${req.body.id}&key=AIzaSyDZuwEGbjFgQN9326KfqHpLCej7RusZNII&part=snippet,contentDetails,statistics&fields=items(id,snippet(publishedAt,title,thumbnails/standard),contentDetails(duration,definition),statistics)`)
        .then((response) => response.json())
        .then((response) => {
            const data = response.items;
            res.send(data);
        })
        .catch((error) => {
            res.status(400).send('Bad request.');
            console.log(error);
        });
});

// logout
app.get('/logout', (req, res) => {
    req.session.username = undefined;
    req.session.role = undefined;
    req.session.destroy();
    res.redirect('/login');
})

// listen
app.listen(port, () => {
    console.log(`TrackTube is listening on port https://localhost:${port}`)
});
