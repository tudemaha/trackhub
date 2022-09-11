const connection = require('./mysql_config');

const readTable = (table) => {
    const data = new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM ${table}`, (error, result) => {
            resolve(result);
            reject(error);
        });
    });

    return data
        .then(result => JSON.stringify(result))
        .then(result => JSON.parse(result))
        .catch(err => err);
}

const login = (username) => {
    const userData = new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM users WHERE username = '${username}'`, (error, result) => {
            resolve(result);
            reject(error);
        });
    });

    return userData
        .then(result => JSON.stringify(result))
        .then(result => JSON.parse(result))
        .catch(err => err);
}


const insertData = (table, data) => {
    const status = new Promise((resolve, reject) => {
        connection.query(`INSERT INTO ${table} SET ?`, data, (error, result) => {
            resolve(result);
            reject(error);
        });
    });

    return status
        .then(result => {
            return {status: true, insertId: result.insertId};
        })
        .catch(err => err);
}

const readOneItem = (table, key, value) => {
    const data = new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM ${table} WHERE ${key} = '${value}'`, (error, result) => {
            resolve(result);
            reject(error);
        });
    });

    return data
        .then(result => JSON.stringify(result))
        .then(result => JSON.parse(result))
        .catch(err => err);
}

const updateData = (table, key, value, newData) => {
    const data = new Promise((resolve, reject) => {
        connection.query(`UPDATE ${table} SET ? WHERE ${key} = ${value}`, newData, (error, result) => {
            resolve(result);
            reject(error);
        });
    });

    return data
        .then(result => true)
        .catch(err => err);
}

const deleteData = (table, key, value) => {
    const data = new Promise((resolve, reject) => {
        connection.query(`DELETE FROM ${table} WHERE ${key} = '${value}'`, (error, result) => {
            resolve(result);
            reject(error);
        })
    });

    return data
        .then(result => true)
        .catch(err => err);
}

module.exports = {readTable, login, insertData, readOneItem, updateData, deleteData};