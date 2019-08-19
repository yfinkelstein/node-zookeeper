
/*
Shootout is played by the following rules:
- Each games has 2 players A and B that are "shooting"" at each other's gate
- Gate is a zookeeper namespace node with a known path: /shootout_<game index>_<A|B>
- Shoot is an act of creating a child node in the opponent's gate
- Defence is an act of deleting all nodes in the player's own gate
- Upon "go" command, both player engage in shooting and self-defending routines.

- This demostrates the following APIs of the zookeeper interface:
   create, get_children with a watcher, delete

- Also, each of the players uses his own ZK session

- The beauty of this implementation is that because of the async nature of both zookeeper and node.js 
 Defend () and Shoot() operations can run in parallel without blocking each other. This creates the effect of 
 concurrency although only 1 thread is actually used. Here is what you can see when you start 3 games at the 
 same time and kill it with ^C after a while:

====> Game summary:
game #0: 
    playerA made 1978 shots, defended 1958 shots
    playerB made 1960 shots, defended 1978 shots
game #1: 
    playerA made 1965 shots, defended 1962 shots
    playerB made 1962 shots, defended 1965 shots
game #2: 
    playerA made 1965 shots, defended 1966 shots
    playerB made 1966 shots, defended 1964 shots

 Also note how the looping is implemented. Recursion in node.js does not cause stack growth. It's not a tail recursion either...
*/

var promise = require("../../lib/promise");
var { constants, Promise: ZK } = require("../../lib/index");

var NGames = parseInt (process.argv[2] || 1);
var connect  = (process.argv[3] || 'localhost:2181');

var zk_config = {connect:connect, debug_level:constants.ZOO_LOG_LEVEL_WARN, timeout:20000, host_order_deterministic:false};

function Game (game_number, base_path) {
    var start_promise = promise.defer();
    function createContext (name) {
        return {
            name:game_number + "_" + name,
            ready_promise:promise.defer(),
            my_gate:"",
            other_gate:"",
            my_shots:0,
            his_shots:0
        };
    };
    var playerAContext = this.playerAContext = createContext ("A");
    var playerBContext = this.playerBContext = createContext ("B");
    
    function Player (context) {
        var zk = new ZK ().init (zk_config);
        zk.on_connected().
            then ( // create my own gate node 
                function (zkk){
                    console.log ("player %s on_connected: zk=%j", context.name, zkk);
                    return zkk.create (base_path + context.name, "target", 0/*constants.ZOO_SEQUENCE*/);
                }
            ).then ( // store the actual gate node path in the context and fire "I'm ready"
                function (actual_gate_path) {
                    console.log ("player %s created his gate at=%s", context.name, actual_gate_path);
                    context.my_gate = actual_gate_path;
                    context.ready_promise.resolve ();
                    return start_promise; 
                },
                function (error) {
                    if (error == ZK.ZNODEEXISTS) {
                        context.my_gate = base_path + context.name;
                        context.ready_promise.resolve ();
                        return start_promise; 
                    } else {
                        throw new Error (error);
                    }
                }
            ).then ( // game is on: shoot!
                function () {
                    Defend ();
                    Shoot ();
                }
            );
        
        var Shoot = function () {
            console.log ("====>player %s says: I made %d shots, he made %s shots", context.name, context.my_shots, context.his_shots);
            console.log ("player %s is about to attack", context.name);
            zk.create (context.other_gate + "/attack", "kick", constants.ZOO_SEQUENCE | constants.ZOO_EPHEMERAL).then (
                function (created_node) {
                    console.log ("player %s attacked with %s", context.name, created_node);
                    context.my_shots ++;
                    Shoot ();
                }
            )
        };
        
        var Defend = function () {
            zk.w_get_children (context.my_gate, 
                function (type, state, path) { //this is my defence watcher
                    console.log ("defense watcher triggered for player %s: type=%d, path=%s", context.name,type, path);
                    Defend ();
                }
            ).then (
                function (children) {// these are attacks against me; I have to stop them
                    if (!children || !children.length ) return;
                    var delete_promisses = [];
                    children.forEach (
                        function (child) {
                            var ch_path = context.my_gate+"/"+child;
                            console.log ("player %s is stopping attack %s", context.name, ch_path);
                            var prm = zk.delete_ (ch_path, -1);
                            delete_promisses.push (prm);
                            context.his_shots ++;
                        }
                    );
                    promise.all (delete_promisses).then (
                        function () { //all children where deleted
                            console.log ("player %s stopped %d attacks: %j", context.name, delete_promisses.length, children);
                        }
                    );
                }
            );
        };
        
    }; // end of Player
    
    var pA = Player (playerAContext);
    var pB = Player (playerBContext);
    promise.all ([playerAContext.ready_promise, playerBContext.ready_promise]).then (
        function () {
            playerAContext.other_gate = playerBContext.my_gate; 
            playerBContext.other_gate = playerAContext.my_gate;
            console.log ("------- GAME #%d is ON!--------", game_number);
            start_promise.resolve ();
        }
    );
    
};

var games = [];
do {
    games.push (new Game (games.length, "/shootout_"));
} while (games.length < NGames);
    

process.on ("SIGINT", 
    function () {
        console.log ("\n\n====> Game summary:");
        games.forEach (
            function (game, i) {
                console.log ("game #%d: ", i);
                console.log ("\tplayerA made %s shots, defended %d shots", game.playerAContext.my_shots, game.playerAContext.his_shots );
                console.log ("\tplayerB made %s shots, defended %d shots", game.playerBContext.my_shots, game.playerBContext.his_shots );
            }
        );
        process.exit (0);
    }
);
