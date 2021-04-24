// Create a config file for the game 

const config = {
    type: Phaser.AUTO,
    height: 374,
    width: 747,
    physics: {
        default: 'arcade',
        arcade: { 
            gravity: {y: 0} }
    },
    scene: Scene1
}

// Create a game
const game = new Phaser.Game(config)
