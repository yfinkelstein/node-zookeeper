# Overview

node-zookeeper - A Node.js client for Apache Zookeeper.

This module is implemented on top of the ZooKeeper C API; consult the [ZK Reference](http://zookeeper.apache.org/doc/r3.4.0/index.html) for further details on behavior.

# Example

```javascript
var ZooKeeper = require ("zookeeper");
var zk = new ZooKeeper({
  connect: "localhost:2181"
 ,timeout: 200000
 ,debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARNING
 ,host_order_deterministic: false
});
zk.connect(function (err) {
    if(err) throw err;
    console.log ("zk session established, id=%s", zk.client_id);
    zk.a_create ("/node.js1", "some value", ZooKeeper.ZOO_SEQUENCE | ZooKeeper.ZOO_EPHEMERAL, function (rc, error, path)  {
        if (rc != 0) {
            console.log ("zk node create result: %d, error: '%s', path=%s", rc, error, path);
        } else {
            console.log ("created zk node %s", path);
            process.nextTick(function () {
                zk.close ();
            });
        }
    });
});
```

# API Reference

### Methods ###

* init ( options )
* close ( )
* a_create ( path, data, flags, path_cb )
* a_exists ( path, watch, stat_cb )
* a_get ( path, watch, data_cb )
* a_get_children ( path, watch, child_cb )
* a_get_children2 ( path, watch, child2_cb )
* a_set ( path, data, version, stat_cb )
* a_delete`_` ( path, version, void_cb )
    * (trailing `_` is added to avoid conflict with reserved word `_delete_` since zk_promise.js strips off prefix `a_` from all operations)

*The watcher methods are forward-looking subscriptions that can recieve multiple callbacks whenever a matching event occurs.*

* aw_exists ( path, watch_cb, stat_cb )
* aw_get ( path, watch_cb, data_cb )
* aw_get_children ( path, watch_cb, child_cb )
* aw_get_children2 ( path, watch_cb, child2_cb )

### Callback Signatures ###

 * path_cb : function ( rc, error, path )
 * stat_cb : function ( rc, error, stat )
 * data_cb : function ( rc, error, stat, data )
 * child_cb : function ( rc, error, children )
 * child2_cb : function ( rc, error, children, stat )
 * void_cb : function ( rc, error )
 * watch_cb : function ( type, state, path )

### Input Parameters ###

 * options : object. valid keys: { connect, timeout, debug_level, host_order_deterministic, data_as_buffer}
 * path : string
 * data : string or Buffer
 * flags : int32
 * version : int32
 * watch : boolean

### Output Parameters ###

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
     * int dataLength          //length of the data in the node
     * int numChildren         //number of children of this node
     * long pzxid              // last modified children


Session state machine is well described in Zookeeper docs, i.e.
![here](http://hadoop.apache.org/zookeeper/docs/r3.3.1/images/state_dia.jpg "State Diagram")

# Limitations
* no zookeeper ACL support
* no support for authentication
* tests are not standalone, must run a zk server (easiest if you run at localhost:2181, if not you must pass the connect string to the tests)
* only asynchronous ZK methods are implemented. Hey, this is node.js ... no sync calls are allowed

# Implementation Notes

### NOTE on Module Status (DDOPSON-2011-11-30):
* I ported this module to Node v0.6.0.  I did my best to retain compatibility with Node v0.4.x.  File bugs if you find any.
* I have also worked to normalized the API style to be more conformant with Node conventions.  Again, I did my best to keep backwards compatibility with the old version.  File bugs if you find any.
* The test coverage is pretty spotty.  It would be really great if someone converted the tests to Vows and / or using a mock instead of depending on a live ZK server.  I can't test and don't really trust the "promise" stuff in this module, but the core module itself works and makes my tests pass on downstream dependencies.

Fixes:
* Node v0.6.0 compatibility - There is no native EventEmitter class anymore.  Need a JS shim.
* Node v0.6.0 compatibility - MODULE_INIT macro just plain doesn't work.  not sure why, but an init function works just fine.
* Node v0.6.0 compatibility - 'sys' ==> 'util'
* Node v0.6.0 compatibility - There was an issue with the EV_A macro in yield();  was able to comment it out without harming behavior
* events should be strings like 'connect' instead of ZK.on_connected.  follow convention here.
* no sense in "require('zookeeper').ZooKeeper" instead of simply "require('zookeeper')"

TODO:
* convert error codes to the names of the constants (eg, ZOO_CONNECT_FAIL instead of -110).
* method names should map to convention. The "a_method" pattern is quite redundant in node.
* Init should be called "connect", and should take a callback.  Forcing clients to use the events is awkward and error prone
* Why do the watchers take two callbacks?


### v0.2.x ==> v0.4.x Transition
Data coming out of ZooKeepr (in callbacks) will now default to being Buffer objects. The main ZK handle now has a boolean attribute called 'data_as_buffer', which defaults to true. If you are storing strings only, as was only allowed in the initial implementation, or you wish to have data in callbacks arrive as strings, you add 'data_as_buffer:false' to the init options, or add 'zk.data_as_buffer = false;' before using the handle. The behavior defaults to Buffer objects because this aligns more closely with ZooKeeper itself which uses byte arrays. They are interchangable on input, if the input is a Buffer it will be used directly, otherwise the toString() of the input is used (this will work with utf8 data as well) regardless of mode.

With the new Buffer changes in the 0.3+ and 0.4+ branches, these will be internal 'SlowBuffer' objects, and you should use Buffer.isBuffer if you are checking the type, as 'instanceof Buffer' will return false.

### yfinkelstein's original implementation notes

* Zookeeper C API library comes in 2 flavours: single-threaded and multi-threaded. For node.js, single-threaded library provides the most sense since all events coming from ZK responses have to be dispatched to the main JS thread.
* The C++ code uses the same logging facility that ZK C API uses internally. Hence zk_log.h file checked into this project. The file is considered ZK internal and is not installed into /usr/local/include
* Multiple simultaneous ZK connections are supported and tested
* All ZK constants are exposed as read-only properties of the ZooKeeper function, like ZK.ZOO_EPHEMERAL
* All ZK API methods including watchers are supported.
* lib/zk_promise.js is an optional module that makes use of the very cool **node-promise** library;
 see tests/zk_test_shootout_promise.js for illustration of how it can simplify coding. Isn't the following looking nicer?

```javascript
zk_r.on_connected().
then (
    function (zkk){
        console.log ("reader on_connected: zk=%j", zkk);
        return zkk.create ("/node.js2", "some value", ZK.ZOO_SEQUENCE | ZK.ZOO_EPHEMERAL);
    }
).then (
    function (path) {
        zk_r.context.path = path;
        console.log ("node created path=%s", path);
        return zk_r.w_get (path,
            function (type, state, path_w) { // this is a watcher
                console.log ("watcher for path %s triggered", path_w);
                deferred_watcher_triggered.resolve (path_w);
            }
        );
    }
).then (
    function (stat_and_value) { // this is the response from w_get above
        console.log ("get node: stat=%j, value=%s", stat_and_value[0], stat_and_value[1]);
        deferred_watcher_ready.resolve (zk_r.context.path);
        return deferred_watcher_triggered;
    }
).then (
    function () {
        console.log ("zk_reader is finished");
        process.nextTick( function () {
            zk_r.close ();
        });
    }
);
```

* Also compare test/zk_test_watcher.js with test/zk_test_watcher_promise.js
* tests/zk_master.js and tests/zk_worker.js illustrate launching multiple ZK client workers using webworker library. You have to install it first with **"npm install webworker"**

# Building the module by hand
-----

```javascript
node-waf configure build [--zookeeper zookeeper-version|prefix-path|'']
```

- note: for more details on the zk c-client build process, see [here](http://hadoop.apache.org/zookeeper/docs/r3.3.1/zookeeperProgrammers.html#C+Binding "Build C client")
- note: node_compat.h (ala node-png) handles Buffer changes from .2 to .3+, so you should be able to build against older node versions.
- note: if you wish to build with a specific version of zookeeper C lib, use --zookeeper VERSION (will download/build it) or --zookeeper PATH (if you have downloaded it and possibly made changes etc.)
- note: if you wish to link against an existing zookeeper lib: use --zoookeeper '', and put your lib/headers it in /usr/local/ (or edit the wscript appropriately)
- note: if you are building on osx and you get a compile error regarding "mmacosx-version-min", you may need to edit the wscript and remove it  (anyone with the answer please explain/fix if possible).
- note: if you are building on a platform for which the options are not working, please add a specific elif for that platform and create a pull request.

# Known Bugs & Issues

DDOPSON-2011-11-30 - are these issues still relevant?  unknown.

- The lib will segfault if you try to use a ZooKeeper intance after the on_closed event is delivered (possibly as a result of session timeout etc.) YOU MAY NOT re-use the closed ZooKeeper instance. You should allocate a new one and initialize it as a completely new client. Any and all watchers from your first instance are lost, though they may fire (before the on_close) see below.
- Any established watches may/will be fired once each when/if your client is expired by the ZK server, the input arguments are observed to be: type=-1, state=1, path="". Care should be taken to handle this differently than a "real" watch event if that matters to your application.
- Otherwise, it just works!

# See Also

- [http://hadoop.apache.org/zookeeper/releases.html](http://hadoop.apache.org/zookeeper/releases.html)
- [http://hadoop.apache.org/zookeeper/docs/r3.3.1/zookeeperProgrammers.html#ZooKeeper+C+client+API](http://hadoop.apache.org/zookeeper/docs/r3.3.1/zookeeperProgrammers.html#ZooKeeper+C+client+API)
- [http://github.com/kriszyp/node-promise](http://github.com/kriszyp/node-promise)
- [http://github.com/pgriess/node-webworker](http://github.com/pgriess/node-webworker)

# Acknowledgments

- **[node-promise](http://github.com/kriszyp/node-promise "node-promise") by kriszyp** is a fantastic tool imho. I wish it was distributed as a module so that I could easily 'require' it rather then
 resort to distribution by copy.
- **[node-webworker](http://github.com/pgriess/node-webworker "node-webworker") by pgriess** is used to spawn multiple ZK workers in one of the tests.

# LICENSE

See [LICENSE-MIT.txt](./LICENSE-MIT.txt) file in the top level folder.

# ORIGINAL AUTHOR

Yuri Finkelstein (yurif2003 at yahoo dot com)

with awesome contributions from:

Woody Anderson (Woodya)
Dave Dopson (ddopson)
Ryan Phillips (rphillips)
