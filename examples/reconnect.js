const ZooKeeper = require('../lib/index');
const { createNode, persistentNode } = require('./createnode.js');

const { constants } = ZooKeeper;

const host = process.argv[2] || '127.0.0.1:2181';

function log(message) {
    console.log('RECONNECT.js', '------', message);
}

function createClient(timeoutMs = 5000) {
    const config = {
        connect: host,
        timeout: timeoutMs,
        debug_level: constants.ZOO_LOG_LEVEL_WARN,
        host_order_deterministic: false,
    };

    let client = new ZooKeeper(config);

    client.on('connect', () => {
        log('connected');

        setTimeout(() => {
            createNode(client, '/worker', persistentNode)
                .then(log)
                .catch(log);
        }, 100);
    });

    client.on('connecting', () => {
        log('connecting ...');
    });

    client.on('close', () => {
        log('close');
        client = null;
        setTimeout(createClient, 2000);
    });

    client.init({});
}

createClient();
