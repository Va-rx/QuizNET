import Phaser from "phaser";
import { Player } from "./Classes/player";
import Spiker from "./Classes/spiker";
import { Fruit } from "./Classes/fruit";

export default class platformerScene extends Phaser.Scene {

    private player?: Player;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private spikes?: Phaser.Physics.Arcade.StaticGroup;
    private enemy?: Phaser.Physics.Arcade.Sprite;
    private background?: Phaser.GameObjects.TileSprite;

    private fruits?: Phaser.Physics.Arcade.StaticGroup;


    private enemies!: Phaser.Physics.Arcade.Group;

    private spikerr?: Spiker;

    private playerAttackHitboxes?: Phaser.Physics.Arcade.StaticGroup;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    preload() {
        this.load.tilemapTiledJSON('mapa', 'assets/games/platformer/mapa7.json');
        this.load.image('tileset', 'assets/games/platformer/Terrain (16x16).png');
        this.load.image('spikes', 'assets/games/platformer/Spikes.png');
        this.load.spritesheet('fruit-collect', 'assets/games/platformer/Collected.png', {frameWidth: 32, frameHeight: 32});


        this.load.spritesheet('dude', 'assets/games/firstgame/assets/dude.png', {frameWidth: 32, frameHeight: 48});
        this.load.image('star', 'assets/games/firstgame/assets/star.png');
        this.load.image('sky', 'assets/games/firstgame/assets/sky.png');
        this.load.image('ground', 'assets/games/firstgame/assets/platform.png');

        this.load.spritesheet('frog-idle', 'assets/games/platformer/Idle (32x32).png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('frog-move', 'assets/games/platformer/Run (32x32).png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('frog-jump', 'assets/games/platformer/Jump (32x32).png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('frog-jump-midair', 'assets/games/platformer/Double Jump (32x32).png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('appear', 'assets/games/platformer/Appearing (96x96).png', {frameWidth: 96, frameHeight: 96});
        this.load.spritesheet('disappear', 'assets/games/platformer/Disappearing (96x96).png', {frameWidth: 96, frameHeight: 96});

        this.load.spritesheet('cherry', 'assets/games/platformer/Cherries.png', {frameWidth: 32, frameHeight: 32});

        this.load.image('spiker-idle', 'assets/games/platformer/spiker/Idle.png');
        this.load.spritesheet('spiker-blink', 'assets/games/platformer/spiker/Blink (54x52).png', {frameWidth: 54, frameHeight: 52});



        this.load.image('pink-bg', 'assets/games/platformer/Pink.png');

        
    };

    create() {
        this.fruits = this.physics.add.staticGroup();

        const map = this.make.tilemap({ key: 'mapa' });
        const tileset = map.addTilesetImage('adv_map_tiles', 'tileset');
        const tileset2 = map.addTilesetImage('Spikes', 'spikes');
        if (map && map !== null) {
        // const spikeObjects = map.getObjectLayer('Spikes').objects;}
        


        if (tileset && tileset2) {
        const layer = map.createLayer('Tile Layer 1', [tileset, tileset2], 0, 0);
        layer?.setScale(2);
        layer?.setCollisionByExclusion([-1]);

        const playerObjX = map.getObjectLayer('Player')?.objects[0].x;
        const playerObjY = map.getObjectLayer('Player')?.objects[0].y;

        const fruitObjects = map.getObjectLayer('Collectibles')?.objects;

        fruitObjects?.forEach(fruitObject => {
            if (fruitObject.name === 'fruit') {
                if (fruitObject.x && fruitObject.y) {
                const fruit = new Fruit(this, 2*fruitObject.x, 2*fruitObject.y, '');
                this.fruits?.add(fruit);
                fruit.setScale(2);
                }
            }
        })


        console.log(playerObjX, playerObjY);

        // console.log(playerObj);
        if (playerObjX && playerObjY) {
        this.player = new Player(this, 2*playerObjX, 2*playerObjY, 'frog-idle');
        // this.player = new Player(this, 100, 450, 'frog-idle');
        this.player.setScale(2);
        if (layer)
        this.physics.add.collider(this.player, layer);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'pink-bg');
        this.background.setOrigin(0, 0);
        this.background.setDepth(-1);
        this.cameras.main.startFollow(this.player);
        // this.background.setTint(0xFF00FF);
        this.cameras.main.setRoundPixels(true);

        // const spikeObjects = map.objects["Spikes"][0];
        // let spikes = this.physics.add.group();


        // spikeObjects.forEach(spikeObject => {
        //     const spike = spikes.create(spikeObject.x, spikeObject.y, 'spikeTexture');
        // })
        }
        // Włącz animację przesuwania tła
        } // Przesuwanie w poziomie}
        // this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // this.cameras.main.backgroundColor.setTo(0, 0, 0, 255);

        // const tileset = map.addTilesetImage('adv_map_tiles', 'tileset');
    
        // if (tileset) {
        // const layer = map.createLayer('Tile Layer 1', tileset, 0, 0);
    
        // layer?.setCollisionByExclusion([-1]); 
        // }
        // this.add.image(400, 300, 'sky');

        //this.platforms = this.physics.add.staticGroup();
        //this.spikes = this.physics.add.staticGroup();

        // this.enemies = this.physics.add.group();

        // this.spikerr = new Spiker(this, 100, 100, 'spiker-idle', this.platforms);
        // this.spikerr.setScale(2);

        // this.enemies.add(this.spikerr);

        //const ground = this.platforms.create(400, 568, 'ground') as Phaser.Physics.Arcade.Sprite;
        // const spike = this.spikes.create(400, 520, 'spikes') as Phaser.Physics.Arcade.Sprite;

        // spike
        // .setScale(2).refreshBody();
        // // spike.setSize(48, 20);
        // // spike.setOffset(0, 30);
        // spike.setSize(32, 16);
        // spike.setOffset(0, 16);
        // // spike.setOffset(0, 12);

        // this.spikes.create(433, 520, 'spikes');




        // ground
        //     .setScale(2)
        //     .refreshBody();

        // this.platforms.create(600, 400, 'ground');
        // this.platforms.create(50, 250, 'ground');
        // this.platforms.create(750, 220, 'ground');

        // // this.enemy = new Enemy(this, 300, 450, 'dude');

        // this.physics.add.collider(this.spikerr, this.platforms);
        // this.physics.add.collider(this.player, this.platforms);

        // this.physics.add.collider(this.player, this.enemies);
        // this.physics.add.collider(this.enemies, this.platforms);

        // this.physics.add.collider(this.player?, spikeObjects, async () => {
        //     await this.player?.kill();
        //     this.player?.respawn(100, 450);
        // });
        if (this.player) {
            this.physics.add.overlap(this.player, this.fruits, (player, fruit) => {
                const fruitObject = fruit as Fruit;
                fruitObject.collect();
            });
        }

        // if (this.player) {
        // this.physics.add.collider(this.player, this.fruits, async () => {
        //     await this.player?.kill();
        //     this.player?.respawn(100, 450);
        // });}


        this.cursors = this.input.keyboard?.createCursorKeys();
    };}

    override update() {
        if (this.background) {
            this.background.tilePositionX -= 0.5;
        }

        if (this.cursors) {
            this.player?.update(this.cursors);
        }
        // this.spikerr?.updatex();
    };

    private collectFruit(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, fruit: Phaser.Physics.Arcade.Sprite) {
        fruit.disableBody(true, true);
    }
}