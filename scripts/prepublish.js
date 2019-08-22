const fs = require('fs');
const http = require('http');
const shell = require('shelljs');
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
const env = require('./env.js');
const { exec, retry } = require('./helper.js');

function writeFile(url, destination, resolve, reject) {
    const file = fs.createWriteStream(destination);

    const req = http.get(url, (res) => {
        res.pipe(file);
    });

    req.on('error', (e) => {
        shell.rm(destination);
        reject(e);
    });

    file.on('error', () => {
        shell.rm(destination);
        reject(new Error('File error'));
    });

    file.on('finish', resolve);
}

function download(url, destination) {
    if (fs.existsSync(destination)) {
        shell.echo(`${destination} exists.`);

        return Promise.resolve();
    }

    const executor = writeFile.bind(null, url, destination);
    return new Promise(executor);
}

function validateFile(fileName) {
    let res;

    if (env.isWindows) {
        const output = exec(`certutil -hashfile ${fileName} SHA512`).split('\r\n');

        // `certutil` returns 2byte separated string
        // (e.g. "a9 89 b5 27 f3 f9 90 d4 71 e6 d4 7e e4 10 e5 7d 8b e7 62 0b")
        const sha512 = output[1].replace(/ /g, '');

        res = `${sha512}  ${fileName}`;
    } else {
        res = exec(`shasum -a 512 ${fileName}`).trim();
    }

    if (res !== env.sha512sum) {
        throw new Error(`Wrong sha512 for ${fileName}! Expected "${env.sha512sum}", got "${res}".`);
    }
}

function clearPath() {
    if (!shell.test('-d', env.sourceFolder)) {
        return;
    }

    shell.rm('-rf', env.sourceFolder);
}

function moveFolder() {
    const sourceCodeFolder = `${env.downloadedFolderName}/zookeeper-client/zookeeper-client-c`;
    if (env.isWindows) {
        shell.cp('-r', sourceCodeFolder, env.sourceFolder);
        shell.rm('-rf', env.downloadedFolderName);
        return;
    }

    shell.mv(sourceCodeFolder, env.sourceFolder);
}

function applyPatches() {
    if (env.isWindows) {
        const destination = `${env.sourceFolder}/src`;

        shell.sed('-i', '#include "zookeeper_log.h"', '#include "zookeeper_log.h"\n#include "winport.h"\n', `${destination}/zk_log.c`);
        shell.sed('-i', '#include "zookeeper.h"', '#include "winport.h"\n#include "zookeeper.h"\n', `${destination}/zk_adaptor.h`);
        shell.sed('-i', '#include "zk_adaptor.h"', '#include "zk_adaptor.h"\n#include "winport.h"\n', `${destination}/zookeeper.c`);

        if (!env.isVerbose) {
            const cmakeFile = 'CMakeLists.txt';
            shell.cp(`${env.patchesFolder}/${cmakeFile}`, `${env.sourceFolder}/${cmakeFile}`);
        }
    } else {
        exec(`patch -p0 < ${env.patchesFolder}/ZOOKEEPER-3078.patch`);

        decompress(`${env.patchesFolder}/autoreconf.tar.gz`, `${env.patchesFolder}`, {
            plugins: [
                decompressTargz(),
            ],
        }).then(() => {
            shell.cp('-R', `${env.patchesFolder}/autoreconf/*`, `${env.sourceFolder}`);
            shell.rm('-rf', `${env.patchesFolder}/autoreconf`);
        });
    }
}

if (env.isAlreadyBuilt) {
    shell.echo('Zookeeper has already been built');
    shell.exit(0);
}

shell.config.fatal = true;

if (env.isVerbose) {
    shell.config.verbose = true;
}

shell.cd(env.workFolder);

retry(download, env.downloadUrl, env.downloadedFileName)
    .then(() => {
        validateFile(env.downloadedFileName);

        clearPath();

        decompress(env.downloadedFileName, './', {
            plugins: [
                decompressTargz(),
            ],
        }).then(() => {
            moveFolder();
            applyPatches();
        }).catch((e) => {
            shell.echo(`Error: ${e.message}`);
            shell.exit(1);
        });
    })
    .catch((e) => {
        shell.echo(`Unable to download zookeeper library. Error: ${e.message}`);
        shell.exit(1);
    });
