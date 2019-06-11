const { createClient, ZooKeeper } = require('./wrapper.js');
const notifier = require('./notifier.js');
const { createNode, persistentNode } = require('./createnode.js');

const noop = () => {};

function addTask(data) {
  const client = createClient();

  client.on('connect', () => {
    notifier.emit('connect', `addTask: session established, id=${client.client_id}`);

    // eslint-disable-next-line no-bitwise
    createNode(client, '/tasks/task-', persistentNode | ZooKeeper.ZOO_SEQUENCE, data)
      .then((message) => {
        notifier.emit('addTask', message);
      });
  });

  client.connect(noop);
}

module.exports = {
  addTask,
};
