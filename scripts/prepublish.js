const fs = require('fs');
const http = require('http');
const shell = require('shelljs');
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
const env = require('./env.js');

function download(url, destination) {
    if (fs.existsSync(destination)) {
        shell.echo(`${destination} already exists. Skipping download.`);

        return Promise.resolve();
    }

    const file = fs.createWriteStream(destination);

    return new Promise((resolve, reject) => {
        const req = http.get(`${env.ZK_URL}`, (res) => {
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
    });
}

shell.cd(env.DEPS);

download(env.ZK_URL, env.ZK_FILE)
    .then(() => {
        shell.rm('-rf', env.ZK_DEPS);

        decompress(env.ZK_FILE, `${env.ZK}/src/c`, {
            plugins: [
                decompressTargz()
            ]
        }).then(() => {
            shell.echo('Files decompressed');
            shell.mv(env.ZK, env.ZK_DEPS);
            shell.echo('Files moved');
        });

    })
    .catch((e) => {
        shell.echo(`Unable to download zookeeper libray. Error: ${e.message}`);
        shell.exit(1);
    });