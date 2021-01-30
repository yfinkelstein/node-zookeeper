const { isClientConnected } = require('./wrapper.js');

const persistentNode = 0;

/**
 * @param client {ZooKeeperPromise}
 * @param path {string}
 * @param flags {number}
 * @param data {string|Buffer}
 * @returns {Promise}
 */
async function createNode(client, path, flags, data = '') {
    try {
        if (!isClientConnected()) {
            throw new Error('createNode: client is not connected');
        }

        const createdPath = await client.create(path, data, flags);
        return `(created: ${createdPath})`;
    } catch (error) {
        return `${path} Error: ${error.message}`;
    }
}

module.exports = {
    createNode,
    persistentNode,
};
