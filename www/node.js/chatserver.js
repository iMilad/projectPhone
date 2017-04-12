var port = 5555;

var express = require("express");
var socket = require("socket.io");
var sprintf = require("sprintf-js").sprintf;
var app = express();
var server = app.listen(port,function () { console.log("Server Port "+port+" geöffnet"); });

app.get("/",function(req,res)
{ res.sendFile(__dirname+"/Chat.html");
});



var io = socket(server);


io.on("connection",function (socket)
{ console.log("neuer Benutzer verbunden");

  socket.on("disconnect",function ()
  { console.log("Benutzer ausgeloggt");
  });

  socket.on("shout",function (message)
  { console.log("Shout "+message);
    io.emit("newMessage","Benutzer: "+message);
  });
});
