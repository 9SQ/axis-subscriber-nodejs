const WebSocketClient = require('websocket').client;
const client = new WebSocketClient();
const token = process.env.TOKEN;

const headers = {
    "Authorization": "Bearer " + token
};

var retrySec = 100;
var retryCount = 0;
const retryMax = 10;

client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
    retryConnection();
});

client.on('connect', function (connection) {
    console.log('Subscriber Connected to AXIS');

    connection.on('error', function (error) {
        console.log("Connection Error: " + error.toString());
    });

    connection.on('close', function () {
        console.log('Connection Closed');
        retryConnection();
    });

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            if (message.utf8Data === "hello") {
                retrySec = 100;
                retryCount = 0;
                console.log("-----");
            } else {
                // do something...
                console.log(message.utf8Data + "\n-----");
            }
        }
    });

    function heartbeat() {
        if (connection.connected) {
            connection.sendUTF(''.toString());
            setTimeout(heartbeat, 30000);
        }
    }
    heartbeat();

});

function retryConnection() {
    retrySec = retrySec * 2;
    if (retryCount < retryMax) {
        retryCount++;
        console.log('Retry: ' + retryCount + " (delay " + retrySec + "ms)");
        setTimeout(socketConnect, retrySec);
    }
    else {
        process.exit();
    }
}

function socketConnect() {
    client.connect('wss://ws.axis.prioris.jp/socket', null, null, headers);
}

socketConnect();
