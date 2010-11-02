NAME
----

node-zookeeper - A Node interface to Hadoop Zookeeper based on the native C-client API for Zookeeper

SYNOPSIS
--------
  var ZK = require ("node_zookeeper").ZooKeeper;
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

DESCRIPTION
-----------

This is an attempt to expose Hadoop Zookeeper to node.js client applications. The bindings are implemented in C++ for V8 and depend on zk C api library.

Random notes on implementation
------------------------------

* Zookeeper C API library comes in 2 flavours: single-threaded and multi-threaded. For node.js, single-threaded library provides the most sense since all events coming from ZK responses have to be dispatched to the main JS thread.
* The C++ code uses the same logging facility that ZK C API uses internally. Hence zk_log.h file checked in to this project. The file is considered ZK internal and is not installed into /usr/local/include
* Multiple simultaneous ZK connections are supported and tested 
* All ZK constants are exposed as read-only properties of the ZooKeeper function, like ZK.ZOO_EPHEMERAL
* Watchers are also supported.
 


Installation
------------

Dependencies:
* zookeeper version 3.3.1
* zookeeper native client shoud be installed in your system:
	(cd $ZK_HOME/src/c && configure && make && make install)
	this puts *.h files under /usr/local/include/c-client-src/ and lib files in /usr/local/lib/libzookeeper_*)

Build
-----
	
- node-waf configure build
- node demo1.js


Limitations
-----------
* no zookeeper ACL support
* no support for authentication


BUGS
----

This is the first version of the client. It works for me 


SEE ALSO
--------

- http://hadoop.apache.org/zookeeper/releases.html
- http://hadoop.apache.org/zookeeper/docs/r3.3.1/zookeeperProgrammers.html#ZooKeeper+C+client+API

AUTHOR
------

Yuri Finkelstein (yurif2003 at yahoo dot com)
