const fs = require('fs');

function setRoot(env) {
    if (env.isWindows) {
        if (process.cwd().endsWith('build')) {
            process.chdir('../');
        }
    }

    return process.cwd();
}

function checkIfAlreadyBuilt(env) {
    if (env.isWindows) {
        return fs.existsSync(`${env.ZK_DEPS}/src/c/Debug/zookeeper.lib`);
    }

    return fs.existsSync(`${env.BUILD}/lib/libzookeeper_st.la`);
}

const isWindows = process.platform.toLowerCase().includes('win32');
const isSunOs = process.platform.toLowerCase().includes('sunos');
const root = setRoot({ isWindows });

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
    ZK_VERSION_SHA1:`8e2cc8784794e24df90fa1a9dbe6cd1695c79a44  ${fileName}`,
    ZK: name,
    ZK_DEPS: `${root}/deps/zookeeper`,
    ZK_FILE: fileName,
    ZK_URL:`http://archive.apache.org/dist/zookeeper/${name}/${fileName}`,
    PATCHES: patches,
    isWindows,
    isSunOs,
};

variables.isAlreadyBuilt = checkIfAlreadyBuilt(variables);

module.exports = variables;
