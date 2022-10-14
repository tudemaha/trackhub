const mysql = require('mysql2');
require('dotenv').config({path: '../.env'});
const fs = require('fs');

const connection = mysql.createConnection({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DASTABASE
});

module.exports = connection;