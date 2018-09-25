const path = require('path');
const shell = require('shelljs');

if (process.argv.length !== 3) {
    shell.echo(`Usage: node ${process.argv[1]} <PRODUCT_DIR>`);
    shell.exit(1);
    return;
}

const fileName = process.argv[2];
const parsed = path.parse(fileName);

const name = parsed.base;
const folder = parsed.dir.split('/').pop();

shell.ln('-s', `${folder}/${name}`, `build/${name}`);
