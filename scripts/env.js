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


let zookeeperVersion;
let downloadedFolderName;
let sha512sum;
const suffix = '.tar.gz';
let downloadedFileName;

if (isWindows) {
    zookeeperVersion = '3.4.13';
    downloadedFolderName = `zookeeper-${zookeeperVersion}`;
    downloadedFileName = `${downloadedFolderName}${suffix}`;
    sha512sum = `a989b527f3f990d471e6d47ee410e57d8be7620b  ${downloadedFileName}`;
} else {
    zookeeperVersion = '3.5.6';
    downloadedFolderName = `apache-zookeeper-${zookeeperVersion}`;
    downloadedFileName = `${downloadedFolderName}${suffix}`;
    sha512sum = `7f45817cbbc42aec5a7817fa2ae99656128e666dc58ace23d86bcfc5ca0dc49e418d1a7d1f082ad80ccb916f9f1b490167d16f836886af1a56fbcf720ad3b9d0  ${downloadedFileName}`;
}

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
