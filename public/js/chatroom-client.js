var socket = io();

$(window).bind('beforeunload',function(){
	socket.emit('user disconnected', $('#nickname').val());
});

$('#chatroom').hide();
  $('#join-form').submit(function(){
	
    var nickname=$.trim($("#nickname").val());
	if(nickname.length == 0)
	{
		alert('Empty nickname');
    		return;
	}
    socket.emit('join', nickname);
    return ;
  });

  $('#send').submit(function(){

    var message=$.trim($("#m").val());
	if(message.length == 0)
	{
    		return;
	}

    	socket.emit('chat message', message);
    	$('#m').val('');
  });
  
  $('.disconnect').click(function(){
                socket.emit('user disconnected', $('#nickname').val());
                $('#join').show();
                $('#chatroom').hide();
                return false;
 });
  socket.on('user connected', function(nickname){
        if (nickname == $('#nickname').val()){
                $('#join').hide()
                $('#chatroom').show()
                $('#nickname').val(nickname);
        }
        else{
                $('#messages').append("<li><span class='label label-success'>"+nickname+" joined</span></li>");
        }
  });
  socket.on('update users', function(users){
	$('#users').empty();
	$.each(users, function( index, user) {
                $('#users').append("<li class='media'><div class='media-body'>"+user+"</div></li>");
	});

  });
  socket.on('user disconnected', function(nickname){
        //alert(nickname);
        if (nickname != $('#nickname').val()){
                $('#messages').append("<li><span class='label label-danger'>"+nickname+" left</span></li>");
        }

  });
  socket.on('chat message', function(msg){
	$('#messages').append("<li class='media'>"+ msg.message + "<br /> <small class='text-muted'> "+msg.nickname+"| "+msg.time+" <hr/></li>");
	$("#messages-panel").animate({ scrollTop: $("#messages-panel").prop("scrollHeight") - $('#messages-panel').height() }, 30);
  });

  socket.on('connection failure',function(msg){
	alert(msg);
 });


