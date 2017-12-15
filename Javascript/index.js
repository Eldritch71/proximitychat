var socket;
var nicknameBox;
var user = {};

window.onload = start;

function start(){
    alert("Proximity Chat requires that your browser supports geolocation services.  Make sure that geolocation is enabled on your browser before continuing.");
    nicknameBox = document.getElementById("n");
}

function testGeo(){
    if(navigator.geolocation){
        alert("browser supports geolocation");

        /*confirm that geolocation is enabled by user.  If not, throw error*/
        /*navigator.geolocation.getCurrentPosition(enterChat, showError);*/
        enterChat();
    /*send alert if geolocation not supported by browser*/
    } else {
        alert("Geolocation is not supported by this broswer");
    }
}

function enterChat(position) {
    alert("Geolocation Enabled");

    /*connect to server*/
    socket = io.connect(window.location.host);
    /*check that nickname is not already being used*/
    socket.emit("compare nicknames", nicknameBox.value, function(joined){
        if(joined){
            user.name = nicknameBox.value;
            window.location="/chatroom.html";
        } else {
            alert("someone else already has that nickname!  Choose another one.");
        }
    });
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