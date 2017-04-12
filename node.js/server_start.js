var fs = require("fs");
var cp = require("child_process");

var serverjs = "server.js";

var server = cp.fork(serverjs);
console.log("Server Script gestartet");

fs.watchFile(serverjs,function (event,filename)
{ server.kill();
  console.log("=============================================");
  console.log(new Date());
  console.log("Server beendet");
  server = cp.fork(serverjs);
  console.log("Server gestartet");
});
