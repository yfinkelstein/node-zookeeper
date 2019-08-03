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
shell.config.verbose = true;

shell.cd(`${env.sourceFolder}`);

if (env.isWindows) {
    exec(`cmake -DWANT_SYNCAPI=OFF -DCMAKE_GENERATOR_PLATFORM=${process.arch} .`);
    exec('cmake --build .');
} else {
    let configureCmd = './configure --without-syncapi --disable-shared --with-pic --without-cppunit';
    let makeCmd = 'make';
    if (!process.env.ZK_INSTALL_VERBOSE) {
        configureCmd += ' --enable-silent-rules --quiet';
        makeCmd += ' --no-print-directory --quiet';
    }

    exec(configureCmd);
    exec(makeCmd);
}

shell.cd(env.rootFolder);
