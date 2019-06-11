const { createClient, ZooKeeper } = require('./wrapper.js');
const notifier = require('./notifier.js');
const logger = require('./logger.js');

const noop = () => {};

function emit(client, path, rc) {
  logger.log(`(${path}) result code: ${rc} client id: ${client.client_id}`);
  notifier.emit('createWorker', client);
}

function createWorker() {
  const client = createClient();

  client.on('connect', () => {
    notifier.emit('connect', `createWorker: session established, id=${client.client_id}`);

    // eslint-disable-next-line no-bitwise
    client.a_create('/workers/worker-', '', ZooKeeper.ZOO_EPHEMERAL | ZooKeeper.ZOO_SEQUENCE, (rc, error, path) => {
      emit(client, path, rc);
    });
  });

  client.connect(noop);
}

module.exports = {
  createWorker,
};
