const { EventEmitter } = require('events');

class Notifier extends EventEmitter {}

module.exports = new Notifier();
