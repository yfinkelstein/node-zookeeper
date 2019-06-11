const notifier = require('./notifier.js');
const logger = require('./logger.js');

function emit(client, path, rc, error, children) {
  logger.log(`client id: "${client.client_id}" path: "${path}" rc: "${rc}" error: "${error}"`);
  notifier.emit('onChildren', children);
}

function watcher(client, func, type, state, path) {
  if (type === 4) {
    func(client, path);
  } else {
    logger.error(type, state, path);
  }
}

function onChildren(client, path, rc, error, children) {
  emit(client, path, rc, error, children);
}

function listen(client, path) {
  const watchFunc = watcher.bind(null, client, listen);
  const childFunc = onChildren.bind(null, client, path);
  client.aw_get_children(path, watchFunc, childFunc);
}

module.exports = {
  listen,
};
