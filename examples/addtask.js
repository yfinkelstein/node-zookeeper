const { constants } = require('./wrapper.js');
const notifier = require('./notifier.js');
const { createNode } = require('./createnode.js');

async function createTask(client, data) {
    // eslint-disable-next-line no-bitwise
    const message = await createNode(client, '/tasks/task-', constants.ZOO_PERSISTENT | constants.ZOO_PERSISTENT_SEQUENTIAL, data);
    notifier.emit('addTask', message);
}

async function addTask(client, data) {
    createTask(client, data);
}

module.exports = {
    addTask,
};
