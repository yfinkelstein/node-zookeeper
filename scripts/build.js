const shell = require('shelljs');
const env = require('./env.js');

function exec(action) {
    const res = shell.exec(action);

    if (res.code !== 0) {
        shell.echo('Unable to build zookeeper library');
        shell.exit(1);
    }
}

function handleSunOS() {
    const uname = shell.exec('uname -v');

    if (uname.match('joyent_.*')) {
        const res = shell.exec(`pkgin list | grep zookeeper-client-${env.ZK_VERSION}`);

        if (res.code !== 0) {
            shell.echo('You must install zookeeper before installing this module. Try:');
            shell.echo(`pkgin install zookeeper-client-${env.ZK_VERSION}`);
        }
    }
}

if (env.isSunOs) {
    handleSunOS();
    return;
}

if (env.isAlreadyBuilt) {
    shell.echo('Zookeeper has already been built');
    shell.exit(0);
    return;
}

shell.cd(`${env.ZK_DEPS}/src/c`);

if (env.isWindows) {
    exec(`cmake -DCMAKE_GENERATOR_PLATFORM=${process.arch} .`);
    exec('cmake --build .');
} else {
    exec('./configure --without-syncapi --enable-static --disable-shared --with-pic');
    exec('make');
}

shell.cd(env.ROOT);



