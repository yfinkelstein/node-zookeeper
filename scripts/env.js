const fs = require('fs');

function setRoot(env) {
    if (env.isWindows) {
        if (process.cwd().endsWith('build')) {
            process.chdir('../');
        }
    }

    return process.cwd();
}

function isAlreadyBuilt(env) {
    if (env.isWindows) {
        return fs.existsSync(`${env.ZK_DEPS}/src/c/Debug/zookeeper.lib`);
    }

    return fs.existsSync(`${env.BUILD}/lib/libzookeeper_st.la`);
}

const isWindows = process.platform.toLowerCase().includes('win32');
const isSunOs = process.platform.toLowerCase().includes('sunos');

const root = setRoot({
    isWindows,
});

const isAlreadyBuilt = isAlreadyBuilt({
    isWindows,
});

const version = '3.4.12';
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
    ZK_DEPS: `${root}/deps/zookeeper`,
    ZK_FILE: fileName,
    ZK_URL:`http://archive.apache.org/dist/zookeeper/${name}/${fileName}`,
    PATCHES: patches,
    isWindows,
    isSunOs,
    isAlreadyBuilt,
};

module.exports = variables;
