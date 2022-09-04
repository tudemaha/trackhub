// import package
const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const {body, validationResult, check} = require('express-validator');
const flash = require('connect-flash');
const mysql_query = require('./utils/mysql_query');
const getHash = require('./utils/hash');
const parse = require('./utils/parse');

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
    const videos = await mysql_query.readTable('podcasts');
    // console.log(videos);
    // console.log(req.session);
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
    let userData = await mysql_query.login(req.body.username);
    const errors = {common: 0, admin: 0};

    // login authorization
    userData = userData[0];
    // console.log(userData);
    if(typeof userData === 'undefined') {
        errors.common = 1;
    } else {
        if(userData.password !== getHash(req.body.password)) {
            errors.common = 1;
        } else {
            req.session.username = req.body.username;
            req.session.role = 'user';
            errors.common = 0;

            if(req.body.checkbox === 'on') {
                if(userData.admin_pass !== getHash(req.body.admin_pass)) {
                    errors.admin = 1;
                } else {
                    req.session.role = 'admin';
                    errors.admin = 0;
                }
            }
        }
    }

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
    } else if(!req.session.username && !req.session.role) {
        res.redirect('/login');
    } else {
        return next();
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

app.post('/new', async (req, res) => {
    const podcastData = req.body;

    const today = new Date();
    podcastData.duration = parse.duration(podcastData.duration);
    
    const podcastDetail = {
        podcast_id: podcastData.podcast_id,
        video_id: podcastData.video_id,
        definition: podcastData.definition,
        title: podcastData.title,
        duration: podcastData.duration,
        published: podcastData.published
    };
    
    const trackingData = {
        podcast_id: podcastData.podcast_id,
        timestamp: today,
        likes: podcastData.likes,
        views: podcastData.views
    }

    const status1 = await mysql_query.insertData('podcasts', podcastDetail);
    const status2 = await mysql_query.insertData('tracks', trackingData);
    if(status1 === true && status2 === true) {
        res.redirect('/');
    }
});

// logout
app.get('/logout', (req, res) => {
    req.session.username = undefined;
    req.session.role = undefined;
    req.session.destroy();
    res.redirect('/login');
})

app.use((req, res) => {
    res.send("404 bro");
})

// listen
app.listen(port, () => {
    console.log(`TrackHub is listening on port https://localhost:${port}`)
});
