const { createClient, ZooKeeper } = require('./wrapper.js');
const notifier = require('./notifier.js');
const logger = require('./logger.js');

const noop = () => {};

function emit(client, path) {
    logger.log(`(${path}) client id: ${client.client_id}`);
    notifier.emit('createWorker', client);
}

async function createWorker() {
    const client = createClient();
    client.connect({}, noop);

    client.on_connected();
    notifier.emit('connect', `createWorker: session established, id=${client.client_id}`);

    try {
        // eslint-disable-next-line no-bitwise
        const path = await client.create('/workers/worker-', '', ZooKeeper.ZOO_EPHEMERAL | ZooKeeper.ZOO_SEQUENCE);
        emit(client, path);
    } catch (error) {
        logger.error(error);
    }
}

module.exports = {
    createWorker,
};
