const test = require('ava');
const { constants, createClient } = require('./helpers/createClient');

test('can init and close more than one client', async (t) => {
    const client = createClient();
    const secondClient = createClient();

    await new Promise((resolve) => {
        client.on('connect', () => {
            secondClient.init({});
        });

        secondClient.on('connect', () => {
            t.is(client.state, constants.ZOO_CONNECTED_STATE);
            t.is(secondClient.state, constants.ZOO_CONNECTED_STATE);
            t.not(client.client_id, secondClient.client_id);

            client.close();
        });

        client.on('close', () => secondClient.close());
        secondClient.on('close', () => resolve());

        client.init({});
    });
});

test('two connected clients can create and fetch nodes', async (t) => {
    const pathOne = '/first';
    const pathTwo = '/second';

    const client = createClient();
    const secondClient = createClient();

    await new Promise((resolve) => {
        client.on('connect', () => {
            secondClient.init({});
        });

        secondClient.on('connect', async () => {
            const first = await client.create(pathOne, 'one', constants.ZOO_EPHEMERAL);
            const second = await secondClient.create(pathTwo, 'two', constants.ZOO_EPHEMERAL);

            t.is(first, pathOne);
            t.is(second, pathTwo);

            t.true(await client.pathExists(pathOne, false));
            t.true(await client.pathExists(pathTwo, false));

            t.true(await secondClient.pathExists(pathOne, false));
            t.true(await secondClient.pathExists(pathTwo, false));

            client.close();
        });

        client.on('close', () => secondClient.close());
        secondClient.on('close', () => resolve());

        client.init({});
    });
});

test('closed client cannot create node', async (t) => {
    const pathOne = '/first';
    const firstClient = createClient();
    const secondClient = createClient(firstClient.client_id, firstClient.client_password);

    await new Promise((resolve) => {
        firstClient.on('connect', () => {
            secondClient.init({});

            firstClient.close();
        });

        secondClient.on('connect', async () => {
            try {
                await firstClient.create(pathOne, 'should not be possible, because client is closed', constants.ZOO_EPHEMERAL);
                t.fail('closed client should not be able to create a node');
            } catch (e) {
                t.pass(e);
            }

            secondClient.close();
        });

        secondClient.on('close', () => resolve());

        firstClient.init({});
    });
});
