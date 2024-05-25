# Component unit tests

Unit tests written in JavaScript, verifying functionality in C++ files that are included in the ZooKeeper wrapper `node-zk.cpp`.

## Run tests
`npm run build-components`
`npm run test-components`

The command will build C++ code to Native Node.js addons, to make it testable with JavaScript. The source files are included by C++ wrapper files with Addon features from the Nan library (the files are stored in the `wrappers` folder).
