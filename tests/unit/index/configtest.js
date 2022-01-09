const test = require('ava');
const ZooKeeper = require('../../../lib/index');

test('inject config', (t) => {
    const expected = '127.0.0.1:2181';

    const zk = new ZooKeeper({ connect: expected });

    t.is(zk.config.connect, expected);
});

test('inject connection config as a string', (t) => {
    const expected = '127.0.0.1:2181';

    const zk = new ZooKeeper(expected);

    t.is(zk.config.connect, expected);
    t.is(Object.keys(zk.config).length, 1);
});

test('does combine config from constructor and the init fn similar to the lodash "defaults" fn', (t) => {
    const expectedConnect = '127.0.0.1:2181';
    const expectedTimeout = 1;
    const expectedDebugLevel = 42;

    const conf = {
        connect: expectedConnect,
        timeout: expectedTimeout,
        debug_level: expectedDebugLevel,
    };

    const zk = new ZooKeeper(conf);
    zk.init({ connect: 'should-not-override', timeout: 4711 });

    t.is(zk.config.connect, expectedConnect);
    t.is(zk.config.timeout, expectedTimeout);
    t.is(zk.config.debug_level, expectedDebugLevel);
});
