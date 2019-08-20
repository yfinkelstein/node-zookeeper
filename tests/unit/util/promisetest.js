const sinon = require('sinon');
const test = require('tape');

const ZkPromise = require('../../../lib/promise');

test('ZkPromise get', (t) => {
    t.plan(1);

    const expected = 'value';
    const promise = ZkPromise.resolve({
        property: expected,
    });

    promise.get('property').then((actual) => {
        t.equal(actual, expected);
    });
});

test('ZkPromise put', (t) => {
    t.plan(1);

    const expected = 'value';
    const promise = ZkPromise.resolve({});

    promise.put('property', expected).then((actual) => {
        t.equal(actual, expected);
    });
});

test('ZkPromise call', (t) => {
    t.plan(1);

    const promise = ZkPromise.resolve({
        multiply: (a, b) => a * b,
    });

    promise.call('multiply', 2, 3).then((actual) => {
        t.equal(actual, 2 * 3);
    });
});

test('ZkPromise addCallback', (t) => {
    t.plan(3);

    const callback = sinon.stub().callsFake(value => value * 2);
    const promise = ZkPromise.resolve(10);

    promise.addCallback(callback).then((actual) => {
        t.equal(actual, 20);
        t.equal(callback.callCount, 1);
        t.equal(callback.getCall(0).args[0], 10);
    });
});

test('ZkPromise addErrback', (t) => {
    t.plan(3);

    const callback = sinon.stub().callsFake(value => value * 2);
    const promise = ZkPromise.reject(10);

    promise.addErrback(callback).then((actual) => {
        t.equal(actual, 20);
        t.equal(callback.callCount, 1);
        t.equal(callback.getCall(0).args[0], 10);
    });
});

test('ZkPromise addBoth', (t) => {
    t.plan(7);

    const callback = sinon.stub().callsFake(value => value * 2);
    const errback = sinon.stub().callsFake(() => {
        throw new Error('errback!');
    });
    // eslint-disable-next-line max-len
    const promise = succeeds => new ZkPromise((resolve, reject) => (succeeds ? resolve(10) : reject(10)));

    promise(true).addBoth(callback)
        .then((actual) => {
            t.equal(actual, 20);
            t.equal(callback.callCount, 1);
            t.equal(callback.getCall(0).args[0], 10);
            return promise(false).addBoth(errback);
        })
        .catch((actual) => {
            t.true(actual instanceof Error);
            t.equal(actual.message, 'errback!');
            t.equal(errback.callCount, 1);
            t.equal(errback.getCall(0).args[0], 10);
        });
});

test('ZkPromise addCallbacks', (t) => {
    t.plan(9);

    const callback = sinon.stub().callsFake(value => value * 2);
    const errback = sinon.stub().callsFake(() => {
        throw new Error('errback!');
    });
    // eslint-disable-next-line max-len
    const promise = succeeds => new ZkPromise((resolve, reject) => (succeeds ? resolve(10) : reject(10)));

    promise(true).addCallbacks(callback, errback)
        .then((actual) => {
            t.equal(actual, 20);
            t.equal(callback.callCount, 1);
            t.equal(callback.getCall(0).args[0], 10);
            t.equal(errback.callCount, 0);
            callback.resetHistory();
            errback.resetHistory();
            return promise(false).addCallbacks(callback, errback);
        })
        .catch((actual) => {
            t.true(actual instanceof Error);
            t.equal(actual.message, 'errback!');
            t.equal(callback.callCount, 0);
            t.equal(errback.callCount, 1);
            t.equal(errback.getCall(0).args[0], 10);
        });
});
