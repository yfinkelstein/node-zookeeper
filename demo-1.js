require.paths.unshift('./build/default');
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
