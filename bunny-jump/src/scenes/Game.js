import Phaser from "../lib/phaser.js";
import Carrot from "../game/Carrot.js";

export default class Game extends Phaser.Scene {

    /* Codigo de documentacion -> JSDoc */
    /** @type {Phaser.Physics.Arcade.Sprite}*/
    player
    /* El que lea esto sabra que player es parte de Phaser.Physics... */

    /** @type {Phaser.Physics.Arcade.StaticGroup}*/
    plataforms

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors

    /** @type {Phaser.Physics.Arcade.Group}*/
    carrots

    /** @type {Phaser.GameObjects.Text}*/
    carrotsCollectedText


    carrotsCollected = 0;

    constructor() {
        /* cada escena tiene una unica llave que en este caso es game */
        super("game")
    }


    //Este hook se llama antes de preload, cuando entra a esta escena
    init()
    {
        this.carrotsCollected = 0
    }

    /* Esto se ocupa para ocupar imagenes,audio y
     otros assets para cargar antes de empezar la escena */
    preload() {

        /* Cargando el background */
        this.load.image("background", 'assets/bg_layer1.png')
        /* Cargando la plataforma */
        this.load.image("plataform", 'assets/ground_grass.png')
        /* cargando al conejo */
        this.load.image("bunny-stand", 'assets/bunny1_stand.png')
        /* cargar el audio de salto */
        this.load.audio("jump", 'assets/sfx/phaseJump1.ogg')
        /* cargar el audio de comer */
        this.load.audio("comer", 'assets/sfx/bookClose.ogg')
        /* cargando los input del teclado */
        this.cursors = this.input.keyboard.createCursorKeys()
        /* cargando las zanahorias */
        this.load.image("carrot", 'assets/carrot.png')
        /* cargando al conejo saltando */
        this.load.image("bunny-jump", 'assets/bunny1_jump.png')
         /* cargar el audio de gameover */
         this.load.audio("morir", 'assets/sfx/highDown.ogg')
    }



    /* Esta funcion se llama solo cuando todos los assets se han cargado
    solo los assets cargados se pueden ocupar en create()  */
    create() {
        /* los primeros numeros son las posiciones X y Y , lo ultimo es la misma 
        llave que agregamos al bg_layer1 */
        this.add.image(240, 320, "background")
            //Con esto evitamos que el background se mueva con el scroll
            .setScrollFactor(1, 0)



        /*  
        Esto es para agregar una plataforma solamente
        this.physics.add.image(240,320,"plataform")
         //para ajustar la escala de la imagen
         .setScale(0.5) */

        //Crear un grupo
        this.plataforms = this.physics.add.staticGroup()

        //Crear 5 plataformas del grupo
        for (let i = 0; i < 5; i++) {
            //Forma de colocar las plataformas de manera aleatoria entre 2 valores
            const x = Phaser.Math.Between(80, 400)
            const y = 150 * i


            //Esto es JSDOC anotaciones, ayudan a VS Code a compilar bien el codigo
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const plataform = this.plataforms.create(x, y, "plataform")
            plataform.scale = 0.5

            /**@type {Phaser.Physics.Arcade.StaticBody} */
            const body = plataform.body
            body.updateFromGameObject()
        }

        /*
        Importa bien la imagen y funciona -> Borrar despues  
        const carrot = new Carrot(this,240,320,"carrot")
        this.add.existing(carrot) 
        */



        //Crear el sprite del Conejo
        /* (Al agregar el this le estamos dando la propiedad de clase) */
        this.player = this.physics.add.sprite(240, 320, "bunny-stand")
            .setScale(0.5)
        //ajustar la colision
        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false

        //crearemos un carrot
        this.carrots = this.physics.add.group({
            classType: Carrot
        })

        /* TEST carrot  */
        /* this.carrots.get(240, 320, "carrot") */
        //Esto tiraba un error , parece que no puede funcionar con el overlap al mismo tiempo
        /* AQUI Quede porque no me muestra el "grupo de zanahorias" , solo puedo hacer que me muestre una */

        //Agregar colision
        /* Asi se hace con 1 solo*/
        this.physics.add.collider(this.plataforms, this.player)
        this.physics.add.collider(this.plataforms, this.carrots)
        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot, //llamado en overlap
            undefined,
            this
        )

        //Agregar camara para seguir al jugador
        this.cameras.main.startFollow(this.player)
        //seteamos la dead zone de la camara
        this.cameras.main.setDeadzone(this.scale.width * 1.5)
        //sacamos el ancho con el phaser scalemanager en vez de hacerlo con px , lo * por 1.5 porque queremos que el
        //jugador pueda salir


