
var chatroom = function (chatroom){  
   var self = this;
   self.users = {};
   self.messages = [];
 
   var sqlite3 = require("sqlite3").verbose();
   var dbName = chatroom+".db";
   var db = new sqlite3.Database(dbName);
   var _ = require('underscore-node');

   var fs = require("fs");
   var exists = fs.existsSync(dbName);
   db.serialize(function() {
    		db.run("CREATE TABLE IF NOT EXISTS messages (nickname TEXT, message TEXT, time TEXT)");
   });

   self.db=db;

   //load messages from the DB
   db.all("SELECT * FROM messages", function(err, records) {
		if(err){
			console.log(err);
		}
		self.messages = records;
		console.log(self.messages);
        });

   self.join= function (name, id){
	connected = (_.invert(self.users))[name];
	if(connected != undefined) return false;
	self.users[id] = name;
	return true;
   };

   self.leave= function (id){
	delete self.users[id];
   }

   self.getUsers = function(){

	return self.users;
   }

   self.sendMessage = function(userid, message_content, message_time){
	self.messages.push({message:message_content,nickname:self.users[userid],time:message_time})
	db.serialize(function() {
        var stmt = db.prepare("INSERT INTO messages VALUES (?,?,?)");
                stmt.run(self.users[userid], message_content, message_time);
                stmt.finalize();
        });
   }
};

module.exports = chatroom;
