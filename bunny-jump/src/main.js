import Phaser from "./lib/phaser.js"
import Game from "./scenes/Game.js"
import GameOver from './scenes/GameOver.js';

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 480,
    height: 640,
    /* centrar la pantalla */
    mode:Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    /* en que escena empezara el juego */
    scene: [Game,GameOver],
    /* Agregaremos las fisicas del game */
    physics:{
        /* caracteriztica de phaser */
        default:'arcade',
        arcade:{
            gravity:{
                y:200
            },
            /* Esto es el colisionador */
            debug:true
        }
    }
})