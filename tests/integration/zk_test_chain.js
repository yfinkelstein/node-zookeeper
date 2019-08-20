var assert = require ('assert');
var { constants, ZooKeeper: ZK } = require ("../../lib/index");

if (process.argv.length < 2)
    throw new Error ("must supply number of  sessions (optionally)");

var sessions = parseInt (process.argv[2] || 1);
var connect = (process.argv[3] || 'localhost:2181');
var sessionsFinished = 0;
//-------------------------------------------------------------------- operations begin ---------------------------------------
function createNode (context, step) {
    context.zk.a_create ("/node.js1", "some value", constants.ZOO_SEQUENCE/* | constants.ZOO_EPHEMERAL*/, function (rc, error, path) {
        console.log ("node create result: %d, path=%s, error:'%s'", rc, path, error);
        if (rc != 0) {
            throw error;
        }
        context.created_path = path;
        completedStep (context, step);
    });
};

function createChildren (context, step) {
    for (var i = 0; i < 3; i ++) {
        context.zk.a_create (context.created_path+"/"+i, "some value", constants.ZOO_EPHEMERAL, function (rc, error, path) {
            var cindex = path.charAt(path.length -1) - '0';
            console.log ("add child %d result: %d, path=%s, error:'%s'", cindex, rc, path, error);
            if (rc != 0) {
                throw error;
            }
            if (!context.children) context.children = [];
            context.children[cindex] = path;
            if (context.children.length == 3)
                completedStep (context, step);
        });
    }
    
};

function deleteChildren (context, step) {
    for (var i = 2; i >= 0; i --) {
        console.log ("deleting child %s", context.children[i]);
        context.zk.a_delete_ (context.children[i], 0, function (c, pos) { var child = c, i=pos; return function (rc, error) {
            console.log ("delete child %s result: %d, error:'%s'", child, rc, error);
            if (rc != 0) {
                throw error;
            }
            context.children.pop(i);
            console.log ("%d children left", context.children.length); 
            if (context.children.length == 0)
                completedStep (context, step);
        }}(context.children[i], i));
    }
    
};

function existsNode (context, step) {
    context.zk.a_exists (context.created_path, false, function (rc, error, stat) {
        console.log ("exists node result: %d, error: '%s', stat=%j", rc, error, stat);
        if (rc != 0) {
            throw error;
        }
        completedStep (context, step);
    });
};

function getNode (context, step) {
    context.zk.a_get (context.created_path, false, function (rc, error, stat, value) {
        console.log ("get node result: %d, error: '%s', stat=%j, value=%s", rc, error, stat, value);
        if (rc != 0) {
            throw error;
        }
        completedStep (context, step);
    });
};

function getChildren (context, step) {
    context.zk.a_get_children (context.created_path, false, function (rc, error, children) {
        console.log ("get children result: %d, error: '%s', children=%j", rc, error, children);
        if (rc != 0) {
            throw error;
        }
        completedStep (context, step);
    });
};

function getChildren2 (context, step) {
    context.zk.a_get_children2 (context.created_path, false, function (rc, error, children, stat) {
        console.log ("get children2 result: %d, error: '%s', children=%j, stat=%j", rc, error, children, stat);
        if (rc != 0) {
            throw error;
        }
        completedStep (context, step);
    });
};

function setNode (context, step) {
    context.zk.a_set (context.created_path, "some other value", 0, function (rc, error, stat) {
        console.log ("set node result: %d, error: '%s', stat=%j", rc, error, stat);
        if (rc != 0) {
            throw error;
        }
        completedStep (context, step);
    });
};

function deleteNode (context, step) {
    context.zk.a_delete_ (context.created_path, 1, function (rc, error) {
        console.log ("node delete result: %d, error: '%s'", rc, error);
        if (rc != 0) {
            throw error;
        }
        completedStep (context, step);
    });
};
//-------------------------------------------------------------------- operations  end ---------------------------------------
var callChain = [createNode, existsNode, getNode, setNode, createChildren, getNode, getChildren, getChildren2, deleteChildren, deleteNode];

function startChain (context) {
    callChain[0](context, 0);
};
function completedStep (context, step) {
 if (callChain.length == step +1) {
        console.log ("session #%d is finished", context.session);
        process.nextTick(function () {
            context.zk.close ();
        });

        if (++sessionsFinished >= sessions) {
            console.log ("all sessions are finished");
        }
 } else
    callChain[step+1](context, step+1);
}

function zkTest (session) {
    var zk = new ZK();
    console.log ("session #%d before init: state=%j", session, zk);
    assert.equal (constants.ZOO_LOG_LEVEL_WARN, 2);
    zk.init ({connect:connect, timeout:20000, debug_level:constants.ZOO_LOG_LEVEL_WARN, host_order_deterministic:false});
    console.log ("session #%d after init: zk=%j", session, zk);
    zk.on (constants.on_connected, function (zkk, clientid) {
        console.log ("zk session %d on_connected: clientid=%s", session, clientid);
        console.log ("session %d details: %j", session, zkk);
        startChain ({zk:zkk, session:session});
    });
    zk.on (constants.on_closed, function (zkk, clientid) {
        console.log ("session %d closed, clientid=%s, zkk=%j", session, clientid, zkk);
    });
};

console.log ("starting %s sessions ...", sessions);
var sa = [];
for (var i = 0; i < sessions; i++) {
    sa[i] = new zkTest (i);
}


