const { createClient, ZooKeeper } = require('./wrapper.js');
const notifier = require('./notifier.js');
const { createNode, persistentNode } = require('./createnode.js');

const noop = () => {};

async function addTask(data) {
    const client = createClient();
    client.connect({}, noop);

    await client.on_connected();
    notifier.emit('connect', `addTask: session established, id=${client.client_id}`);

    // eslint-disable-next-line no-bitwise
    const message = await createNode(client, '/tasks/task-', persistentNode | ZooKeeper.ZOO_SEQUENCE, data);
    notifier.emit('addTask', message);
}

module.exports = {
    addTask,
};
