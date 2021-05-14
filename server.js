const http = require("http") // Load in http module
const app = require("express")() // Load in express module
const express = require("express") 

app.use('/js', express.static(__dirname + '/js'))
app.use('/assets', express.static(__dirname + '/assets'))
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"))


let PORT = process.env.PORT || 5500 
// app.listen(5500, ()=> console.log("Client Port, listening.. on 5500"))

const websocketServer = require("websocket").server
const httpServer = http.createServer(app)

// httpServer.listen(9090, () => console.log("Server Port, listening.. on 9090"))
httpServer.listen(PORT)


// Store a list of all the players
let players = []


const wsServer = new websocketServer( {
    "httpServer": httpServer
})

wsServer.on("request", request => {
    // A connection
    const connection = request.accept(null, request.origin)

    // When a player disconnects
    connection.on("close", () => {
        players.forEach( player => {
            if (player.playerId !== playerId) {
                const payLoad = {
                    "method": "disconnect",
                    "playerId": playerId
                }
            player.connection.send(JSON.stringify(payLoad))
            }
        })
        players = players.filter(player => player.playerId !== playerId)
    })

    connection.on("message", message => {
        const result = JSON.parse(message.utf8Data)

        if (result.method === "currentPlayers") {
            players.forEach (player => {
                if (player.playerId !== playerId) {
                    const payLoad = {
                        "method": "currentPlayers",
                        "playerId": player.playerId,
                        "x": player.x, 
                        "y": player.y
                    }
                    connection.send(JSON.stringify(payLoad))
                }
            })
        }

        if (result.method === "movement") {
            const playerId = result.playerId 
            const x = result.x 
            const y = result.y 
            const payLoad = {
                "currentFacing": result.currentFacing,
                "method": "updateLocation",
                "playerId": playerId,
                "x": x,
                "y": y
            }
            players.forEach(player => {
                if (player.playerId !== result.playerId) {
                    player.connection.send(JSON.stringify(payLoad))
                } else {
                    player.x = x 
                    player.y = y
                }
            })
        }
    })

    const playerId = gpid()
    const x = randomX()
    const y = randomY()

    playerInfo = {
        "connection": connection,
        "playerId": playerId,
        "x": x,
        "y": y
    }

    // The payload to be sent back to the client
    const payLoad = {
        "method": "connect",
        "playerId": playerId,
        "x": x,
        "y": y
    }

    // Send back the payload to the client and set its initial position
    connection.send(JSON.stringify(payLoad))

    // Send new player's info to all existing players
    players.forEach( player => {
        const payLoad = {
            "method": "newPlayer",
            "playerId": playerId,
            "x": x,
            "y": y
        }
        player.connection.send(JSON.stringify(payLoad))
    })

    players.push(playerInfo)

})

function gpid() {
    return Math.floor(Math.random() + 100) * Math.floor(Math.random() * 100) + Math.floor(Math.random() * 100)
}

function randomX() {
    return Math.floor(Math.random() * 700) + 35
}

function randomY() {
    return Math.floor(Math.random() * 300) + 50
}
