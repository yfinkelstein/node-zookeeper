/* eslint-disable no-bitwise,no-console */
const { constants, ZooKeeper } = require('./lib/index');

function onCreate(client, rc, error, path) {
    if (rc !== 0) {
        console.log(`zk node create result: ${rc}, error: '${error}', path=${path}`);
    } else {
        console.log(`created zk node ${path}`);

        process.nextTick(() => {
            client.close();
        });
    }
}

function onConnect(client, err) {
    if (err) {
        throw err;
    }

    console.log(`zk session established, id=${client.client_id}`);
    client.a_create('/node.js1', 'some value', constants.ZOO_SEQUENCE | constants.ZOO_EPHEMERAL, onCreate.bind(null, client));
}

const zk = new ZooKeeper({
    connect: '127.0.0.1:2181',
    timeout: 200000,
    debug_level: constants.ZOO_LOG_LEVEL_DEBUG,
    host_order_deterministic: false,
});

zk.setLogger(console.log);

try {
    zk.connect(onConnect.bind(null, zk));
} catch (e) {
    console.error(e);
}
