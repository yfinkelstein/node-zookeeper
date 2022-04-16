const { Worker } = require('worker_threads');

// eslint-disable-next-line no-new
new Worker('./examples/index.js', { workerData: null });
