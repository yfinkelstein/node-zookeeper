const { getClient, constants } = require('./wrapper');

const logger = require('./logger');
const notifier = require('./notifier');

notifier.on('connect', (message) => logger.log('connect', message));
notifier.on('createNode', (message) => logger.log('createNode', message));

async function init() {
    const client = getClient();

    client.on('connect', async () => {
        const path = '/acl-testing';
        const data = '';
        const flags = constants.ZOO_EPHEMERAL;
        const version = 0;

        await client.create(path, data, flags);

        const before = await client.get_acl(path);

        const updatedAcl = [{
            perm: constants.ZOO_PERM_READ,
            scheme: 'world',
            auth: 'anyone',
        }];

        await client.set_acl(path, version, updatedAcl);

        const after = await client.get_acl(path);

        logger.log('before:', before[0]);
        logger.log('after:', after[0]);
    });
}

if (require.main === module) {
    init().catch(logger.error);
}
