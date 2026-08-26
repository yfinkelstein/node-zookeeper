const { Worker } = require("worker_threads");

new Worker("./examples/index.js", { workerData: null });
