const { constants, isClientConnected } = require('./wrapper');
const notifier = require('./notifier');
const logger = require('./logger');

function emit(client, path) {
    logger.log(`Elect leader: (${path}) ${client.client_id}`);
    notifier.emit('leader');
}

function onData(client, path, rc, error, stat, data) {
    const clientId = client.client_id;

    if (data && data.toString() === clientId) {
        emit(client, path);
    }
}

async function watcher(client, path, checkFunc, retryFunc, rc) {
    if (rc === -1) {
        await checkFunc(client, path, retryFunc);
    } else if (rc === 2) {
        await retryFunc(client, path);
    }
}

async function checkMaster(client, path, retryFunc) {
    const watchFunc = watcher.bind(null, client, path, checkMaster, retryFunc);

    try {
        if (!isClientConnected()) {
            throw new Error('is not connected');
        }
        const res = await client.w_get(path, watchFunc);
        onData(client, path, res.rc, res.error, res.stat, res.data);
    } catch (error) {
        logger.error('checkMaster:', error.message);
    }
}

async function runForLeader(client, path) {
    const clientId = client.client_id;

    try {
        if (!isClientConnected()) {
            throw new Error('is not connected');
        }
        await client.create(path, `${clientId}`, constants.ZOO_EPHEMERAL);
        emit(client, path);
    } catch (error) {
        logger.error('runForLeader:', error.message);
        await checkMaster(client, path, runForLeader);
    }
}

async function electLeader(client, path) {
    runForLeader(client, path);
}

module.exports = {
    electLeader,
};
