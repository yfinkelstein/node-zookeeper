const persistentNode = 0;

function createNode(client, path, flags, data = '') {
  return new Promise((resolve) => {
    client.a_create(path, data, flags, (rc) => {
      if (rc === -110) {
        resolve(`${path} already exists`);
      } else {
        resolve(`(${path}) result code: ${rc}`);
      }
    });
  });
}

module.exports = {
  createNode,
  persistentNode,
};
