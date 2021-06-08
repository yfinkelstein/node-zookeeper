const shell = require('shelljs');
const env = require('./env');
const { exec } = require('./helper');

if (env.isAlreadyBuilt) {
    shell.echo('Zookeeper has already been built');
    shell.exit(0);
}

shell.config.fatal = true;
if (env.isVerbose) {
    shell.config.verbose = true;
}

shell.cd(`${env.sourceFolder}`);

if (env.isWindows) {
    const output = env.isVerbose ? '' : ' > NUL';
    exec(`cmake -DWANT_SYNCAPI=OFF -DCMAKE_GENERATOR_PLATFORM=${process.arch} .${output}`);
    exec(`cmake --build .${output}`);
} else {
    const flags = '-w';
    let configureCmd = `./configure CFLAGS='${flags}' --without-syncapi --disable-shared --with-pic --without-cppunit`;
    let makeCmd = 'make';

    if (!env.isVerbose) {
        configureCmd += ' --enable-silent-rules --quiet';
        makeCmd += ' --no-print-directory --quiet';
    }

    exec(configureCmd);
    exec(makeCmd);
}

shell.cd(env.rootFolder);
