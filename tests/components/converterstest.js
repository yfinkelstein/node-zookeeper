const test = require('ava');
const converters = require('./build/Release/converters.node');

test('Integer is converted to string', (t) => {
    const expected = 4711;
    const res = converters.toStrTest(expected);

    t.deepEqual(res, `${expected}`);
    t.deepEqual(typeof res, typeof '');
});

test('Unix time is converted to date', (t) => {
    const now = Date.now();

    const d = new Date(now);
    const expected = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}}`;

    const unixTime = Math.round(now / 1000);
    const converted = converters.convertUnixTimeToDateTest(unixTime);

    const r = new Date(converted * 1000);
    const res = `${r.getFullYear()}-${r.getMonth()}-${r.getDate()}}`;

    t.deepEqual(res, expected);
});

test('Object value is converted to bool', (t) => {
    const expected = true;
    const res = converters.toBoolTest({ val: 'true' });

    t.deepEqual(res, expected);
    t.deepEqual(typeof res, typeof true);
});

test('Object value is converted to integer', (t) => {
    const expected = 4711;
    const expectedNeg = -1;
    const res = converters.toIntTest({ val: '4711' });
    const resNeg = converters.toIntTest({ val: '-1' });

    t.deepEqual(res, expected);
    t.deepEqual(resNeg, expectedNeg);
});

test('Object value is converted to unsigned integer', (t) => {
    const expected = 4711;
    const res = converters.toUintTest('4711');

    t.deepEqual(res, expected);
});
