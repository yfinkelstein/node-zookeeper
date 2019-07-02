const { createClient } = require('./wrapper.js');
const notifier = require('./notifier.js');
const { createNode, persistentNode } = require('./createnode.js');

const noop = () => {};
let timeoutId;

function shutDown() {
    clearTimeout(timeoutId);
    process.exit();
}

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);

function createNodes(paths) {
    const client = createClient();
    return new Promise((resolve) => {
        client.on('connect', () => {
            notifier.emit('connect', `session established, id=${client.client_id}`);

            paths
                .forEach((path, index) => {
                    createNode(client, path, persistentNode)
                        .then((message) => {
                            notifier.emit('createNode', message);

                            if (paths.length === (index + 1)) {
                                resolve();
                            }
                        });
                });
        });

        client.on('close', (...args) => {
            notifier.emit('close', `session closed, id=${client.client_id}`);
            console.log('CLOSE ARGS', ...args);
            console.log('WILL RECONNECT');

            timeoutId = setTimeout(() => {
                createNodes(paths)
                    .then(() => console.log('reconnected'))
                    .catch(e => console.log('failed', e));
            }, 5000);
        });

        client.connect(noop);
    });
}

module.exports = {
    createNodes,
};
