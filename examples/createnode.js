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
        const createdPath = await client.create(path, data, flags);
        return `(created: ${createdPath})`;
    } catch (error) {
        return `${path} already exists`;
    }
}

module.exports = {
    createNode,
    persistentNode,
};
