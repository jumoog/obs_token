"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = express_1.default();
const server = require('http').createServer(app);
let io = require('socket.io')(server);
let counter = 0.0;
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(express_1.default.static(__dirname + '/build'));
const port = 8080;
let originalLog = console.log;
console.log = function () {
    var args = [].slice.call(arguments);
    originalLog.apply(console.log, [getCurrentDateString()].concat(args));
};
function getCurrentDateString() {
    return (new Date()).toISOString() + ' ::';
}
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/build/index.html');
});
app.get("/reset", (req, res) => {
    counter = 0;
    io.emit('tokens', 0);
    res.status(200).send({
        message: 'reset ok!'
    });
});
app.post("/tokens", (req, res) => {
    console.log(req.body.from_username, req.body.amount);
    io.emit('tokens', goal(req.body.amount));
    res.status(200).send({
        message: 'POST request successfulll!!!!'
    });
});
server.listen(port, function () {
    console.log(`listening on *:${port}`);
});
io.on('connection', function (client) {
    console.log('Client connected...');
    client.on('join', function (data) {
        client.emit('tokens', counter);
    });
});
function goal(data) {
    counter = counter + data;
    return counter;
}
