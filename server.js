var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var websocket = io.listen(http);

var sendDistance = .00015;
var inRange = true;
var connectedUsers = {};
var connectedKeys = {};


/*html requests*/
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/chatroom.html', function(req, res){
    res.sendFile(__dirname + '/public/chatroom.html');
});

/*access CSS and Javascript folders*/
app.use(express.static(__dirname + '/CSS'));
app.use(express.static(__dirname + '/Javascript'));



/*fired when client connects to server*/
websocket.sockets.on('connection', function(socket){
    console.log('a user connected');

    /*extra setup for client connecting*/
    socket.on("compare nicknames", function(nickname, confirmJoin){
        /*for(var key in connectedUsers){
            if(connectedUsers[key].name == nickname){
                confirmJoin(false, key);
                return;
            }
        }*/

        var newKey = Date.now();
        connectedUsers[newKey] = {name: nickname, hold: false, lat: 0.0, lng: 0.0};
        connectedKeys[socket.id] = newKey;
        confirmJoin(true, newKey);

        /*now broadcast the client connecting to all other clients*/
        /*socket.broadcast.emit('user connected', nickname);*/
        console.log(nickname + " has joined");
    });


    /*fired when restablishing connection from switching pages*/
    socket.on('reconnect', function(confirmJoin){
        /*if(connectedUsers[key] && connectedUsers[key].hold){
            connectedKeys[socket.id] = key;
            var name = connectedUsers[key].name;
            confirmJoin(true, name);
            connectedUsers[key].hold = false;

            socket.broadcast.emit('user connected', name);
            console.log(name + " has rejoined");
        } else {
            confirmJoin(false);
        }*/
        console.log("reconnect attempt");

        var newKey = Date.now();
        connectedUsers[newKey] = {name: "user", hold: false};
        connectedKeys[socket.id] = newKey;
        confirmJoin(true, newKey);

        /*now broadcast the client connecting to all other clients*/
        /*socket.broadcast.emit('user connected', "user");*/
        console.log("user" + " has joined");
    });

    socket.on("hold", function(key){
        if(connectedUsers[key]){
            connectedUsers[key].hold = true;
        }
    });

    /*fired when client disconnects from server*/
    socket.on('disconnect', function(){
        var key = connectedKeys[socket.id];
        if(key){
            var user = connectedUsers[key];
            if(user){
                delete connectedKeys[socket.id];
                if(!connectedUsers[key].hold){
                    delete connectedUsers[key];
                }
                /*socket.broadcast.emit("user disconnected", key);*/
                console.log("user disconnected");
            }
        }
    });

    /*fired when server receives message from client*/
    socket.on('message to server', function(key, msg){
        /*test 1: is user listed in connectedUsers?*/
        var user = connectedUsers[key];
        if(user){
            /*test 2: is everyone within range of each other?*/
            if(inRange){
                console.log('message: ' + msg);
                var data = { key: key, sender: user.name, message: msg };
                io.emit('message to clients', data);
            } else {
                socket.emit('decline message', "sorry, but you are not close enough to recipient(s)");
            }
        } else {
            socket.emit('decline message', "sorry, but you are not connected to the group");
        }
    });

    socket.on('send location', function(key, data){
        connectedUsers[key].lat = data.lat;
        connectedUsers[key].lng = data.lng;
        console.log(connectedUsers[key].name + ": " + data.lat + ", " + data.lng);
    });


    function updateInRange(){
        var count = 0;
        var latSum = 0.0;
        var lngSum = 0.0;
        for(var key in connectedUsers){
            count++;
            latSum = latSum + connectedUsers[key].lat;
            lngSum = lngSum + connectedUsers[key].lng;
        }
        if(count == 0){
            return;
        }
        var latAvg = latSum / count;
        var lngAvg = lngSum / count;

        for(key in connectedUsers){
            if(Math.abs(latAvg - connectedUsers[key].lat) > sendDistance || Math.abs(lngAvg - connectedUsers[key].lng) > sendDistance){
                /*out of range*/
                if(inRange){
                    io.emit('out of range');
                    inRange = false;
                }
                return;
            }
        }
        /*in range*/
        if(!inRange){
            io.emit('in range');
            inRange = true;
        }
    }

    setInterval(updateInRange, 2000);
});




/*check the locations of each connected user in real time*/
/*when changes from in range to out of range, send event "out of range" to all clients*/
    /*also set boolean to false*/
/*when changes from out of range to in range, send event "in range" to all clients*/
    /*also set boolean to true*/

var port = process.env.PORT || 3000;
http.listen(port, function(){
    console.log('listening on port' + port);
});