const shell = require('shelljs');
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
const env = require('./env');

function clearPath() {
    if (!shell.test('-d', env.sourceFolder)) {
        return;
    }

    shell.rm('-rf', env.sourceFolder);
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
clearPath();

decompress(env.downloadedFileName, './', {
    plugins: [
        decompressTargz(),
    ],
}).then(() => {
    shell.echo('Decompressed file');
}).catch((e) => {
    shell.echo(`Error: ${e.message}`);
    shell.exit(1);
});
