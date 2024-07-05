const test = require('ava');
const { constants, createClient } = require('./helpers/createClient');

test('can get and set acl of the node using perm', async (t) => {
    const client = createClient();

    await new Promise((resolve) => {
        client.on('connect', async () => {
            const path = '/acl-testing';
            const data = '';
            const flags = constants.ZOO_EPHEMERAL;
            const version = 0;

            await client.create(path, data, flags);

            const updatedAcl = [{
                perm: constants.ZOO_PERM_READ,
                scheme: 'world',
                auth: 'anyone',
            }];

            await client.set_acl(path, version, updatedAcl);
            const [after] = await client.get_acl(path);

            t.is(after[0].perms, 1);

            client.close();
        });

        client.on('close', () => resolve());
        client.init({});
    });
});

test('can get and set acl of the node using perms', async (t) => {
    const client = createClient();

    await new Promise((resolve) => {
        client.on('connect', async () => {
            const path = '/acl-testing2';
            const data = '';
            const flags = constants.ZOO_EPHEMERAL;
            const version = 0;

            await client.create(path, data, flags);

            const updatedAcl = [{
                perms: constants.ZOO_PERM_READ,
                scheme: 'world',
                auth: 'anyone',
            }];

            await client.set_acl(path, version, updatedAcl);
            const [after] = await client.get_acl(path);

            t.is(after[0].perms, 1);

            client.close();
        });

        client.on('close', () => resolve());
        client.init({});
    });
});
