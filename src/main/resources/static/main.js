let stompClient = null;
let username = null;
let status = $("#status");

const websocketURL = "http://localhost:8080/websocket";

const colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect() {
    username = $("#username").val().trim();
    if(username) {
        let socket = new SockJS(websocketURL);
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnect, onError);
    }
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function onConnect(frame) {
    setConnected(true);
    console.log("Connected: " + frame);
    // subscribe to the public topic
    stompClient.subscribe("/topic/public", onMessageReceive);
    // tell username to the server
    stompClient.send("/app/addUser", {}, JSON.stringify({sender: username, type: "JOIN"}));
    status.text("Connected");
}

function setConnected(connected) {
    if(connected) {
        $("#username-page").addClass("d-none");
        $("#chat-page").removeClass("d-none");
    } else {
        $("#chat-page").addClass("d-none");
        $("#username-page").removeClass("d-none");
    }
    $("#message-area").html("");
}

function onError(error) {
    console.log(error);
    status.text("Could not connect to the websocket server, pls refresh this page and try again.");
    status.css("color", "red");
}

function onMessageReceive(payload) {
    let message = JSON.parse(payload.body);

    let messageElement = document.createElement("li");

    if(message.type === "JOIN") {
        messageElement.classList.add("event-message");
        message.content = message.sender + " has joined the chat!";
    } else if(message.type === "LEAVE") {
        messageElement.classList.add("event-message");
        message.content = message.sender + " has left the chat!";
    } else {
        messageElement.classList.add("chat-message");

        let avatarElement = document.createElement('i');
        let avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style["background-color"] = getAvatarColor(message.sender);
        messageElement.appendChild(avatarElement);

        let usernameElement = document.createElement("span");
        let usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    let textElement = document.createElement('p');
    let messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);

    let messageArea = $("#message-area");
    messageArea.append(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function getAvatarColor(messageSender) {
    let hash = 0;
    for (let i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    let index = Math.abs(hash % colors.length);
    return colors[index];
}

function sendMessage() {
    let message = $("#message");
    let messageContent = message.val().trim();
    if(messageContent && stompClient) {
        let chatMessage = {
            sender: username,
            content: messageContent,
            messageType: 'CHAT'
        };
        stompClient.send('/app/sendMessage', {}, JSON.stringify(chatMessage));
        message.val("");
    }
}

$(function () {
    $("form").on("submit", (e) => e.preventDefault());
    $("#connect").click(() => connect());
    $("#disconnect").click(() => disconnect());
    $("#send").click(() => sendMessage());
});


