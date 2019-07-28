const { createClient, ZooKeeper } = require('./wrapper.js');
const notifier = require('./notifier.js');
const logger = require('./logger.js');

function emit(client, path) {
    logger.log(`(${path}) client id: ${client.client_id}`);
    notifier.emit('createWorker', client);
}

async function createWorkerPath(client, path) {
    try {
        // eslint-disable-next-line no-bitwise
        const createdPath = await client.create(path, '', ZooKeeper.ZOO_EPHEMERAL | ZooKeeper.ZOO_SEQUENCE);
        emit(client, createdPath);
    } catch (error) {
        logger.error(error);
    }
}

async function createWorker() {
    const client = createClient();

    client.on('connect', () => {
        notifier.emit('connect', `createWorker: session established, id=${client.client_id}`);
        createWorkerPath(client, '/workers/worker-');
    });

    client.init({});
}

module.exports = {
    createWorker,
};
