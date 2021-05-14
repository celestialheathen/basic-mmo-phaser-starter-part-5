class Scene1 extends Phaser.Scene {
    constructor() {
        super("scene_1")
    }

    init() {
        this.playerId = null 
        this.x = null
        this.y = null 
        let HOST = location.origin.replace(/^http/, 'ws')
        this.ws = new WebSocket(HOST)
        this.ws.onmessage = (message) => {
            const response = JSON.parse(message.data)

            if (response.method === "connect") {
                this.playerId = response.playerId
                this.x = response.x 
                this.y = response.y
                console.log("Player id set successfully " + this.playerId)
                console.log("Player x " + this.x)
                console.log("Player y " + this.y)
            }
        }
    }

    preload() {
        this.load.image('bg', 'assets/background.png')
        this.load.spritesheet('character', 'assets/character.png', {frameWidth: 32, frameHeight: 48})
    }

    create() {
        this.playerFacing = {
            'left': 'LEFT',
            'right': 'RIGHT',
            'up': 'UP',
            'down': 'DOWN'
        }

        this.currentFacing = this.playerFacing.down

        this.add.image(0, 0, 'bg').setOrigin(0, 0)

        this.anims.create({key: 'idle', frames: this.anims.generateFrameNames('character', {start: 0, end: 0})})
        this.anims.create({key: 'down', frames: this.anims.generateFrameNames('character', {start: 0, end: 3})})
        this.anims.create({key: 'left', frames: this.anims.generateFrameNames('character', {start: 4, end: 7})})
        this.anims.create({key: 'right', frames: this.anims.generateFrameNames('character', {start: 8, end: 11})})
        this.anims.create({key: 'up', frames: this.anims.generateFrameNames('character', {start: 12, end: 15})})

        this.createPlayer()
        this.physics.add.existing(this.player)

        this.otherPlayers = this.physics.add.group()

        const payLoad = {
            "method": "currentPlayers"
        }
        this.ws.send(JSON.stringify(payLoad))
        this.ws.onmessage = (message) => {
            const response = JSON.parse(message.data)

            if (response.method === "currentPlayers") {
                const playerId = response.playerId 
                const x = response.x 
                const y = response.y 
                this.addOtherPlayers({x: x, y: y, playerId: playerId})
            }

            if (response.method === "newPlayer") {
                this.addOtherPlayers({x: response.x, y: response.y, playerId: response.playerId})
            }

            if (response.method === "disconnect") {
                this.removePlayer(response.playerId)
            }

            if (response.method === "updateLocation") {
                this.updateLocation({x: response.x, y: response.y, playerId: response.playerId, currentFacing: response.currentFacing})
            }
        }

        this.cursors = this.input.keyboard.createCursorKeys()
    }

    update() {
        if (this.cursors.right.isDown) {
            this.player.anims.play('right', true)
            this.player.body.setVelocityX(300)
            this.currentFacing = this.playerFacing.right
            const payLoad = {
                'method': 'movement',
                'playerId': this.playerId,
                'x': this.player.x,
                'y': this.player.y,
                'currentFacing': this.currentFacing
            }
            this.ws.send(JSON.stringify(payLoad))
        }
        else if (this.cursors.left.isDown) {
            this.player.anims.play('left', true)
            this.player.body.setVelocityX(-300)
            this.currentFacing = this.playerFacing.left
            const payLoad = {
                'method': 'movement',
                'playerId': this.playerId,
                'x': this.player.x,
                'y': this.player.y,
                'currentFacing': this.currentFacing
            }
            this.ws.send(JSON.stringify(payLoad))
        }
        else if (this.cursors.up.isDown) {
            this.player.anims.play('up', true)
            this.player.body.setVelocityY(-300)
            this.currentFacing = this.playerFacing.up
            const payLoad = {
                'method': 'movement',
                'playerId': this.playerId,
                'x': this.player.x,
                'y': this.player.y,
                'currentFacing': this.currentFacing
            }
            this.ws.send(JSON.stringify(payLoad))
        }
        else if (this.cursors.down.isDown) {
            this.player.anims.play('down', true)
            this.player.body.setVelocityY(300)
            this.currentFacing = this.playerFacing.down
            const payLoad = {
                'method': 'movement',
                'playerId': this.playerId,
                'x': this.player.x,
                'y': this.player.y,
                'currentFacing': this.currentFacing
            }
            this.ws.send(JSON.stringify(payLoad))
        }
        else {
            this.player.body.setVelocity(0)
        }
    }

    createPlayer() {
        this.player = this.add.sprite(this.x, this.y, 'character')
    }

    addOtherPlayers(playerInfo) {
        const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, "character")
        otherPlayer.setTint(Math.random() * 0xffffff)
        otherPlayer.playerId = playerInfo.playerId 
        this.otherPlayers.add(otherPlayer)
    }

    removePlayer(playerId) {
        this.otherPlayers.getChildren().forEach(player => {
            if (player.playerId === playerId) {
                player.destroy()
            }
        })
    }

    updateLocation(playerInfo) {
        this.otherPlayers.getChildren().forEach(player => {
            if (player.playerId === playerInfo.playerId) {

                switch (playerInfo.currentFacing) {
                    case 'LEFT':
                        player.anims.play('left', true)
                        player.setPosition(playerInfo.x, playerInfo.y)
                        break;
                    case 'RIGHT':
                        player.anims.play('right', true)
                        player.setPosition(playerInfo.x, playerInfo.y)
                        break;
                    case 'UP':
                        player.anims.play('up', true)
                        player.setPosition(playerInfo.x, playerInfo.y)
                        break;
                    case 'DOWN':
                        player.anims.play('down', true)
                        player.setPosition(playerInfo.x, playerInfo.y)
                        break;
                }
            }
        })
    }
}
