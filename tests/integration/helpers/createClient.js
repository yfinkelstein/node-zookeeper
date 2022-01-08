const { constants, Promise: ZooKeeper } = require('../../../lib/index');

const host = process.argv[2] || '127.0.0.1:2181';

function createClient(id, password) {
    const config = {
        connect: host,
        timeout: 5000,
        debug_level: constants.ZOO_LOG_LEVEL_WARN,
        host_order_deterministic: false,
        client_id: id,
        client_password: password,
    };

    return new ZooKeeper(config);
}

module.exports = {
    createClient,
    constants,
};
