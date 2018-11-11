const fs = require('fs');
const http = require('http');
const shell = require('shelljs');
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
const env = require('./env.js');

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

if (env.isAlreadyBuilt) {
    shell.echo('Zookeeper has already been built');
    shell.exit(0);
    return;
}

shell.cd(env.DEPS);

download(env.ZK_URL, env.ZK_FILE)
    .then(() => {
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