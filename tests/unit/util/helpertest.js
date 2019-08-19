const sinon = require('sinon');
const test = require('tape');
const { deprecationLog } = require('../../../lib/helper');

class Test {
    static method() {
        deprecationLog(Test.name, 'method');
    }
}

test('deprecation log is called with proper arguments', (t) => {
    const deprecationLogStub = sinon.stub();
    t.plan(3);

    deprecationLogStub(Test.name, 'method');

    t.equal(deprecationLogStub.callCount, 1);
    t.equal(deprecationLogStub.getCall(0).args[0], 'Test');
    t.equal(deprecationLogStub.getCall(0).args[1], 'method');
});

test('deprecation log gives proper message', (t) => {
    const consoleStub = sinon.stub(console, 'warn');
    t.plan(2);

    Test.method();

    t.equal(consoleStub.callCount, 1);
    t.equal(consoleStub.getCall(0).args[0], 'ZOOKEEPER LOG: Test::method is being deprecated!');

    consoleStub.restore();
});
