const fs = require('fs');

const root = process.cwd();
const version = '3.4.9';
const name = `zookeeper-${version}`;
const suffix = '.tar.gz';
const fileName = `${name}${suffix}`;

const patches = fs.readdirSync(`${root}/patches`).find(file => file.endsWith('.patch'));

const variables = {
    ROOT: root,
    DEPS: `${root}/deps`,
    BUILD: `${root}/build/zk`,
    ZK_VERSION: version,
    ZK_VERSION_SHA1: '0285717bf5ea87a7a36936bf37851d214a32bb99',
    ZK: name,
    ZK_FILE: fileName,
    ZK_URL:`http://archive.apache.org/dist/zookeeper/${name}/${fileName}`,
    PATCHES: patches,
};

module.exports = variables;
