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
        return fs.existsSync(`${env.sourceFolder}/src/c/Debug/zookeeper.lib`);
    }

    return fs.existsSync(`${env.buildFolder}/lib/libzookeeper_st.la`);
}

const isWindows = process.platform.toLowerCase().includes('win32');
const rootFolder = setRoot({ isWindows });

const downloadedFolderName = 'zookeeper-client-c';
const downloadedFileName = 'zookeeper-client-c.tar.gz';

const variables = {
    rootFolder,
    workFolder: `${rootFolder}/deps`,
    buildFolder: `${rootFolder}/build/zk`,
    downloadedFolderName,
    sourceFolder: `${rootFolder}/deps/zookeeper-client-c`,
    downloadedFileName,
    isWindows,
    isVerbose: !!process.env.ZK_INSTALL_VERBOSE,
};

variables.isAlreadyBuilt = checkIfAlreadyBuilt(variables);

module.exports = variables;
