const shell = require('shelljs');

function exec(action) {
    const res = shell.exec(action);

    if (res.code !== 0) {
        shell.echo('Unable to build zookeeper library');
        return shell.exit(1);
    }

    return res.stdout;
}

function retry(func, ...args) {
    try {
        return func(...args);
    } catch (e) {
        shell.echo(e.message);
        return func(...args);
    }
}

module.exports = {
    exec,
    retry,
};
