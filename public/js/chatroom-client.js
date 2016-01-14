$('#chatroom').hide();
  var socket = io();
  $('#join-form').submit(function(){
    socket.emit('join', $('#nickname').val());
    return false;
  });

  $('#send').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  
  $('#leave').click(function(){
                socket.emit('disconnect', $('#nickname').val());
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
                $('#messages').append($('<li>').text(nickname+" joined"));
        }
  });
  socket.on('disconnect', function(nickname){
        //alert(nickname);
        if (nickname != $('#nickname').val()){
                $('#messages').append($('<li>').text(nickname+" joined"));
        }

  });
  socket.on('chat message', function(msg){
	$('#messages').append("<li class='media'>"+ msg.message + "<br /> <small class='text-muted'> "+msg.nickname+"| "+msg.time+" <hr/></li>");
	$("#messages-panel").animate({ scrollTop: $("#messages-panel").prop("scrollHeight") - $('#messages-panel').height() }, 300);
  });


