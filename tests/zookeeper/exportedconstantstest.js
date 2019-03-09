const test = require('tape');
const proxyquire = require('proxyquire');
const path = require('path');

class FakeNativeZooKeeper {}
FakeNativeZooKeeper.hello = 'world';

const fake = {};
const key = `${path.join(__dirname, '../../lib/')}/../build/zookeeper.node`;
fake[key] = { ZooKeeper: FakeNativeZooKeeper };

const ZooKeeper = proxyquire('../../lib/zookeeper.js', fake);

test('native static constants are exported', (t) => {
    t.plan(1);

    t.equal(ZooKeeper.hello, FakeNativeZooKeeper.hello);
});