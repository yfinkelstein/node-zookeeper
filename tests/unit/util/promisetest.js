const sinon = require('sinon');
const test = require('ava');

const ZkPromise = require('../../../lib/promise');

test('ZkPromise get', (t) => {
    const expected = 'value';
    const promise = ZkPromise.resolve({
        property: expected,
    });

    return promise.get('property').then((actual) => {
        t.is(actual, expected);
    });
});

test('ZkPromise put', (t) => {
    const expected = 'value';
    const promise = ZkPromise.resolve({});

    return promise.put('property', expected).then((actual) => {
        t.is(actual, expected);
    });
});

test('ZkPromise call', (t) => {
    const promise = ZkPromise.resolve({
        multiply: (a, b) => a * b,
    });

    return promise.call('multiply', 2, 3).then((actual) => {
        t.is(actual, 2 * 3);
    });
});

test('ZkPromise addCallback', (t) => {
    const callback = sinon.stub().callsFake((value) => value * 2);
    const promise = ZkPromise.resolve(10);

    return promise.addCallback(callback).then((actual) => {
        t.is(actual, 20);
        t.is(callback.callCount, 1);
        t.is(callback.getCall(0).args[0], 10);
    });
});

test('ZkPromise addErrback', (t) => {
    const callback = sinon.stub().callsFake((value) => value * 2);
    const promise = ZkPromise.reject(10);

    return promise.addErrback(callback).then((actual) => {
        t.is(actual, 20);
        t.is(callback.callCount, 1);
        t.is(callback.getCall(0).args[0], 10);
    });
});

test('ZkPromise addBoth', (t) => {
    const callback = sinon.stub().callsFake((value) => value * 2);
    const errback = sinon.stub().callsFake(() => {
        throw new Error('errback!');
    });
    // eslint-disable-next-line max-len
    const promise = (succeeds) => new ZkPromise((resolve, reject) => (succeeds ? resolve(10) : reject(10)));

    return promise(true).addBoth(callback)
        .then((actual) => {
            t.is(actual, 20);
            t.is(callback.callCount, 1);
            t.is(callback.getCall(0).args[0], 10);
            return promise(false).addBoth(errback);
        })
        .catch((actual) => {
            t.true(actual instanceof Error);
            t.is(actual.message, 'errback!');
            t.is(errback.callCount, 1);
            t.is(errback.getCall(0).args[0], 10);
        });
});

test('ZkPromise addCallbacks', (t) => {
    const callback = sinon.stub().callsFake((value) => value * 2);
    const errback = sinon.stub().callsFake(() => {
        throw new Error('errback!');
    });
    // eslint-disable-next-line max-len
    const promise = (succeeds) => new ZkPromise((resolve, reject) => (succeeds ? resolve(10) : reject(10)));

    return promise(true).addCallbacks(callback, errback)
        .then((actual) => {
            t.is(actual, 20);
            t.is(callback.callCount, 1);
            t.is(callback.getCall(0).args[0], 10);
            t.is(errback.callCount, 0);
            callback.resetHistory();
            errback.resetHistory();
            return promise(false).addCallbacks(callback, errback);
        })
        .catch((actual) => {
            t.true(actual instanceof Error);
            t.is(actual.message, 'errback!');
            t.is(callback.callCount, 0);
            t.is(errback.callCount, 1);
            t.is(errback.getCall(0).args[0], 10);
        });
});
