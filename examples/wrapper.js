const { constants, Promise: ZooKeeper } = require('../lib/index');
const logger = require('./logger');

const host = process.argv[2] || '127.0.0.1:2181';

let client;
let isConnected = false;

/**
 * @param timeoutMs {number}
 * @returns {ZooKeeper}
 */
function createClient(timeoutMs = 5000) {
    if (!client) {
        isConnected = false;
        logger.log('creating a client.');

        const config = {
            connect: host,
            timeout: timeoutMs,
            debug_level: constants.ZOO_LOG_LEVEL_INFO,
            host_order_deterministic: false,
        };

        client = new ZooKeeper(config);

        client.on('close', () => {
            isConnected = false;
            logger.log('close', `session closed, id=${client.client_id}`);
            client = null;
        });

        client.on('connecting', () => {
            isConnected = false;
            logger.log('connecting', `session connecting, id=${client.client_id}`);
        });

        client.on('connect', () => {
            isConnected = true;
            logger.log('connect', `session connect, id=${client.client_id}`);
        });

        setTimeout(() => {
            client.init({});
        }, 1000);
    }

    return client;
}

/** @returns {ZooKeeper} */
function getClient() {
    return createClient();
}

function isClientConnected() {
    return isConnected;
}

module.exports = {
    constants,
    ZooKeeper,
    getClient,
    isClientConnected,
};
