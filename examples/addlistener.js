const notifier = require('./notifier');
const logger = require('./logger');

function emit(client, path, children) {
    logger.log(`client id: "${client.client_id}" path: "${path}"`);
    notifier.emit('onChildren', children);
}

async function watcher(client, func, type, state, path) {
    if (type === 4) {
        await func(client, path);
    } else {
        logger.error(type, state, path);
    }
}

async function listen(client, path) {
    const watchFunc = watcher.bind(null, client, listen);

    try {
        const children = await client.w_get_children(path, watchFunc);
        emit(client, path, children);
    } catch (error) {
        logger.error('listen', error.message);
    }
}

module.exports = {
    listen,
};
