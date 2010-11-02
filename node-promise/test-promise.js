sys = require("sys");
var fs = require('./fs-promise');

// open a file and read it
fs.open("fs-promise.js", process.O_RDONLY).then(function(fd){
  return fs.read(fd, 4096);
}).then(function(args){
  sys.puts(args[0]);
});

// does the same thing
fs.readFile("fs-promise.js").addCallback(sys.puts);