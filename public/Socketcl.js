var user = {};
            var usersCount, messagesList, messageBox, sendButton, socket;


            function initialize(username) {
                user.name = username;

                socket = io.connect(window.location.host);

                /*set variables listed above*/
                usersCount = 0;
                messagesList = document.getElementById("messages");
                messageBox = document.getElementById("m");
                sendButton = document.getElementById("f");

                /*setup basic function listeners*/
                socket.on('user connected', addUser);
                socket.on('user disconnected', removeUser);
                socket.on('message to clients', receiveChatMessage);
                socket.on('decline message', declineAlert);

                sendButton.submit(sendChatMessage);

                var userName = {name : user.name };

                /*confirm joining with other clients*/
                socket.emit('join', userName, function(key){
                    user.key = key;
                });

                testGeo();
            }


            function testGeo(){
                if(navigator.gelocation){
                    alert("browser supports geolocation");

                /*confirm that geolocation is enabled by user.  If not, throw error*/
                navigator.geolocation.getCurrentPosition(function(p){
                    alert("geolocation enabled");

                    /*set a listener for location requests*/
                    socket.on('request location', sendLocation);
                }, showError(error));

                /*send alert if geolocation not supported by browser*/
                } else {
                    alert("Geolocation is not supported by this broswer");
                }
            }

            function addUser (user){
                ++usersCount;
            }

            function removeUser (user){
                --usersCount;
            }

            function receiveChatMessage (data){
                messagesList.append(data.message);
            }

            function sendChatMessage(){
                sendLocation();
                socket.emit('message to server', messageBox.val());
                messageBox.val('');
            }

            function declineAlert(msg){
                alert(msg);
            }


            function sendLocation(){
                alert("1");
                if(navigator.geolocation){
                    alert("2");
                    navigator.geolocation.getCurrentPosition(function(position){
                        alert("3");
                        var data = {lat : position.coords.latitude, lng : position.coords.longitude };
                        socket.emit('send location', data);
                    }, showError(error));
                } else {
                    alert("Geolocation is not supported by this broswer");
                }
            }

            function showError(error) {
                alert("there was an error");
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        alert("User denied the request for Geolocation.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        alert("The request to get user location timed out.");
                        break;
                    case error.UNKNOWN_ERROR:
                        alert("An unknown error occurred.");
                        break;
                }
            }