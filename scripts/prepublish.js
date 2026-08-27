const shell = require("shelljs");
const tar = require("tar");
const env = require("./env");

function clearPath() {
    if (!shell.test("-d", env.sourceFolder)) {
        return;
    }

    shell.rm("-rf", env.sourceFolder);
}

function applyPatches() {
    if (env.isWindows) {
        const destination = `${env.sourceFolder}/src`;
        shell.echo("Applying patches");
        shell.sed(
            "-i",
            '#include "zookeeper_log.h"',
            '#include "zookeeper_log.h"\n#include "winport.h"\n',
            `${destination}/zk_log.c`,
        );
        shell.sed(
            "-i",
            '#include "zookeeper.h"',
            '#include "winport.h"\n#include "zookeeper.h"\n',
            `${destination}/zk_adaptor.h`,
        );
        shell.sed(
            "-i",
            '#include "zk_adaptor.h"',
            '#include "zk_adaptor.h"\n#include "winport.h"\n',
            `${destination}/zookeeper.c`,
        );
    }
}

if (env.isAlreadyBuilt) {
    shell.echo("Zookeeper has already been built");
    shell.exit(0);
}

shell.config.fatal = true;

if (env.isVerbose) {
    shell.config.verbose = true;
}

shell.cd(env.workFolder);
clearPath();

tar.extract({
    file: env.downloadedFileName,
    cwd: env.workFolder,
})
    .then(() => {
        shell.echo("Decompressed file");
        applyPatches();
    })
    .catch((e) => {
        shell.echo(`Error: ${e.message}`);
        shell.exit(1);
    });
