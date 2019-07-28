const { createClient } = require('./wrapper.js');
const notifier = require('./notifier.js');
const { createNode, persistentNode } = require('./createnode.js');

async function createAllNodes(client, paths) {
    const promises = [];
    paths.forEach((path) => {
        promises.push(createNode(client, path, persistentNode));
    });

    const messages = await Promise.all(promises);
    messages.forEach((message) => {
        notifier.emit('createNode', message);
    });
}

async function createNodes(paths) {
    const client = createClient();

    client.on('close', () => {
        notifier.emit('close', `session closed, id=${client.client_id}`);
    });

    client.on('connect', () => {
        notifier.emit('connect', `session established, id=${client.client_id}`);

        createAllNodes(client, paths);
    });

    client.init({});
}

module.exports = {
    createNodes,
};
