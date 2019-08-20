const shelljs = require('shelljs');
const path = require('path');

let n = 1;
const dir = 'tests/integration';
const zookeeperHost = process.argv[2] || 'localhost:2181';

function runtest (testcase, ...args) {
    console.log();
    console.log();
    console.log('\x1b[33m%s\x1b[0m', `Running test #${n}: '${testcase}'`);
    args.push(zookeeperHost);
    shelljs.exec(`node ${path.join(dir, testcase)} ${args.join(' ')}`);
    n++;
}

runtest('zk_test_a_get_children.js');
runtest('zk_test_buffer.js');
runtest('zk_test_chain.js', 2);
runtest('zk_test_create.js', 10, 2);
runtest('zk_test_mkdirp.js');
runtest('zk_test_utf8.js');
runtest('zk_test_watcher.js', 2);
runtest('zk_test_watcher_promise.js');
runtest('zk_test_watcher_session.js', 2);
runtest('zk_test_end_session.js');
