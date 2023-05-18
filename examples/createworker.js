const { constants } = require('./wrapper');
const notifier = require('./notifier');
const logger = require('./logger');

function emit(client, path) {
    logger.log(`(${path}) client id: ${client.client_id}`);
    notifier.emit('createWorker');
}

async function createWorkerPath(client, path) {
    try {
        // eslint-disable-next-line no-bitwise
        const createdPath = await client.create(path, '', constants.ZOO_EPHEMERAL | constants.ZOO_SEQUENCE);
        emit(client, createdPath);
    } catch (error) {
        logger.error('createWorkerPath', error.message);
    }
}

async function createWorker(client) {
    createWorkerPath(client, '/workers/worker-');
}

module.exports = {
    createWorker,
};
