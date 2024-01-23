
const express = require('express');
const app = express();
const port = 8083;

app.use(express.static('web'));

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/web/index.html');
    const token = req.query.token;
    console.log(token)
});
app.get('/remote', (req, res) => {
    res.sendFile(__dirname + '/web/remote/index.html');
    const token = req.query.token;
    console.log(token)
});
const SocketServer = require("ws").Server;
const wss = new SocketServer({ server });
wss.on("connection", (ws) => {
    ws.on("message", (event) => {
        let data = JSON.parse(event)
        send(JSON.stringify(data));
    });
    ws.on("close", () => {

    });
    ws.on("error", () => {

    });
});
function send(data) {
    let clients = wss.clients;
    clients.forEach((client) => {
        let sendData = data
        client.send(sendData);//回去的資料
    });
}