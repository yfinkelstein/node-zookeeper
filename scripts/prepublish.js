const fs = require('fs');
const http = require('http');
const shell = require('shelljs');
const env = require('./env.js');

function download(url, destination) {
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

    })
    .catch((e) => {
    shell.echo(`Unable to download zookeeper libray. Error: ${e.message}`);
    shell.exit(1);
});