const connection = require('./mysql_config');

const readTable = (table) => {
    const data = new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM users`, (error, result) => {
            resolve(result);
            reject(error);
        });
    });

    return data
        .then(result => JSON.stringify(result))
        .then(result => JSON.parse(result))
        .catch(err => err);
}

module.exports = {readTable};