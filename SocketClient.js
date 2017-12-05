$(function () {
    var socket = io();
                
    /*test geolocation*/
    if(navigator.gelocation){
        alert("browser supports geolocation");

        /*now confirm that geolocation is enabled by user.  If not, throw error*/
        navigator.geolocation.getCurrentPosition(function(p){
            alert("geolocation enabled");

            /*set a listener for location requests*/
            socket.on('request location', function(){
                alert("location requested");
                navigator.getCurrentPosition(function(position){
                    socket.emit('send location', {lat : position.coords.latitude, lng: position.coords.longitude, });
                }, showError(error));
            });
        }, showError(error));
            
    /*send alert if geolocation not supported by browser*/
    } else {
        alert("Geolocation is not supported by this broswer");
    }


    /*fired when form button is pressed*/
    $('form').submit(function(){
        socket.emit('message to server', $('#m').val());
        $('#m').val('');
        return false;
    });

    /*fired when client receives message from server*/
    socket.on('message to clients', function(msg){
        $('#messages').append($('<li>').text(msg));
    });

    /*fired when message is declined by server*/
    socket.on('decline message', function(msg){
        alert(msg);
    });
});


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