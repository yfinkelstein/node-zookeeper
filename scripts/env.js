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
const zookeeperVersion = '3.5.5';
const downloadedFolderName = `apache-zookeeper-${zookeeperVersion}`;
const suffix = '.tar.gz';
const downloadedFileName = `${downloadedFolderName}${suffix}`;

// Update the checksum when upgrading the Zookeeper version
const sha512sum = `4e22df899a83ca3cc15f6d94daadb1a8631fb4108e67b4f56d1f4fcf95f10f89c8ff1fb8a7c84799a3856d8803a8db1e1f2f3fe1b7dc0d6cedf485ef90fd212d  ${downloadedFileName}`;

const variables = {
    rootFolder,
    workFolder: `${rootFolder}/deps`,
    buildFolder: `${rootFolder}/build/zk`,
    zookeeperVersion,
    sha512sum,
    downloadedFolderName,
    sourceFolder: `${rootFolder}/deps/zookeeper`,
    patchesFolder: `${rootFolder}/patches`,
    downloadedFileName,
    downloadUrl: `http://archive.apache.org/dist/zookeeper/zookeeper-${zookeeperVersion}/${downloadedFileName}`,
    isWindows,
    isSunOs,
    isVerbose: !!process.env.ZK_INSTALL_VERBOSE,
};

variables.isAlreadyBuilt = checkIfAlreadyBuilt(variables);

module.exports = variables;