        //TEXTO en PANTALLA
        const style = { color: "#000", fontSize: 24 }
        this.carrotsCollectedText = this.add.text(240, 10, "Carrots: 0", style)
            .setScrollFactor(0)
            .setOrigin(0.5, 0)

    }

    //Esto se actualiza una y otra vez -> fps
    update() {
        /* se entera desde Arcade Physics si las fisicas del cuerpo del jugador estan tocando algo debajo de el */
        const touchingDown = this.player.body.touching.down

        if (touchingDown) {
            // Esto hace al conejo saltar
            this.player.setVelocityY(-300)
            /* esto actua como un switch de textura */
            this.player.setTexture("bunny-jump")
            /* reproducir el sonido de salto */
            this.sound.play("jump")
        }

        const vy = this.player.body.velocity.y
        if(vy > 0 && this.player.texture.key !== "bunny-stand")
        {
            //cambia cuando el conejo esta cayendo
            this.player.setTexture("bunny-stand")
        }

        //logica de botones
        if (this.cursors.left.isDown && !touchingDown) {
            this.player.setVelocityX(-200)
        }
        else if (this.cursors.right.isDown && !touchingDown) {
            this.player.setVelocityX(200)
        }
        else {
            //parar el movimiento si no es izquierda o derecha
            this.player.setVelocityX(0)
        }

        //Un scrolling infinito de plataformas
        this.plataforms.children.iterate(child => {

            /**@type {Phaser.Physics.Arcade.Sprite} */
            const plataform = child

            const scrollY = this.cameras.main.scrollY
            if (plataform.y >= scrollY + 700) {
                plataform.y = scrollY - Phaser.Math.Between(50, 100)
                plataform.body.updateFromGameObject()

                //crea una zanahoria arriba de la plataforma siendo reusado
                this.addCarrotAbove(plataform)
            }

        })


        //HorizontalWrap
        this.horizontalWrap(this.player)

        const bottomPlataform = this.findBottomMostPlatform()
        if (this.player.y > bottomPlataform.y + 200) {
            this.sound.play("morir")
            this.scene.start("game-over")
        }


    }

    /**
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    horizontalWrap(sprite) {
        const halfWidth = sprite.displayWidth * 0.5
        const gameWidth = this.scale.width
        if (sprite.x < -halfWidth) {
            sprite.x = gameWidth + halfWidth
        }
        else if (sprite.x > gameWidth + halfWidth) {
            sprite.x = -halfWidth
        }
    }


    /** 
     * @param {Phaser.GameObject.Sprite} sprite
    */
    addCarrotAbove(sprite) {
        const y = sprite.y - sprite.displayHeight

        /**@type {Phaser.Physics.Arcade.Sprite} */
        const carrot = this.carrots.get(sprite.x, y, "carrot")

        //seteamos activo y visible
        carrot.setActive(true)
        carrot.setVisible(true)

        this.add.existing(carrot)

        //update las fisicas del tamaño del cuerpo
        carrot.body.setSize(carrot.width, carrot.height)

        //asegura que body esta habilidado en las fisicas del mundo
        this.physics.world.enable(carrot)

        return carrot
    }
    /*  handleCollectCarrot(player, carrot) {
         //Esconder del display
         this.carrots.killAndHide(carrot)
 
         //deshabilitar de las fisicas del mundo
         this.physics.world.disableBody(carrot.body)
     }
  */
    /**
    * @param {Phaser.Physics.Arcade.Sprite} player
    * @param {Carrot} carrot
    */
    handleCollectCarrot(player, carrot) {
        // hide from display
        this.carrots.killAndHide(carrot)
        this.sound.play("comer")
        // disable from physics world
        this.physics.world.disableBody(carrot.body)

        //incrementar en 1
        this.carrotsCollected++

        //crear un nuevo texto y setearlo
        const value = `Carrots: ${this.carrotsCollected}`
        /* Tuve un error aqui , es por las comillas especiales -> parece que se ocupan cuando ocupamos el $ */
        this.carrotsCollectedText.text = value


    }

    findBottomMostPlatform() {
        const plataforms = this.plataforms.getChildren()
        let bottomPlataform = plataforms[0]

        for (let i = 1; i < plataforms.length; i++) {
            const plataform = plataforms[i]

            //descartar cualquier plataforma que este arriba de la elegida
            if (plataform.y < bottomPlataform.y) {
                continue
            }

            bottomPlataform = plataform
        }
        return bottomPlataform
    }

}