const shell = require('shelljs');
const env = require('./env.js');
const { exec } = require('./helper.js');

function handleSunOS() {
    const uname = shell.exec('uname -v');

    if (uname.match('joyent_.*')) {
        const res = shell.exec(`pkgin list | grep zookeeper-client-${env.zookeeperVersion}`);

        if (res.code !== 0) {
            shell.echo('You must install zookeeper before installing this module. Try:');
            shell.echo(`pkgin install zookeeper-client-${env.zookeeperVersion}`);
        }
    }
}

if (env.isSunOs) {
    handleSunOS();
    shell.exit(0);
}

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
    let flags = '-DWANT_SYNCAPI=OFF ';
    let output = '';

    if (!env.isVerbose) {
        flags = '';
        output = ' > NUL';
    }
    exec(`cmake ${flags}-DCMAKE_GENERATOR_PLATFORM=${process.arch} .${output}`);
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
