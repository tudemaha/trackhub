// import package
const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const flash = require('connect-flash');
const cron = require('node-cron');
const methodOverride = require('method-override');
require('dotenv').config();
const mysql_query = require('./utils/mysql_query');
const getHash = require('./utils/hash');
const conversion = require('./utils/conversion');

// express setup
const app = express();
const port = 3000;
app.use('/static', express.static('public', {root: __dirname}));
// app.use('/edit', express.static('public', {root: __dirname}));

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

// use method override
app.use(methodOverride('_method'));

// home
app.get('/', async (req, res) => {
    const videos = await mysql_query.readTable('podcasts');
    if(req.session.username && req.session.role) {
        res.render('index', {
            videos,
            account: {username: req.session.username, role: req.session.role},
            message: req.flash('info')
        });
    } else {
        res.redirect('/login');
    }
    console.log(process.env);
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

// new form
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

// fetch data from youtube api
app.post('/update', (req, res) => {
    fetch(`https://www.googleapis.com/youtube/v3/videos?id=${req.body.id}&key=${process.env.API_KEY}&part=snippet,contentDetails,statistics&fields=items(id,snippet(publishedAt,title,thumbnails/standard),contentDetails(duration,definition),statistics)`)
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

// save new data
app.post('/new', async (req, res) => {
    const podcastData = req.body;

    const today = new Date();
    podcastData.duration = conversion.duration(podcastData.duration);

    const podcastDetail = {
        participant_id: podcastData.participant_id,
        video_id: podcastData.video_id,
        definition: podcastData.definition,
        title: podcastData.title,
        duration: podcastData.duration,
        published: podcastData.published
    };
    const status1 = await mysql_query.insertData('podcasts', podcastDetail);
    
    const trackingData = {
        podcast_id: status1.insertId,
        timestamp: today,
        likes: podcastData.likes,
        views: podcastData.views
    }
    const status2 = await mysql_query.insertData('tracks', trackingData);

    if(status1.status === true && status2.status === true) {
        req.flash('info', 'Data inserted successfully.');
        res.redirect('/');
    }
});

// edit data form
app.get('/edit/:participantId', async (req, res, next) => {
    if(req.session.username && req.session.role === 'admin') {
        const podcast = await mysql_query.readTableByKey('podcasts', 'participant_id', req.params.participantId);  

        res.render('edit', {
            account: {username: req.session.username, role: req.session.role},
            podcast: podcast[0]
        });
    } else if(!req.session.username && !req.session.role) {
        res.redirect('/login');
    } else {
        return next();
    }
});

// update data
app.put('/update', async (req, res) => {
    const podcastData = req.body;
    console.log(podcastData);

    const podcastId = podcastData.podcast_id;
    podcastData.duration = conversion.duration(podcastData.duration);
    delete podcastData.podcast_id;

    const status = await mysql_query.updateData('podcasts', 'podcast_id', podcastId, podcastData);

    if(status === true) {
        req.flash('info', 'Data updated.');
        res.redirect('/');
    }
});

// delete data
app.delete('/delete', async (req, res) => {
    let podcastId = await mysql_query.readTableByKey('podcasts', 'participant_id', req.body.participant_id);
    podcastId = podcastId[0].podcast_id;
    
    const status1 = await mysql_query.deleteData('tracks', 'podcast_id', podcastId);
    const status2 = await mysql_query.deleteData('podcasts', 'podcast_id', podcastId);

    if(status1 === true && status2 === true) {
        req.flash('info', 'Data deleted successfully.');
        res.redirect('/');
    }
});

// show tracking details
app.get('/details/:participantId', async (req, res, next) => {
    if(req.session.username && req.session.role) {
        let video = await mysql_query.readTableByKey('podcasts', 'participant_id', req.params.participantId);
        video = video[0];
        video.published = conversion.timezone(video.published, 'id-ID', 'Asia/Makassar');
        
        if(typeof video === 'undefined') {
            return next();
        }

        res.render('details', {
            account: {username: req.session.username, role: req.session.role},
            video
        });
    } else {
        res.redirect('/login');
    }
});

// send tracking data for chart
app.post('/tracks', async (req, res) => {
    let podcastId = await mysql_query.readTableByKey('podcasts', 'participant_id', req.body.participant_id);
    podcastId = podcastId[0].podcast_id;

    const tracks = await mysql_query.readTableByKey('tracks', 'podcast_id', podcastId);

    for(let i in tracks) {
        tracks[i].timestamp = conversion.timezone(tracks[i].timestamp, 'id-ID', 'Asia/Makassar');
    }
    
    res.send(tracks);
});

// logout
app.get('/logout', (req, res) => {
    req.session.username = undefined;
    req.session.role = undefined;
    req.session.destroy();
    res.redirect('/login');
})

// 404 error
app.use((req, res) => {
    res.status(404).render('not_found');
})

// cron jobs
// cron.schedule('0,10,20,30,40,50 * * * *', async () => {
//     const ids = await mysql_query.readFields('podcasts', 'podcast_id', 'video_id');

//     ids.forEach(async (id) => {
//         const timestamp = new Date();

//         const data = await getTrackingData(id.video_id);
        
//         const tracks = {
//             podcast_id: id.podcast_id,
//             timestamp,
//             likes: data.likeCount,
//             views: data.viewCount
//         }
        
//         setTimeout(async () => {
//             await mysql_query.insertData('tracks', tracks);
//         }, 5000);
//         console.log('cron finished: ' + new Date());
//     });
// });

const getTrackingData = (videoId) => {
    return fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.API_KEY}&part=statistics&fields=items(statistics)`)
            .then((response) => {
                if(response.ok) {
                    return response.json();
                } else {
                    throw new Error('response not ok');
                }
            })
            .then((response) => response.items)
            .then((response) => response[0])
            .then((response) => response.statistics)
            .catch((error) => {throw error});
}

// listen
app.listen(port, () => {
    console.log(`TrackHub is listening on port https://localhost:${port}`)
});
