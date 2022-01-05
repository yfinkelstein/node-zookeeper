const { constants } = require('./wrapper');
const { createNodes } = require('./setup');

const logger = require('./logger');

async function verifyNonExisting(client) {
    const tempNode = '/my-temporary-node';

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
}

module.exports = {
    verifyTheNodeExistsFeature,
};
