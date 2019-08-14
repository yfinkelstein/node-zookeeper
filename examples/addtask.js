const { constants, createClient } = require('./wrapper.js');
const notifier = require('./notifier.js');
const { createNode, persistentNode } = require('./createnode.js');

async function createTask(client, data) {
    // eslint-disable-next-line no-bitwise
    const message = await createNode(client, '/tasks/task-', persistentNode | constants.ZOO_SEQUENCE, data);
    notifier.emit('addTask', message);
}

async function addTask(data) {
    const client = createClient();

    client.on('connect', () => {
        notifier.emit('connect', `addTask: session established, id=${client.client_id}`);

        createTask(client, data);
    });
    client.init({});
}

module.exports = {
    addTask,
};
