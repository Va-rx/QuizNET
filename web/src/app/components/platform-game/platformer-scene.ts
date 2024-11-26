import Phaser from "phaser";
import { Player } from "./Classes/player";
import Spiker from "./Classes/spiker";
import { Fruit } from "./Classes/fruit";
import { Spikes } from "./Classes/spikes";
import { Finish } from "./Classes/finish";

export default class platformerScene extends Phaser.Scene {


    private player?: Player;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private spikes?: Phaser.Physics.Arcade.StaticGroup;
    private enemy?: Phaser.Physics.Arcade.Sprite;
    private background?: Phaser.GameObjects.TileSprite;

    private fruits?: Phaser.Physics.Arcade.StaticGroup;
    private finishes?: Phaser.Physics.Arcade.StaticGroup;

    private currentLevel?: number;


    private enemies!: Phaser.Physics.Arcade.Group;

    private spikerr?: Spiker;

    private map?: Phaser.Tilemaps.Tilemap
    private tilesets?: Phaser.Tilemaps.Tileset[];
    private layer?: Phaser.Tilemaps.TilemapLayer;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    preload() {
        this.load.tilemapTiledJSON('map1', 'assets/games/platformer/levels/mapa-1.json');
        this.load.tilemapTiledJSON('map2', 'assets/games/platformer/levels/mapa-2.json');
        this.load.tilemapTiledJSON('map3', 'assets/games/platformer/levels/mapa-3.json');

        this.load.image('tileset', 'assets/games/platformer/tilesets/Terrain (16x16).png');
        this.load.image('spikes', 'assets/games/platformer/tilesets/Spikes.png');

        this.load.image('pink-bg', 'assets/games/platformer/backgrounds/Pink.png');
        this.load.image('brown-bg', 'assets/games/platformer/backgrounds/Brown.png');
        this.load.image('gray-bg', 'assets/games/platformer/backgrounds/Gray.png');
        this.load.image('green-bg', 'assets/games/platformer/backgrounds/Green.png');
        this.load.image('blue-bg', 'assets/games/platformer/backgrounds/Blue.png');
        this.load.image('purple-bg', 'assets/games/platformer/backgrounds/Purple.png');
        this.load.image('yellow-bg', 'assets/games/platformer/backgrounds/Yellow.png');

        this.load.spritesheet('appear', 'assets/games/platformer/characters/basics/Appearing.png', {frameWidth: 96, frameHeight: 96});
        this.load.spritesheet('disappear', 'assets/games/platformer/characters/basics/Disappearing.png', {frameWidth: 96, frameHeight: 96});

        this.load.spritesheet('frog-idle', 'assets/games/platformer/characters/frog/Idle.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('frog-move', 'assets/games/platformer/characters/frog/Run.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('frog-jump', 'assets/games/platformer/characters/frog/Jump.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('frog-jump-midair', 'assets/games/platformer/characters/frog/Double Jump.png', {frameWidth: 32, frameHeight: 32});

        this.load.spritesheet('cherry', 'assets/games/platformer/fruits/Cherries.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('fruit-collect', 'assets/games/platformer/fruits/Collected.png', {frameWidth: 32, frameHeight: 32});


        // this.load.image('spiker-idle', 'assets/games/platformer/spiker/Idle.png');
        // this.load.spritesheet('spiker-blink', 'assets/games/platformer/spiker/Blink (54x52).png', {frameWidth: 54, frameHeight: 52});

        this.load.image('finish-not-yet', 'assets/games/platformer/finishes/Finish (No Flag).png');
        this.load.spritesheet('finish-flag-out', 'assets/games/platformer/finishes/Finish (Flag Out).png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('finish-flag-idle', 'assets/games/platformer/finishes/Finish (Flag Idle).png', {frameWidth: 64, frameHeight: 64});
    }

    create() {
        this.createAnimations();

        this.currentLevel = 1;
        this.loadLevel(this.currentLevel);
    }

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
    }

    loadLevel(level: number) {
        this.map = this.make.tilemap({ key: `map${level}` });
        const tileset1 = this.map.addTilesetImage('adv_map_tiles', 'tileset');
        const tileset2 = this.map.addTilesetImage('Spikes', 'spikes');
        if (tileset1 && tileset2) {
            this.tilesets = [tileset1, tileset2];
        } else {
            console.error('Loading tilesets error');
            return;
        }

        this.layer = this.map.createLayer('Tile Layer 1', this.tilesets, 0, 0)!;
        this.layer.setScale(2);
        this.layer.setCollisionByExclusion([-1]);

        this.fruits = this.physics.add.staticGroup();
        this.spikes = this.physics.add.staticGroup();
        this.finishes = this.physics.add.staticGroup();

        const playerStartingPosX = this.map.getObjectLayer('Player')?.objects[0].x;
        const playerStartingPosY = this.map.getObjectLayer('Player')?.objects[0].y;

        const fruitObjects = this.map.getObjectLayer('Collectibles')?.objects;
        const spikeObjects = this.map.getObjectLayer('Spikes')?.objects;
        const finishObjects = this.map.getObjectLayer('Finish')?.objects;

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

        if (playerStartingPosX && playerStartingPosY) {
            this.player = new Player(this, 2*playerStartingPosX, 2*playerStartingPosY, 'frog-idle');
            this.player.setScale(2);

            this.physics.add.collider(this.player, this.layer);
    
            this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
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
                this.player?.kill().then(() => {
                    if (playerStartingPosX && playerStartingPosY)
                    this.player?.respawn(2*playerStartingPosX, 2*playerStartingPosY)
                })
            });

            this.physics.add.overlap(this.player, this.finishes, (player, finish) => {
                this.map?.destroy();
                this.player?.destroy();
                this.layer?.destroy();
                this.fruits?.clear();
                this.finishes?.clear();
                this.spikes?.clear();
                let allSprites = this.children.list.filter(x => x instanceof Phaser.GameObjects.Sprite);
                allSprites.forEach(x => x.destroy());
                this.nextLevel();
            });

            this.cursors = this.input.keyboard?.createCursorKeys();
        }
    }

    nextLevel() {
        if (this.currentLevel) {
            this.loadLevel(this.currentLevel+1);
        } else {
            this.loadLevel(1);
        }
    }

    createAnimations() {
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
    }
}
