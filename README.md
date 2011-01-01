NAME
----

node-zookeeper - A Node interface to Hadoop Zookeeper based on the native C-client API for Zookeeper

SYNOPSIS
--------
  
    var ZK = require ("zookeeper").ZooKeeper;
    var zk = new ZK();
    zk.init ({connect:"localhost:2181", timeout:200000, debug_level:ZK.ZOO_LOG_LEVEL_WARNING, host_order_deterministic:false});
    zk.on (ZK.on_connected, function (zkk) {
        console.log ("zk session established, id=%s", zkk.client_id);
        zkk.a_create ("/node.js1", "some value", ZK.ZOO_SEQUENCE | ZK.ZOO_EPHEMERAL, function (rc, error, path)  {
            if (rc != 0) 
                console.log ("zk node create result: %d, error: '%s', path=%s", rc, error, path);
            else {
                console.log ("created zk node %s", path);
                process.nextTick(function () {
                    zkk.close ();
                });
            }
        });
    });

This prints the following:

    zk session established, id=12c03eda65800b8
    created zk node /node.js10000001001

See illustration of all other ZK methods in tests/zk_test_chain.js

DESCRIPTION
-----------

This is an attempt to expose Hadoop Zookeeper to node.js client applications. The bindings are implemented in C++ for V8 and depend on zk C api library.

API Reference
--------------

The following API calls closely follow ZK C API call. So, consult with ZK Reference for details.

Regular async APIs:

* init
* close
* a_create
* a_exists
* a_get
* a_get_children
* a_get_children2
* a_set
* a_delete`_` (trailing `_` is added to avoid conflict with reserved word `_delete_` since zk_promise.js strips off prefix `a_` from all operations)

APIs based on watchers (watcher is a forward-looking subscription to changes on the node in context):

* aw_exists
* aw_get
* aw_get_children
* aw_get_children2

Session state machine is well described in Zookeeper docs, i.e.
![here](http://hadoop.apache.org/zookeeper/docs/r3.3.1/images/state_dia.jpg "State Diagram")

Random notes on implementation
------------------------------

* Zookeeper C API library comes in 2 flavours: single-threaded and multi-threaded. For node.js, single-threaded library provides the most sense since all events coming from ZK responses have to be dispatched to the main JS thread.
* The C++ code uses the same logging facility that ZK C API uses internally. Hence zk_log.h file checked into this project. The file is considered ZK internal and is not installed into /usr/local/include
* Multiple simultaneous ZK connections are supported and tested 
* All ZK constants are exposed as read-only properties of the ZooKeeper function, like ZK.ZOO_EPHEMERAL
* All ZK API methods including watchers are supported.
* lib/zk_promise.js is an optional module that makes use of the very cool **node-promise** library; 
 see tests/zk_test_shootout_promise.js for illustration of how it can simplify coding. Isn't the following looking nicer?

<code>
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
            console.log ("get node: stat=%j, value=%j", stat_and_value[0], stat_and_value[1]);
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
</code>


* Also compare test/zk_test_watcher.js with test/zk_test_watcher_promise.js 
* tests/zk_master.js and tests/zk_worker.js illustrate launching multiple ZK client workers using webworker library. You have to install it first with **"npm install webworker"**


Dependencies:
------------

* zookeeper version 3.3.1 (or 3.3.2)
* zookeeper native client should be installed in your system:  
**cd $ZK_HOME/src/c && configure && make && make install**  
this puts *.h files under /usr/local/include/c-client-src/ and lib files in /usr/local/lib/libzookeeper_*  
The build process is described in details [here](http://hadoop.apache.org/zookeeper/docs/r3.3.1/zookeeperProgrammers.html#C+Binding "Build C client")
(has been tested with and without --without-syncapi)

Build
-----

- node-waf configure build
- node demo1.js
- cd tests && node zk_test_XYZ.js

- note: edit the includes/libpath if you have installed zookeeper C lib anywhere other than /usr/local/
- note: if you are building on osx and you get a compile error regarding "mmacosx-version-min", uncomment the cxxflags and ldflags for osx in the build function of wscript and try again. I am not sure why this issue arrises for some and not others (anyone with the answer please explain/fix if possible).

Limitations
-----------
* no zookeeper ACL support
* no support for authentication
* tests are not standalone, must run a zk server (easiest if you run at localhost:2181, if not you must pass the connect string to the tests)
* only asynchronous ZK methods are implemented. Hey, this is node.js ... no sync calls are allowed

BUGS & ISSUES
-------------

- The lib will segfault if you try to use a ZooKeeper intance after the on_closed event is delivered (possibly as a result of session timeout etc.) YOU MAY NOT re-use the closed ZooKeeper instance. You should allocate a new one and initialize it as a completely new client. Any and all watchers from your first instance are lost, though they may fire (before the on_close) see below.
- Any established watches may/will be fired once each when/if your client is expired by the ZK server, the input arguments are observed to be: type=-1, state=1, path="". Care should be taken to handle this differently than a "real" watch event if that matters to your application.
- Otherwise, it just works!

SEE ALSO
--------

- [http://hadoop.apache.org/zookeeper/releases.html](http://hadoop.apache.org/zookeeper/releases.html)
- [http://hadoop.apache.org/zookeeper/docs/r3.3.1/zookeeperProgrammers.html#ZooKeeper+C+client+API](http://hadoop.apache.org/zookeeper/docs/r3.3.1/zookeeperProgrammers.html#ZooKeeper+C+client+API)
- [http://github.com/kriszyp/node-promise](http://github.com/kriszyp/node-promise)
- [http://github.com/pgriess/node-webworker](http://github.com/pgriess/node-webworker)

Acknowledgments
---------------

- **[node-promise](http://github.com/kriszyp/node-promise "node-promise") by kriszyp** is a fantastic tool imho. I wish it was distributed as a module so that I could easily 'require' it rather then 
 resort to distribution by copy.  
- **[node-webworker](http://github.com/pgriess/node-webworker "node-webworker") by pgriess** is used to spawn multiple ZK workers in one of the tests. 

LICENSE
-------

See LICENSE-MIT.txt file in the top level folder.

AUTHOR
------

Yuri Finkelstein (yurif2003 at yahoo dot com)
