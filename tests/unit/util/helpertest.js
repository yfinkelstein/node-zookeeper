const sinon = require('sinon');
const test = require('ava');
const zkConstants = require('../../../lib/constants');
const {
    deprecationLog,
    findZkConstantByCode,
    isString,
    isFunction,
} = require('../../../lib/helper');

class Test {
    static method() {
        deprecationLog(Test.name, 'method');
    }
}

test('deprecation log is called with proper arguments', (t) => {
    const deprecationLogStub = sinon.stub();
    deprecationLogStub(Test.name, 'method');

    t.is(deprecationLogStub.callCount, 1);
    t.is(deprecationLogStub.getCall(0).args[0], 'Test');
    t.is(deprecationLogStub.getCall(0).args[1], 'method');
});

test('deprecation log gives proper message', (t) => {
    const consoleStub = sinon.stub(console, 'warn');
    Test.method();

    t.is(consoleStub.callCount, 1);
    t.is(consoleStub.getCall(0).args[0], 'ZOOKEEPER LOG: Test::method is being deprecated!');

    consoleStub.restore();
});

test('finds the BAD ARGUMENTS constant', (t) => {
    const expected = -8;

    const res = findZkConstantByCode(expected, zkConstants);

    t.is(res[0], 'ZBADARGUMENTS');
    t.is(res[1], expected);
});

test('finds constants with fallback', (t) => {
    const expected = 4711;

    const res = findZkConstantByCode(expected, zkConstants);

    t.is(res[0], 'unknown');
    t.is(res[1], expected);
});

test('identifies data as strings', (t) => {
    t.true(isString('data'));
    t.true(isString(''));

    t.true(isString(new String('data'))); // eslint-disable-line no-new-wrappers

    t.false(isString(1));
    t.false(isString({ key: 'value' }));
});

test('identifies data as functions', (t) => {
    t.true(isFunction(() => {}));
    t.true(isFunction(Test.method));

    t.false(isFunction('data'));
    t.false(isFunction(null));
});
