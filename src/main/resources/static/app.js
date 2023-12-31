const stompClient = new StompJs.Client({
    brokerURL: "ws://localhost:8080/websocket"
});

const colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

let username = null;

stompClient.onConnect = (frame) => {
    setConnected(true);
    console.log("Connected: " + frame);
    // subscribe to the public topic
    stompClient.subscribe("/topic/public", onMessageReceive);
    // tell added username to the server
    stompClient.publish({
        destination: "/app/addUser",
        body: JSON.stringify({"sender": username, "messageType": "JOIN"})
    });
    $("#status").text("Connected");
};

function connect() {
    username = $("#username").val().trim();
    if(username) {
        stompClient.activate();
    }
}

function disconnect() {
    stompClient.deactivate();
    setConnected(false);
    console.log("Disconnected");
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

stompClient.onWebSocketError = (frame) => {
    console.error("Error with websocket", frame);
    let status = $("#status");
    status.text("Could not connect to the websocket server, pls refresh this page and try again.");
    status.css("color", "red");
};

stompClient.onStompError = (frame) => {
    console.error("Broker reported error: " + frame.headers["message"]);
    console.error("Additional details: " + frame.body);
}

function onMessageReceive(payload) {
    let message = JSON.parse(payload.body);

    let messageElement = document.createElement("li");

    if(message.messageType === "JOIN") {
        messageElement.classList.add("event-message");
        message.content = message.sender + " has joined the chat!";
    } else if(message.messageType === "LEAVE") {
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
    if(messageContent) {
        let chatMessage = {
            sender: username,
            content: messageContent,
            messageType: "CHAT"
        };
        stompClient.publish({
            destination: "/app/sendMessage",
            body: JSON.stringify(chatMessage)
        });
        message.val("");
    }
}

$(function () {
    $("form").on("submit", (e) => e.preventDefault());
    $("#connect").click(() => connect());
    $("#disconnect").click(() => disconnect());
    $("#send").click(() => sendMessage());
});


