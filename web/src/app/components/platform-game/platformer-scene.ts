import Phaser from "phaser";
import { Player } from "./Classes/player";
import Spiker from "./Classes/spiker";
import { Fruit } from "./Classes/fruit";
import { Spikes } from "./Classes/spikes";
import { Finish } from "./Classes/finish";

export default class platformerScene extends Phaser.Scene {

    private map?: Phaser.Tilemaps.Tilemap

    private player?: Player;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private spikes?: Phaser.Physics.Arcade.StaticGroup;
    private enemy?: Phaser.Physics.Arcade.Sprite;
    private background?: Phaser.GameObjects.TileSprite;

    private fruits?: Phaser.Physics.Arcade.StaticGroup;
    private finishes?: Phaser.Physics.Arcade.StaticGroup;


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

        this.load.image('finish-not-yet', 'assets/games/platformer/Checkpoint (No Flag).png');
        this.load.spritesheet('finish-flag-out', 'assets/games/platformer/Checkpoint (Flag Out) (64x64).png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('finish-flag-idle', 'assets/games/platformer/Checkpoint (Flag Idle)(64x64).png', {frameWidth: 64, frameHeight: 64});
    };

    create() {
        this.fruits = this.physics.add.staticGroup();
        this.spikes = this.physics.add.staticGroup();
        this.finishes = this.physics.add.staticGroup();

        const map = this.make.tilemap({ key: 'mapa' });
        const tileset = map.addTilesetImage('adv_map_tiles', 'tileset');
        const tileset2 = map.addTilesetImage('Spikes', 'spikes');
        if (map && map !== null) {

        if (tileset && tileset2) {
        const layer = map.createLayer('Tile Layer 1', [tileset, tileset2], 0, 0);
        layer?.setScale(2);
        layer?.setCollisionByExclusion([-1]);

        const playerObjX = map.getObjectLayer('Player')?.objects[0].x;
        const playerObjY = map.getObjectLayer('Player')?.objects[0].y;

        const fruitObjects = map.getObjectLayer('Collectibles')?.objects;
        const spikeObjects = map.getObjectLayer('Spikes')?.objects;
        const finishObjects = map.getObjectLayer('Finish')?.objects;


        this.anims.create({
            key: 'cherry',
            frames: this.anims.generateFrameNumbers('cherry', { start: 0, end: 16 }),
            frameRate: 25,
            repeat: -1
        });

        this.anims.create({
            key: 'fruit-collect',
            frames: this.anims.generateFrameNumbers('fruit-collect', { start: 0, end: 5 }),
            frameRate: 25,
            repeat: 0
        });

        this.anims.create({
            key: 'finish-flag-out',
            frames: this.anims.generateFrameNumbers('finish-flag-out', {start: 0, end: 25}),
            frameRate: 25,
            repeat: 0
        });

        this.anims.create({
            key: 'finish-flag-idle',
            frames: this.anims.generateFrameNumbers('finish-flag-idle', {start: 0, end: 9}),
            frameRate: 25,
            repeat: -1
        });
        

        fruitObjects?.forEach(fruitObject => {
            if (fruitObject.name === 'fruit') {
                if (fruitObject.x && fruitObject.y) {
                const fruit = new Fruit(this, 2*fruitObject.x, 2*fruitObject.y, '');
                this.fruits?.add(fruit);
                fruit.setScale(2);
                }
            }
        });

        spikeObjects?.forEach(spikeObject => {
            if (spikeObject.x && spikeObject.y) {
                const spike = new Spikes(this, 2*spikeObject.x + 16, 2*spikeObject.y - 16, 'spikes');
                this.spikes?.add(spike);
                spike.setScale(2);
                spike.body?.setOffset(0, 8);
            }
        });

        finishObjects?.forEach(finishObject => {
            if (finishObject.x && finishObject.y) {
                const finish = new Finish(this, 2*finishObject.x, 2*finishObject.y, 'finish-not-yet');
                finish.setScale(2);
                this.finishes?.add(finish);
                finish.setOrigin(0, 0);
                finish.body?.setOffset(64, 64);
            }
        });




        if (playerObjX && playerObjY) {
        this.player = new Player(this, 2*playerObjX, 2*playerObjY, 'frog-idle');
        this.player.setScale(2);
        if (layer)
        this.physics.add.collider(this.player, layer);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'pink-bg');
        this.background.setOrigin(0, 0);
        this.background.setDepth(-1);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setRoundPixels(true);
        }
         
        if (this.player) {
            this.physics.add.overlap(this.player, this.fruits, (player, fruit) => {
                const fruitObject = fruit as Fruit;
                fruitObject.collect();
            });

            this.physics.add.collider(this.player, this.spikes, () => {
                // if (playerObjX && playerObjY)
                // this.player?.respawn(2*playerObjX, 2*playerObjY)

                this.player?.kill().then(() => {
                    if (playerObjX && playerObjY)
                    this.player?.respawn(2*playerObjX, 2*playerObjY)
                })
            });


            this.cursors = this.input.keyboard?.createCursorKeys();
        }};}}

    override update() {
        if (this.background) {
            this.background.tilePositionX -= 0.5;
        }

        if (this.cursors) {
            this.player?.update(this.cursors);
        }

        // console.log(this.fruits?.children.size);

        if (this.fruits?.children.size === 0) {
            this.finishes?.children.entries.forEach((finish) => {
                if (finish instanceof Finish && !finish.getCanFinish()) {
                finish.enableFinish();
                }
            })
        } 
        // this.spikerr?.updatex();
    };
}