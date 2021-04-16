class Scene1 extends Phaser.Scene {
    constructor() {
        super("scene_1")
    }

    init() {
    }

    preload() {
        this.load.image('bg', 'assets/background.png')
        this.load.spritesheet('character', 'assets/character.png', {frameWidth: 32, frameHeight: 48})
    }

    create() {
        this.add.image(0, 0, 'bg').setOrigin(0, 0)
        this.add.sprite(200, 200, 'character')

        this.ws = new WebSocket("ws://localhost:9090")
    }

    update() {
    }
}
