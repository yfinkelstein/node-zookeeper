const { createNodes } = require('./setup.js');
const { electLeader } = require('./electleader.js');
const { createWorker } = require('./createworker.js');
const { addTask } = require('./addtask.js');
const { listen } = require('./addlistener.js');

const logger = require('./logger.js');
const notifier = require('./notifier.js');

notifier.on('connect', message => logger.log('connect', message));
notifier.on('createNode', message => logger.log('createNode', message));
notifier.on('addTask', message => logger.log('addTask', message));

notifier.on('onChildren', (children) => {
  children.forEach((child) => {
    logger.log(`child id: ${child}`);
  });
});

function setupMaster() {
  return new Promise((resolve) => {
    notifier.on('leader', resolve);

    electLeader('/master');
  });
}

function setupWorker() {
  return new Promise((resolve) => {
    notifier.on('createWorker', resolve);

    createWorker();
  });
}

async function init() {
  await createNodes(['/workers', '/assign', '/tasks', '/status']);

  const master = await setupMaster();
  await listen(master, '/workers');
  await listen(master, '/assign');

  const worker = await setupWorker();
  listen(worker, '/tasks');

  // await addTask('hello world');
}

init().catch(logger.error);
