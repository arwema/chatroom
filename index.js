var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var chatroomModule = require('./chatroom');
var chatroomName = "fse";
var chatroom = new chatroomModule(chatroomName);


var jade = require('jade');
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.get('/', function(req, res){
     res.render('chatroom-view');
});

io.on('connection', function(socket){
  socket.on("join", function(name){
	joined = chatroom.join(name, socket.id);
	if (joined == true){
	        io.sockets.emit("user connected", name)
        	io.sockets.emit("update users", chatroom.users);
  		//load existing messages from the DB
		for (index = 0; index < chatroom.messages.length; ++index) {
  			socket.emit('chat message', chatroom.messages[index]);
		}
		

	}
	else{
        	socket.emit("connection failure", "Joining room failed. User "+name+" already logged in");
	}
    });

  socket.on("user disconnected", function(){
	name = chatroom.users[socket.id];
	if(name != null){
		chatroom.leave(socket.id);
		io.sockets.emit("user disconnected", name)
        	io.sockets.emit("update users", chatroom.users);
	}
    });


  socket.on('chat message', function(msg){
	var current_time = new Date();
	current_time = current_time.toDateString();
	chatroom.sendMessage(socket.id, msg, current_time);
	io.emit('chat message', {nickname:chatroom.users[socket.id], time:current_time,message:msg});
     });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
