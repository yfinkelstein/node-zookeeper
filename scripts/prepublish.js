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
        res.on('data', function (chunk) {
            file.write(chunk);
        });

        res.on('end', function () {
            file.end();
            resolve();
        })
    });

    req.on('error', (e) => {
        file.unlink(destination);
        reject(e);
    });

    file.on('error', () => {
        file.unlink(destination);
        reject(new Error('File error'));
    });
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
        }).catch((e) => {
            shell.echo(`Unable to decompress the zookeeper library. Error: ${e.message}`);
            shell.exit(1);
        });

    })
    .catch((e) => {
        shell.echo(`Unable to download zookeeper library. Error: ${e.message}`);
        shell.exit(1);
    });