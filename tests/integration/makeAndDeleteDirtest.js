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

test('can create and delete a node containing sub nodes', async (t) => {
    t.plan(8);

    const path = ['/one', '/two', '/three'];
    const fullPath = path.join('');
    const twoStepPath = path.slice(0, 2).join('');
    const topPath = path.slice(0, 1).join('');

    const client = createClient();

    await new Promise((resolve) => {
        client.on('connect', async () => {
            client.mkdirp(fullPath, async (err, success) => {
                t.is(err, null);
                t.is(success, true);

                t.is(await client.pathExists(fullPath, false), true);

                await client.delete_(fullPath, 0);
                t.is(await client.pathExists(fullPath, false), false);
                t.is(await client.pathExists(twoStepPath, false), true);

                await client.delete_(twoStepPath, 0);
                t.is(await client.pathExists(twoStepPath, false), false);
                t.is(await client.pathExists(topPath, false), true);
                
                await client.delete_(topPath, 0);
                t.is(await client.pathExists(topPath, false), false);

                client.close();
            });
        });

        client.on('close', () => resolve());
        client.init({});
    });
});
