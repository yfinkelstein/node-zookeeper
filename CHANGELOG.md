#### v 4.8.0 (2021-01-31)
* feat: add support for TTL and Container nodes. Pull request [255](https://github.com/yfinkelstein/node-zookeeper/pull/255) by @dreusel
* fix: Example code: use one client, use only when connected  Pull request [264](https://github.com/yfinkelstein/node-zookeeper/pull/264) by @davidvujic

#### v 4.7.1 (2020-12-27)
* fix: build an AddOn from the ZooKeeper C Client v3.5.8 in all platforms (Linux, Mac OS X and Windows). Pull request [260](https://github.com/yfinkelstein/node-zookeeper/pull/260) by @davidvujic

#### v 4.7.0 (2020-12-17)
* feat: include prebuilt binaries for Mac OS X (darwin, x64) and Windows - for node 12 and 14. This will simplify and fasten the install process a lot. Pull request [251](https://github.com/yfinkelstein/node-zookeeper/pull/251) by @davidvujic
* fix: note about rejecting/erroring when path does not exist in exists() calls. Pull request [256](https://github.com/yfinkelstein/node-zookeeper/pull/256) by @dreusel
* docs: simplify docs and add info about prebuilds. Pull request [253](https://github.com/yfinkelstein/node-zookeeper/pull/253) by @davidvujic

#### v 4.7.0-beta.0 (2020-11-29)
* feat: include prebuilt binaries for Mac OS X (darwin, x64) and Windows - for node 12 and 14. This will simplify and fasten the install process a lot. Pull request [252](https://github.com/yfinkelstein/node-zookeeper/pull/252) by @davidvujic

#### v 4.6.0 (2020-10-31)
* feat: The default API from the library is the async/await enabled client (containing both callbacks and promisified methods)
* fix: add TypeScript declarations.
Pull request [246](https://github.com/yfinkelstein/node-zookeeper/pull/246) by @davidvujic

#### v 4.5.3 (2020-09-20)
* fix: Update depencencies causing warnings on install. Pull request [242](https://github.com/yfinkelstein/node-zookeeper/pull/242) by @davidvujic

#### v 4.5.2 (2020-01-22)
* fix: try an alternative shasum command when missing on Linux systems. Pull request [234](https://github.com/yfinkelstein/node-zookeeper/pull/234) by @hwzhangd

#### v 4.5.1 (2019-12-09)
* fix: add_auth expecting three arguments, add the missing `voidCb` parameter. Pull request [230](https://github.com/yfinkelstein/node-zookeeper/pull/230) by @wareczek

#### v 4.5.0 (2019-11-05)
* feat: Zookeeper 3.5.6. Pull request [226](https://github.com/yfinkelstein/node-zookeeper/pull/226)
* fix: Rollback for Windows client (3.4.14). This is the motivation for bumping the Minor version. Pull request [226](https://github.com/yfinkelstein/node-zookeeper/pull/226)

#### v 4.4.2 (2019-09-21)
* fix: too many close events emitted from the client caused by ZNOTHING socket responses. Pull request [221](https://github.com/yfinkelstein/node-zookeeper/pull/221)
* fix: remove duplicate parameter definitions

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
