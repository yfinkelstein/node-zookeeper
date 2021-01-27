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

async function createNodes(client, paths) {
    createAllNodes(client, paths);
}

module.exports = {
    createNodes,
};
