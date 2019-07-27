const { createNodes } = require('./setup.js');
const { electLeader } = require('./electleader.js');
const { createWorker } = require('./createworker.js');
const { listen } = require('./addlistener.js');
const { addTask } = require('./addtask.js');

const logger = require('./logger.js');
const notifier = require('./notifier.js');

notifier.on('connect', message => logger.log('connect', message));
notifier.on('createNode', message => logger.log('createNode', message));
notifier.on('addTask', message => logger.log('addTask', message));
notifier.on('close', message => logger.log('close', message));

notifier.on('onChildren', (children) => {
    children.forEach((child) => {
        logger.log(`child id: ${child}`);
    });
});

async function init() {
    await createNodes(['/workers', '/assign', '/tasks', '/status']);

    notifier.on('leader', async (master) => {
        await listen(master, '/workers');
        await listen(master, '/assign');

        notifier.on('createWorker', async (worker) => {
            await listen(worker, '/tasks');
        });

        await createWorker();
        await addTask('hello world');
    });

    await electLeader('/master');
}

init().catch(logger.error);
