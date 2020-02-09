import express from "express"
import bodyParser from "body-parser"

const app = express()
const server = require('http').createServer(app)
let io = require('socket.io')(server)
let counter: number = 0.0
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/build'))

const port = 8080 // default port to listen

let originalLog = console.log
// Overwriting
console.log = function () {
    var args = [].slice.call(arguments)
    originalLog.apply(console.log, [getCurrentDateString()].concat(args))
}
// Returns current timestamp
function getCurrentDateString() {
    return (new Date()).toISOString() + ' ::'
}

// define a route handler for the default home page
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/build/index.html')
})

app.get("/reset", (req, res) => {
    counter = 0 
    io.emit('tokens', 0)
    res.status(200).send({
        message: 'reset ok!'
    })
})

app.post("/tokens", (req, res) => {
    console.log(req.body.from_username, req.body.amount)
    io.emit('tokens', goal(req.body.amount))
    res.status(200).send({
        message: 'POST request successfulll!!!!'
    })
})

server.listen(port, function () {
    console.log(`listening on *:${port}`)
});

io.on('connection', function (client: { on: (arg0: string, arg1: { (data: any): void; (data: any): void }) => void; emit: (arg0: string, arg1: any) => void; broadcast: { emit: (arg0: string, arg1: any) => void } }) {
    console.log('Client connected...')

    client.on('join', function (data: any) {
        client.emit('tokens', counter)
    })
})

function goal(data: number) {
    counter = counter + data
    return counter
}