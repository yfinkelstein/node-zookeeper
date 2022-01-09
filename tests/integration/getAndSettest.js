const test = require('ava');
const { constants, createClient } = require('./helpers/createClient');

test('can create an node with data and get data from the node', async (t) => {
    const nodeName = '/my-get-and-set-node';
    const data = 'data as a string';

    const client = createClient();

    await new Promise((resolve) => {
        client.on('connect', async () => {
            await client.create(nodeName, data, constants.ZOO_EPHEMERAL);

            const [, dataAsBuffer] = await client.get(nodeName, false);

            t.is(dataAsBuffer.toString(), data);

            client.close();
        });

        client.on('close', () => resolve());
        client.init({});
    });
});

test('can create an node, set and get data from the node', async (t) => {
    const nodeName = '/my-node-to-be-set';
    const data = 'data as a string';

    const client = createClient();

    await new Promise((resolve) => {
        client.on('connect', async () => {
            await client.create(nodeName, undefined, constants.ZOO_EPHEMERAL);

            await client.set(nodeName, data, 0);

            const [, dataAsBuffer] = await client.get(nodeName, false);

            t.is(dataAsBuffer.toString(), data);

            client.close();
        });

        client.on('close', () => resolve());
        client.init({});
    });
});

test('can create a node with data as buffer and get data as a buffer from the node', async (t) => {
    const nodeName = '/my-node-to-create-with-buffer-data';
    const data = Buffer.from('data as a string');

    const client = createClient();

    await new Promise((resolve) => {
        client.on('connect', async () => {
            await client.create(nodeName, data, constants.ZOO_EPHEMERAL);
            const [, dataAsBuffer] = await client.get(nodeName, false);

            t.deepEqual(dataAsBuffer, data);

            client.close();
        });

        client.on('close', () => resolve());
        client.init({});
    });
});

test('can set data as buffer and get data as a buffer from the node', async (t) => {
    const nodeName = '/my-node-to-be-set-with-buffer-data';
    const data = Buffer.from('data as a string');

    const client = createClient();

    await new Promise((resolve) => {
        client.on('connect', async () => {
            await client.create(nodeName, undefined, constants.ZOO_EPHEMERAL);
            await client.set(nodeName, data, 0);

            const [, dataAsBuffer] = await client.get(nodeName, false);

            t.deepEqual(dataAsBuffer, data);

            client.close();
        });

        client.on('close', () => resolve());
        client.init({});
    });
});
