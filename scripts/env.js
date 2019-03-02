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
const isSunOs = process.platform.toLowerCase().includes('sunos');
const rootFolder = setRoot({ isWindows });

// Don't forget to also update the sha1sum variable when upgrading the Zookeeper version
const zookeeperVersion = '3.4.13';
const downloadedFolderName = `zookeeper-${zookeeperVersion}`;
const suffix = '.tar.gz';
const downloadedFileName = `${downloadedFolderName}${suffix}`;

// Update the checksum when upgrading the Zookeeper version
const sha1sum = `a989b527f3f990d471e6d47ee410e57d8be7620b  ${downloadedFileName}`;

const variables = {
    rootFolder,
    workFolder: `${rootFolder}/deps`,
    buildFolder: `${rootFolder}/build/zk`,
    zookeeperVersion,
    sha1sum,
    downloadedFolderName,
    sourceFolder: `${rootFolder}/deps/zookeeper`,
    downloadedFileName,
    downloadUrl:`http://archive.apache.org/dist/zookeeper/${downloadedFolderName}/${downloadedFileName}`,
    isWindows,
    isSunOs,
};

variables.isAlreadyBuilt = checkIfAlreadyBuilt(variables);

module.exports = variables;
