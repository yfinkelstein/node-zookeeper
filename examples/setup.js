const { createClient } = require('./wrapper.js');
const notifier = require('./notifier.js');
const { createNode, persistentNode } = require('./createnode.js');

const noop = () => {};

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

    client.connect(noop);
  });
}

module.exports = {
  createNodes,
};
