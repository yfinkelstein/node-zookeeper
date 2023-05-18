/**
 * @param client {ZooKeeperPromise}
 * @param path {string}
 * @param flags {number}
 * @param data {string|Buffer}
 * @returns {Promise}
 */
async function createNode(client, path, flags, ttl, data = '') {
    try {
        const createdPath = await client.create(path, data, flags, ttl);

        return `(created: ${createdPath})`;
    } catch (error) {
        return `${path} Error: ${error.message}`;
    }
}

module.exports = {
    createNode,
};
