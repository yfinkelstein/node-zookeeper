const test = require('tape');
const converters = require('./build/Release/converters.node');

test('Integer is converted to string', (t) => {
    t.plan(2);
    const expected = 4711;
    const res = converters.toStrTest(expected);

    t.deepEquals(res, `${expected}`);
    t.deepEquals(typeof res, typeof '');
});

test('Unix time is converted to date', (t) => {
    t.plan(1);
    const now = Date.now();

    const d = new Date(now);
    const expected = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}}`;

    const unixTime = Math.round(now / 1000);
    const converted = converters.convertUnixTimeToDateTest(unixTime);

    const r = new Date(converted * 1000);
    const res = `${r.getFullYear()}-${r.getMonth()}-${r.getDate()}}`;

    t.deepEquals(res, expected);
});

test('Object value is converted to bool', (t) => {
    t.plan(2);
    const expected = true;
    const res = converters.toBoolTest({ val: 'true' });

    t.deepEquals(res, expected);
    t.deepEquals(typeof res, typeof true);
});

test('Object value is converted to integer', (t) => {
    t.plan(2);
    const expected = 4711;
    const expectedNeg = -1;
    const res = converters.toIntTest({ val: '4711' });
    const resNeg = converters.toIntTest({ val: '-1' });

    t.deepEquals(res, expected);
    t.deepEquals(resNeg, expectedNeg);
});

test('Object value is converted to unsigned integer', (t) => {
    t.plan(1);
    const expected = 4711;
    const res = converters.toUintTest('4711');

    t.deepEquals(res, expected);
});
