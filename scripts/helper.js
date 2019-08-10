const shell = require('shelljs');

function exec(action) {
    const res = shell.exec(action);

    if (res.code !== 0) {
        shell.echo('Unable to build zookeeper library');
        return shell.exit(1);
    }

    return res.stdout;
}

async function retry(func, ...args) {
    let res;

    try {
        res = await func(...args);
    } catch (e) {
        shell.echo(e.message);
        shell.echo(`Retrying ${func.name}`);

        res = await func(...args);
    }

    return res;
}

module.exports = {
    exec,
    retry,
};
