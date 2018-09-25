const env = require('./env.js');
const fs = require('fs');
const shell = require('shelljs');

function exec(action) {
    const res = shell.exec(action);

    if (res.code !== 0) {
        shell.echo('Unable to build zookeeper library');
        shell.exit(1);
    }
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



