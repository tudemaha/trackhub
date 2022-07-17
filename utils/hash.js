const {createHash} = require('node:crypto');

const getHash = (data) => {
    const hash = createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

module.exports = getHash;