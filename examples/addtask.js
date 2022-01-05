const { constants } = require('./wrapper');
const notifier = require('./notifier');
const { createNode } = require('./createnode');

async function createTask(client, data) {
    // eslint-disable-next-line no-bitwise
    const message = await createNode(client, '/tasks/task-', constants.ZOO_PERSISTENT | constants.ZOO_PERSISTENT_SEQUENTIAL, undefined, data);
    notifier.emit('addTask', message);
}

async function addTask(client, data) {
    createTask(client, data);
}

module.exports = {
    addTask,
};
