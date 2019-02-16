const shell = require('shelljs');

function exec(action) {
    const res = shell.exec(action);

    if (res.code !== 0) {
        shell.echo('Unable to build zookeeper library');
        shell.exit(1);
    } else {
        return res.stdout;
    }
}

module.exports = {
    exec,
};
