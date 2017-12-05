var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var inRange = true;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

/*sets up a listener for a particular event
when the event is received, the function is called*/

/*fired when client connects to server*/
io.on('connection', function(socket){
    console.log('a user connected');

    /*fired when client disconnects from server*/
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    /*fired when server receives message from client*/
    socket.on('message to server', function(msg){
        console.log('message: ' + msg);
        /*if inRange = true, then broadcast message to all clients*/
        if(inRange){
            socket.emit('request location');
            io.emit('message to clients', msg);
         }
        /*else, send decline message to sender*/
        else {
            socket.emit('decline message', "sorry, but you are not close enough to recipient(s)")
        }
    });

    socket.on('send location', function(data){
        console.log(data.lat + ", " + data.lng)});
});

/*check the locations of each connected user in real time*/
/*when changes from in range to out of range, send event "out of range" to all clients*/
    /*also set boolean to false*/
/*when changes from out of range to in range, send event "in range" to all clients*/
    /*also set boolean to true*/

http.listen(3000, function(){
    console.log('listening on *3000');
});