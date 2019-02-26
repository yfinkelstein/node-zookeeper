const fs = require('fs');
const http = require('http');
const shell = require('shelljs');
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
const env = require('./env.js');
const { exec } = require('./helper.js');

function writeFile(url, destination, resolve, reject) {
    const file = fs.createWriteStream(destination);

    const req = http.get(url, (res) => {
        res.pipe(file);
    });

    req.on('error', (e) => {
        file.unlink(destination);
        reject(e);
    });

    file.on('error', () => {
        file.unlink(destination);
        reject(new Error('File error'));
    });

    file.on('finish', resolve);
}

function download(url, destination) {
    if (fs.existsSync(destination)) {
        shell.echo(`${destination} already exists. Skipping download.`);

        return Promise.resolve();
    }

    const executor = writeFile.bind(null, url, destination);
    return new Promise(executor);
}

function validateFile(fileName) {
    let res;

    if (env.isWindows) {
        const output = exec(`certutil -hashfile ${fileName} sha1`).split('\r\n');

        const arr = output[0].replace(':', '').split(' ');
        const name = arr.find(n => n === fileName);

        const sha1 = output[1];
        res = `${sha1}  ${name}`;
    } else {
        res = exec(`shasum -a 1 ${fileName}`).trim();
    }

    if (res !== env.ZK_VERSION_SHA1) {
        throw new Error(`Wrong sha1 for ${fileName}! Expected "${env.ZK_VERSION_SHA1}", got "${res}".`);
    }
}

function patch() {
    if (env.isWindows) {
        const destination = `${env.ZK_DEPS}/src/c/src`;
        shell.cp(`${env.ROOT}/patches/windows/zookeeper.c`, `${destination}/zookeeper.c`);
        shell.cp(`${env.ROOT}/patches/windows/zk_log.c`, `${destination}/zk_log.c`);
        shell.cp(`${env.ROOT}/patches/windows/zk_adaptor.h`, `${destination}/zk_adaptor.h`);
        return;
    }

    exec(`patch -p0 < ${env.ROOT}/patches/ZOOKEEPER-642.patch`);
}

if (env.isAlreadyBuilt) {
    shell.echo('Zookeeper has already been built');
    shell.exit(0);
    return;
}

shell.cd(env.DEPS);

download(env.ZK_URL, env.ZK_FILE)
    .then(() => {
        validateFile(env.ZK_FILE);

        shell.rm('-rf', env.ZK_DEPS);

        decompress(env.ZK_FILE, './', {
            plugins: [
                decompressTargz()
            ]
        }).then(() => {
            shell.mv(env.ZK, env.ZK_DEPS);
            patch();
        }).catch((e) => {
            shell.echo(`Error: ${e.message}`);
            shell.exit(1);
        });

    })
    .catch((e) => {
        shell.echo(`Unable to download zookeeper library. Error: ${e.message}`);
        shell.exit(1);
    });
