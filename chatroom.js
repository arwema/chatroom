var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = {}; 

var fs = require("fs");
var file = "chatroom.db";
var exists = fs.existsSync(file);

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);


app.get('/', function(req, res){
  res.sendFile(__dirname + '/chatroom.html');
});


io.on('connection', function(socket){

  db.serialize(function() {
  if(!exists) {
    db.run("CREATE TABLE message (message TEXT)");
  }
  });

  socket.on("join", function(name){
        users[socket.id] = name;
        socket.emit("update", "You have connected to the server.");
        io.sockets.emit("user connected", name)
        io.sockets.emit("update-users", users);
  	//load existing messages in the DB
  	db.each("SELECT * FROM message", function(err, message) {
  		socket.emit('chat message', message.message);
  	});
    });

  socket.on("disconnect", function(){
    	console.log('user disconnected');
        io.sockets.emit("disconnect", users[socket.id]);
        delete users[socket.id];
        io.sockets.emit("update-users", users);
    });


  socket.on('chat message', function(msg){
	var current_time = new Date();
	io.emit('chat message', users[socket.id]+" said at "+ current_time+": "+msg);
	db.serialize(function() {
	var stmt = db.prepare("INSERT INTO message VALUES (?)");
    		stmt.run(msg);
		stmt.finalize();
	});


	
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
