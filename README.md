# node-zookeeper

## Overview

_node-zookeeper - A Node.js client for Apache Zookeeper._

This node module is implemented on top of the __official ZooKeeper C Client API__, supporting ZooKeeper server v3.5.x - v3.8.x.
Have a look at the [official docs](https://zookeeper.apache.org/doc/current/index.html) for further details on behavior.

__Latest changes__ are described in the [changelog](./CHANGELOG.md)

## Installation

```bash
npm install zookeeper
```

And you're done!

(note the name `zookeeper` in lowercase)

#### News
:rocket: __New since version 5.4.0__ It is possible to start the zookeeper client in a Node.js Worker thread.

:rocket: __New since version 5.1.0__ Support for `SSL`, that was introduced in Apache ZooKeeper C Client v3.6.0.

:rocket: __New since version 4.9.0__ Support for `Dynamic Reconfiguration`, introduced in Apache ZooKeeper server v3.5.5.

:rocket: __New since version 4.8.0__ Support for the new node types introduced in Apache ZooKeeper server v3.5.5: `Container` and `TTL` :rocket:

:tada: __New since version 4.7.0__ :tada: The install process is faster than ever. If you are a Mac OS X or Windows user, there is no longer a need to build an AddOn during the install process.
Everything is already included in the package. Linux user? Don't worry, the installer will quickly build a `Native Node.js AddOn` for the Linux flavor you are running.

## Examples

```javascript
const ZooKeeper = require('zookeeper');
```

The ZooKeeper client support both callbacks and __Promises__ using the `then` or `async/await` syntax.

### Documentation
The source code is documented with `JSDoc` code comments and `TypeScript` type declarations. 

Also, have a look at the API documentation here: 
* [async/await enabled methods](#methods-asyncawait-enabled-client-methods)
* [callback enabled methods](#methods-callbacks-based-client-methods)


### Example: create a client

Create an instance of the ZooKeeper client:

```javascript
function createClient(timeoutMs = 5000) {
    const config = {
        connect: host,
        timeout: timeoutMs,
        debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN,
        host_order_deterministic: false,
    };

    return new ZooKeeper(config);
}

const client = createClient();
```

The client is ready when connected to a ZooKeeper server:

```javascript
client.on('connect', () => {
    // start using the client
});

client.init(config);
```

### Example: create a node

Using the API:

```javascript
const path = '/myPath';
try {
    const createdPath = await client.create(path, data, ZooKeeper.ZOO_EPHEMERAL);

    console.log(`(created: ${createdPath})`);
} catch (error) {
    console.log(`${path} already exists`);
}
```

### More examples

Have a look at the code in the [examples](./examples) folder: with __master__, __workers__, __tasks__ and __listeners__ scenarios.

## API Reference

### Methods: async/await enabled client methods

:green_circle: New since 5.2.1: :red_circle: the async functions will reject, when the underlying client returns an error code. This is a bug fix. Before this, errors were failing silently.

* `init(options)`
* `connect(options, connect_cb)`
* `close()`
* `path = await create(path, data, flags, ttl)`
    * `ttl` is optional. Must be positive if a TTL flag is used. See [Input parameters](#input-parameters)
* `mkdirp(path, callback(Error))`
* `stat = await exists(path, watch)`
    * rejects if node does not exist. There's also a `pathExists` as an alternative.
* `trueOrFalseValue = await pathExists(path, watch)`
* `[stat, string|Buffer] = await get(path, watch)`
* `children = await get_children(path, watch)`
* `[children, stat] = await get_children2( path, watch)`
    * return value types:
        * children is an array of strings
        * stat is an object
* `stat = await set(path, data, version)`
* `val = await sync(path)`
* `delete_ (path, version)`
  * (note the trailing `_`)
* `config = getconfig(watch)`
* `reconfig(joining, leaving, members, config_version)`
* `set_acl(path, version, acl)`
* `acl = await get_acl(path)`
* `add_auth(scheme, auth)`

*The watcher methods are forward-looking subscriptions that can recieve multiple callbacks whenever a matching event occurs.*

* `stat = await w_exists(path, watch_cb)`
    * rejects if node does not exist. There's also a `w_pathExists` as an alternative.
* `trueOrFalseValue = await w_pathExists(path, watch)`
* `[stat, string|Buffer] = await w_get(path, watch_cb)`
* `children = await w_get_children(path, watch_cb)`
* `[children, stat] = await w_get_children2 (path, watch_cb)`
    * return value types:
        * children is an array of strings
        * stat is an object
* `config = w_getconfig(watch_cb)`

### Methods: callbacks based client methods

* `init(options)`
* `connect(options, connect_cb)`
* `close()`
* `a_create(path, data, flags, path_cb)`
* `a_createTtl(path, data, flags, ttl, pathCb)`
* `mkdirp(path, callback(Error))`
* `a_exists(path, watch, stat_cb)`
* `a_get(path, watch, data_cb)`
* `a_get_children(path, watch, child_cb)`
* `a_get_children2(path, watch, child2_cb)`
* `a_set(path, data, version, stat_cb)`
* `a_sync(path, value_cb)`
* `a_delete_ (path, version, void_cb)`
  * (note the trailing `_`)
* `a_getconfig(watch, data_cb)`
* `a_reconfig(joining, leaving, members, version, data_cb)`  
* `a_set_acl(path, version, acl, void_cb)`
* `a_get_acl(path, acl_cb)`
* `add_auth(scheme, auth, void_cb)`

*The watcher methods are forward-looking subscriptions that can recieve multiple callbacks whenever a matching event occurs.*

* `aw_exists(path, watch_cb, stat_cb)`
* `aw_get(path, watch_cb, data_cb)`
* `aw_get_children(path, watch_cb, child_cb)`
* `aw_get_children2(path, watch_cb, child2_cb)`
* `aw_getconfig(watch_cb, data_cb)`

### Callback Signatures

* path_cb : function(rc, error, path)
* stat_cb : function(rc, error, stat)
    * Invoked with error set if path does not exist, also for a_exists() calls
* data_cb : function(rc, error, stat, data)
* child_cb : function(rc, error, children)
* child2_cb : function(rc, error, children, stat)
* value_cb : function(rc, error, value)
* void_cb : function(rc, error)
* watch_cb : function(type, state, path)
* acl_cb : function(rc, error, acl, stat)
* connect_cb: function(err, zookeeper)

### Input Parameters

* options : object. valid keys: { connect, timeout, debug_level, host_order_deterministic, data_as_buffer, response_counter_limit }
* path : string
* data : string or Buffer
* flags : int32. Supported:
  - `ZOO_PERSISTENT`
  - `ZOO_EPHEMERAL`
  - `ZOO_PERSISTENT_SEQUENTIAL`
  - `ZOO_EPHEMERAL_SEQUENTIAL`
  - `ZOO_CONTAINER`
  - `ZOO_PERSISTENT_WITH_TTL`
  - `ZOO_PERSISTENT_SEQUENTIAL_WITH_TTL`
* version : int32. `null` or `undefined` will skip version checking.
* watch : boolean
* ttl: int32. TTL in milliseconds. Must be positive if any of the TTL modes is used; otherwise `undefined`.
* scheme : authorisation scheme (digest, auth)
* joining : string. Comma separated list of servers to be added. `null` for non-incremental reconfiguration.
* leaving : string. Comma separated list of servers to be removed. `null` for non-incremental reconfiguration.
* members : string. Comma separated list of new membership. `null` for incremental reconfiguration.
* config_version : int64. `-1` to skip version checking
* auth : authorisation credentials (username:password)
* acl : acls list (same as output parameter, look below) - read only

### Output Parameters

* path is a string
* data is either a Buffer (default), or a string (this is controlled by data_as_buffer = true/false)
* children is an array of strings
* rc is an int (error codes from zk api)
* error is a string (error string from zk api)
* type is an int event type (from zk api)
* state is an int (state when the watcher fired from zk api)
* stat is an object with the following attributes:
  * long czxid              // created zxid
  * long mzxid              // last modified zxid
  * long ctime              // created
  * long mtime              // last modified
  * int version             // version
  * int cversion            // child version
  * int aversion            // acl version
  * string ephemeralOwner   // owner session id if ephemeral, 0 otw
  * int dataLength          // length of the data in the node
  * int numChildren         // number of children of this node
  * long pzxid              // last modified children
* acl is an array of acls objects, single acl object has following key
  * int perms               // permisions
  * string scheme           // authorisation scheme (digest, auth)
  * string auth             // authorisation credentials (username:hashed_password)
* zookeeper is the ZooKeeper instance on which connect was called

Session state machine is well described in the [Zookeeper docs](http://zookeeper.apache.org/doc/r3.5.5/zookeeperProgrammers.html#ch_zkSessions)

### ACL and authorisation

The library comes with 3 default ACL levels defined (comes from ZK):

* ZooKeeper.ZOO_OPEN_ACL_UNSAFE - anyone can do anything
* ZooKeeper.ZOO_READ_ACL_UNSAFE - anyone can read
* ZooKeeper.ZOO_CREATOR_ALL_ACL - gives full rights to authorised user (you have to be authorised first, otherwise it will result with "invalid acl")

If you don't want to use predefined ACLs you can define your own (the ACL object is described above), for limiting permisions you can use:

* ZooKeeper.ZOO_PERM_READ - read permission
* ZooKeeper.ZOO_PERM_WRITE - write permission
* ZooKeeper.ZOO_PERM_CREATE - create permission
* ZooKeeper.ZOO_PERM_DELETE - delete permission
* ZooKeeper.ZOO_PERM_ADMIN - admin permission
* ZooKeeper.ZOO_PERM_ALL - all of the above

For more details please refer to ZooKeeper docs.

## Windows support

Windows 10 is supported out of the box with no additional requirements other than Node.js itself.

Running a different Windows version? Install `CMake` to build a ZooKeeper client on Windows and install Python.

Also, run `npm install` in a Powershell window. For further instructions visit [node-gyp documentation](https://github.com/nodejs/node-gyp/#on-windows).

Windows support has been enabled mainly for supporting development, not for production.

## Development

To run full output during the module build one has to use `ZK_INSTALL_VERBOSE` flag.

`ZK_INSTALL_VERBOSE=1 npm install`

### For Windows (PowerShell): verbose build

```bash
$env:ZK_INSTALL_VERBOSE=1
npm install
```

This PowerShell command will remove the environment variable:

```bash
Remove-Item Env:\ZK_INSTALL_VERBOSE
```

## Implementation Notes

* Zookeeper C API library comes in 2 flavours: single-threaded and multi-threaded. For node.js, single-threaded library provides the most sense since all events coming from ZooKeeper responses have to be dispatched to the main JavaScript thread.
* The C++ code uses the same logging facility that ZK C API uses internally. Hence zk_log.h file checked into this project. The file is considered ZooKeeper internal and is not installed into /usr/local/include
* Multiple simultaneous ZooKeeper connections are supported and tested
* All ZooKeeper constants are exposed as read-only properties of the ZooKeeper function, like ZK.ZOO_EPHEMERAL
* All ZooKeeper API methods including watchers are supported.

## Known Bugs & Issues

* The lib will segfault if you try to use a ZooKeeper intance after the on_closed event is delivered (possibly as a result of session timeout etc.) YOU MAY NOT re-use the closed ZooKeeper instance. You should allocate a new one and initialize it as a completely new client. Any and all watchers from your first instance are lost, though they may fire (before the on_close) see below.
* Any established watches may/will be fired once each when/if your client is expired by the ZooKeeper server, the input arguments are observed to be: type=-1, state=1, path="". Care should be taken to handle this differently than a "real" watch event if that matters to your application.

## Contribute to the project

Check out the issues tab and grab one! Read the [contributing](./CONTRIBUTING.md) document.

## See Also

* [http://zookeeper.apache.org/releases.html](http://zookeeper.apache.org/releases.html)
* [http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#ZooKeeper+C+client+API](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#ZooKeeper+C+client+API)

## Acknowledgments

* [Apache ZooKeeper &trade;](http://zookeeper.apache.org/) source code is included in this repository. An open source volunteer project under the Apache Software Foundation.

## LICENSE

See [LICENSE-MIT.txt](./LICENSE-MIT.txt) file in the top level folder.

## ORIGINAL AUTHOR

Yuri Finkelstein (yurif2003 at yahoo dot com)

with awesome contributions from:

* Woody Anderson (Woodya)
* Dave Dopson (ddopson)
* Ryan Phillips (rphillips)
* David Trejo (DTrejo)
* Mark Cavage (mcavage)
* Jakub Lekstan (kuebk)
* Matt Lavin (mdlavin)
* David Vujic (davidvujic)
* Jakub Bieńkowski (jbienkowski311)
* Brendan Hack (bhack-onshape)
