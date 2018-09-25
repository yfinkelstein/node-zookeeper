const os = require('os');
const fs = require('fs');
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

if (os.platform() === 'SunOS') {
    handleSunOS();
    return;
}

const isAlreadyBuilt = fs.existsSync(`${env.BUILD}/lib/libzookeeper_st.la`);

if (isAlreadyBuilt) {
    shell.echo('Zookeeper has already been built');
    shell.exit(0);
    return;
}

shell.cd(`${env.ZK_DEPS}/src/c`);

exec('./configure --without-syncapi --enable-static --disable-shared --with-pic');
exec('make');

shell.cd(env.ROOT);



