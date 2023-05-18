const { constants, Promise: ZooKeeper } = require('../lib/index');
const logger = require('./logger');

const host = process.argv[2] || '127.0.0.1:2181';

let client;
let timeoutId;

function stopTimer() {
    clearTimeout(timeoutId);
}

function startTimer() {
    stopTimer();

    timeoutId = setTimeout(() => {
        throw new Error('ZooKeeper connection timeout');
    }, 10000);
}

/**
 * @param timeoutMs {number}
 * @returns {ZooKeeper}
 */
function createClient(timeoutMs = 15000) {
    if (!client) {
        logger.log('creating a client.');

        const config = {
            connect: host,
            timeout: timeoutMs,
            debug_level: constants.ZOO_LOG_LEVEL_INFO,
            host_order_deterministic: false,
        };

        client = new ZooKeeper(config);

        client.on('close', () => {
            stopTimer();

            logger.log('close', `session closed, id=${client.client_id}`);

            client = null;
        });

        client.on('connecting', () => {
            startTimer();

            logger.log('connecting', `session connecting, id=${client.client_id}`);
        });

        client.on('connect', () => {
            stopTimer();

            logger.log('connect', `session connect, id=${client.client_id}`);
        });

        setTimeout(() => {
            client.init({});

            startTimer();
        }, 1000);
    }

    return client;
}

/** @returns {ZooKeeper} */
function getClient() {
    return createClient();
}

module.exports = {
    constants,
    ZooKeeper,
    getClient,
};
