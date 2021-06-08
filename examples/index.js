const { getClient, constants } = require('./wrapper');
const { createNodes } = require('./setup');
const { electLeader } = require('./electleader');
const { createWorker } = require('./createworker');
const { listen } = require('./addlistener');
const { addTask } = require('./addtask');

const logger = require('./logger');
const notifier = require('./notifier');

notifier.on('connect', (message) => logger.log('connect', message));
notifier.on('createNode', (message) => logger.log('createNode', message));
notifier.on('addTask', (message) => logger.log('addTask', message));

notifier.on('onChildren', (children) => {
    children.forEach((child) => {
        logger.log(`child id: ${child}`);
    });
});

async function init() {
    const client = getClient();

    client.on('connect', async () => {
        await createNodes(client, ['/workers', '/assign', '/tasks', '/status'], constants.ZOO_CONTAINER);
        await createNodes(client, ['/myttl'], constants.ZOO_PERSISTENT_WITH_TTL, 5000);

        notifier.on('leader', async () => {
            await listen(client, '/workers');
            await listen(client, '/assign');

            notifier.on('createWorker', async () => {
                await listen(client, '/tasks');
            });

            await createWorker(client);
            await addTask(client, 'hello world');
        });

        await electLeader(client, '/master');
    });
}

init().catch(logger.error);
