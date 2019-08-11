const { constants, createClient } = require('./wrapper.js');
const notifier = require('./notifier.js');
const logger = require('./logger.js');

function emit(client, path) {
    logger.log(`(${path}) ${client.client_id}`);
    notifier.emit('leader', client);
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
        const res = await client.w_get(path, watchFunc);
        onData(client, path, res.rc, res.error, res.stat, res.data);
    } catch (error) {
        logger.error(error);
    }
}

async function runForLeader(client, path) {
    const clientId = client.client_id;

    try {
        await client.create(path, `${clientId}`, constants.ZOO_EPHEMERAL);
        emit(client, path);
    } catch (error) {
        await checkMaster(client, path, runForLeader);
    }
}

async function electLeader(path) {
    const client = createClient();

    client.on('connect', () => {
        notifier.emit('connect', `electLeader: session established, id=${client.client_id}`);
        runForLeader(client, path);
    });

    client.init({});
}

module.exports = {
    electLeader,
};
