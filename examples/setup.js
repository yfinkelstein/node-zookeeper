const notifier = require('./notifier.js');
const { createNode } = require('./createnode.js');

async function createAllNodes(client, paths, flags, ttl) {
    const promises = [];
    paths.forEach((path) => {
        promises.push(createNode(client, path, flags, ttl));
    });

    const messages = await Promise.all(promises);
    messages.forEach((message) => {
        notifier.emit('createNode', message);
    });
}

async function createNodes(client, paths, flags, ttl = undefined) {
    createAllNodes(client, paths, flags, ttl);
}

module.exports = {
    createNodes,
};
