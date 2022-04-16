const { constants } = require('./wrapper');
const { createNodes } = require('./setup');

const logger = require('./logger');

async function verifyResultCodeCheckInAsyncCall(client) {
    const tempNode = `/my-temporary-node-to-verify-async-call-${Date.now()}`;
    const data = 'HELLOWORLD';
    const version = 0;

    createNodes(client, [tempNode], constants.ZOO_EPHEMERAL);
    const res = await client.set(tempNode, data, version);

    logger.log(`The client.set result: ${JSON.stringify(res)}`);

    client.set('this-node-does-not-exist', data, version)
        .then(() => logger.error('THIS WILL NOT HAPPEN.'))
        .catch((error) => logger.log(`The error is: ${error}`));
}

async function verifyNonExisting(client) {
    const tempNode = `/my-temporary-node-${Date.now()}`;

    const doesExist = await client.w_pathExists(tempNode, (data) => logger.log(`Node created with data: ${data}`));
    logger.log(`Does ${tempNode} exist? ${doesExist}`);

    setTimeout(async () => {
        createNodes(client, [tempNode], constants.ZOO_EPHEMERAL);

        const exists = await client.pathExists(tempNode, false);
        logger.log(`Does ${tempNode} exist now? ${exists}`);
    }, 3000);
}

async function verifyTheNodeExistsFeature(client) {
    const doesStatusExist = await client.pathExists('/status', false);
    logger.log(`Does the /status node exist? ${doesStatusExist}`);

    await verifyNonExisting(client);
    await verifyResultCodeCheckInAsyncCall(client);
}

module.exports = {
    verifyTheNodeExistsFeature,
};
