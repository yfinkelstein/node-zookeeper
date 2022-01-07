const test = require('ava');
const { constants, Promise: ZooKeeper } = require('../../lib/index');

function createClient() {
    const config = {
        connect: '127.0.0.1:2181',
        timeout: 5000,
        debug_level: constants.ZOO_LOG_LEVEL_INFO,
        host_order_deterministic: false,
    };

    return new ZooKeeper(config);
}

test('can create and get children', async (t) => {
    t.plan(1);

    const expected = 'child';
    const parentNode = '/parent';
    const childNode = `${parentNode}/${expected}`;

    const client = createClient();

    await new Promise((resolve) => {
        client.on('connect', async () => {
            await client.create(parentNode, 'data', constants.ZOO_CONTAINER);
            await client.create(childNode, 'data', constants.ZOO_EPHEMERAL);
 
            const children = await client.get_children(parentNode, false);

            t.is(children[0], expected);

            await client.delete_(childNode, 0);
            await client.delete_(parentNode, 0);

            client.close();
        });

        client.on('close', () => resolve());
        client.init({});
    });

});

test('can create and get children (the get_children2 function) with stat', async (t) => {
    t.plan(2);

    const expected = 'child';
    const parentNode = '/parent-with-stat';
    const childNode = `${parentNode}/${expected}`;

    const client = createClient();

    await new Promise((resolve) => {
        client.on('connect', async () => {
            await client.create(parentNode, 'data', constants.ZOO_CONTAINER);
            await client.create(childNode, 'data', constants.ZOO_EPHEMERAL);
 
            const [children, stat] = await client.get_children2(parentNode, false);

            t.is(children[0], expected);
            t.is(stat.aversion, 0);

            await client.delete_(childNode, 0);
            await client.delete_(parentNode, 0);

            client.close();
        });

        client.on('close', () => resolve());
        client.init({});
    });

});

test('returns empty when no children', async (t) => {
    t.plan(1);

    const parentNode = '/the-parent-node-without-children';

    const client = createClient();

    await new Promise((resolve) => {
        client.on('connect', async () => {
            await client.create(parentNode, 'data', constants.ZOO_CONTAINER);
 
            const children = await client.get_children(parentNode, false);

            t.deepEqual(children, []);

            await client.delete_(parentNode, 0);

            client.close();
        });

        client.on('close', () => resolve());
        client.init({});
    });

});

test('returns empty when no node', async (t) => {
    t.plan(1);

    const parentNode = '/this-is-a-non-existing-node';

    const client = createClient();

    await new Promise((resolve) => {
        client.on('connect', async () => {
            try {
                const children = await client.get_children(parentNode, false);
                t.fail('Cannot get children from a non existing node.');
            } catch (e) {
                t.true(e.message.includes("no node"));
            } finally {
                client.close();
            }
        });

        client.on('close', () => resolve());
        client.init({});
    });

});
