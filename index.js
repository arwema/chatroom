var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = {}; 

var fs = require("fs");
var file = "chatroom.db";
var exists = fs.existsSync(file);
var jade = require('jade');

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

app.get('/', function(req, res){
     res.render('chatroom');
});

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);

io.on('connection', function(socket){

  db.serialize(function() {
  if(!exists) {
    db.run("CREATE TABLE messages (nickname TEXT, message TEXT, time TEXT)");
  }
  });

  socket.on("join", function(name){
        users[socket.id] = name;
        socket.emit("update", "You have connected to the server.");
        io.sockets.emit("user connected", name)
        io.sockets.emit("update users", users);
  	//load existing messages from the DB
  	db.each("SELECT * FROM messages", function(err, message) {
  		socket.emit('chat message', message);
  	});
	console.log(name+" connected");
    });

  socket.on("user disconnected", function(){
    	console.log('user disconnected');
        io.sockets.emit("user disconnected", users[socket.id]);
        delete users[socket.id];
        io.sockets.emit("update users", users);
    });


  socket.on('chat message', function(msg){
	var current_time = new Date();
	current_time = current_time.toDateString();
	io.emit('chat message', {nickname:users[socket.id], time:current_time,message:msg});
	db.serialize(function() {
	var stmt = db.prepare("INSERT INTO messages VALUES (?,?,?)");
    		stmt.run(users[socket.id], msg, current_time);
		stmt.finalize();
	});
     });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
