#### v 4.4.1 (2019-08-22)
* fix: include ZooKeeper source code, instead of downloading on install, pull request [219](https://github.com/yfinkelstein/node-zookeeper/pull/219)
* feat: Integration tests in Docker, pull request [218](https://github.com/yfinkelstein/node-zookeeper/pull/218) by @jbienkowski
* feat: less verbose Windows builds, pull request [217](https://github.com/yfinkelstein/node-zookeeper/pull/217)
* fix: GCC build errors, pull request [215](https://github.com/yfinkelstein/node-zookeeper/pull/215)
* feat: move constants to a separate file, pull request [212](https://github.com/yfinkelstein/node-zookeeper/pull/212) by @jbienkowski

#### v 4.4.0 (2019-08-11)
* fix: typos in the code documentation for async `get_children`.
* fix: retry download the ZooKeeper C Client if failed during `npm install`.
* feature: use v3.5.5 of the ZooKeeper C Client.

#### v 4.3.0 (2019-07-30)
* Refactor all JavaScript code to ECMAScript 2017 and native Promises: pull request [185](https://github.com/yfinkelstein/node-zookeeper/pull/185) by @jbienkowski311
* Copy instead of symlink in build process (Windows users can install without admin access): pull request [190](https://github.com/yfinkelstein/node-zookeeper/pull/190)
* Quicker build process in Windows, without massive output or warnings: pull request [191](https://github.com/yfinkelstein/node-zookeeper/pull/191) 
* Code documentation for public API: pull request [192](https://github.com/yfinkelstein/node-zookeeper/pull/192)
* README revision, simplified and promoting async/await enabled client: pull request [193](https://github.com/yfinkelstein/node-zookeeper/pull/193)
* jsDoc type definitions in code documentation: pull request [196](https://github.com/yfinkelstein/node-zookeeper/pull/196)

#### v 4.2.0 (2019-07-16)
* fix: Node.js 12 support
* fix: V8 and Nan deprecation warnings
* chore: reduce build output on Linux/Mac OS X. Pull request [183](https://github.com/yfinkelstein/node-zookeeper/pull/183) by @jbienkowski311
* fix: deprecated getters and setters, pull request [181](https://github.com/yfinkelstein/node-zookeeper/pull/181) by @jbienkowski311 
* chore: pull request template, added by @jbienkowski311
* chore: added integration test scripts

#### v 4.1.1 (2019-06-18)
* feat: handle ZNOTHING return code from the ZooKeeper C library
* fix: README typos
* chore: added example code in the examples folder - master, workers and tasks
* chore: run code in a linux docker container using a Dockerfile
* chore: moved existing manual tests to the tests_integration folder
* Merge pull request #174 from @peZhmanParsaee: delete .npmignore file
* Merge pull request #170 from @arpitsingh94: Added documentation for "connect" function
* Merge pull request #164 from @luc-boussant: Update issue templates
* Merge pull request #163 from @tabbartley: Add CODE-OF-CONDUCT


#### v 4.0.3 (2019-04-25)
* chore: added unit tests, mostly asserting the public API.
* chore: added ESLint and the Airbnb JavaScript style guide.
* chore: added .editorconfig

#### v 4.0.2 (2019-04-13)
* fixed: Windows 7 support (Pull Request by https://github.com/ndxbn)


#### v 4.0.1 (2019-03-10)
* Added docs: changelog, contributing to the project, fixed typos and missing info in the readme file.

#### v 4.0.0 (2019-03-02)
* Added Windows support! A long awaited issue finally solved.
* __BREAKING__: dropped support for Node.js versions older than version 8.
* `node-zookeeper` now uses __SemVer__ for versioning.

Read details about the release here: [Windows support](https://github.com/yfinkelstein/node-zookeeper/pull/145)

#### v 3.4.9-4 (2019-01-16)
* Fixed npm install fails when using Node version 10.

Details about the release here: [Node.js 10 support](https://github.com/yfinkelstein/node-zookeeper/pull/142)
