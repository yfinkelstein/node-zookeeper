const { getClient, constants } = require('./wrapper');

const logger = require('./logger');
const notifier = require('./notifier');

notifier.on('connect', (message) => logger.log('connect', message));
notifier.on('createNode', (message) => logger.log('createNode', message));

async function init() {
    const client = getClient();

    client.on('connect', async () => {
        const path = "/acl-testing";
        const data = "";
        const flags = constants.ZOO_EPHEMERAL;
        const version = 0;

        await client.create(path, data, flags);

        const [aclBefore,] = await client.get_acl(path);

        const updatedAcl = [{
            perm: constants.ZOO_PERM_READ | constants.ZOO_PERM_WRITE,
            scheme: "world",
            auth: "anyone",
        }];

        await client.set_acl(path, version, updatedAcl);

        const [aclAfter,] = await client.get_acl(path);

        console.log("before:", aclBefore);
        console.log("after:", aclAfter);
    });
}

if (require.main === module) {
    init().catch(logger.error);
}
