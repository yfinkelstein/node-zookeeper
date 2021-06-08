const { isClientConnected } = require('./wrapper');

/**
 * @param client {ZooKeeperPromise}
 * @param path {string}
 * @param flags {number}
 * @param data {string|Buffer}
 * @returns {Promise}
 */
async function createNode(client, path, flags, ttl, data = '') {
    try {
        if (!isClientConnected()) {
            throw new Error('createNode: client is not connected');
        }

        const createdPath = await client.create(path, data, flags, ttl);

        return `(created: ${createdPath})`;
    } catch (error) {
        return `${path} Error: ${error.message}`;
    }
}

module.exports = {
    createNode,
};
