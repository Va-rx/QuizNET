import Phaser from "phaser";
import { Player } from "./Classes/player/player";
import { Fruit } from "./Classes/fruit/fruit";
import { Spikes } from "./Classes/obstacles/spikes";
import { Finish } from "./Classes/finish/finish";
import { Saw } from "./Classes/obstacles/saw";
import { Platform } from "./Classes/obstacles/platform"
import { PlayerClass } from "./Classes/player/playerClass";
import { AssetLoader } from "./Classes/assetLoader";
import { AnimationManager } from "./Classes/animationManager";

export default class platformerScene extends Phaser.Scene {

    private map?: Phaser.Tilemaps.Tilemap
    private tilesets?: Phaser.Tilemaps.Tileset[];
    private layer?: Phaser.Tilemaps.TilemapLayer;

    private chc!: string;

    private background?: Phaser.GameObjects.TileSprite;

    private player?: Player;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    private fruits?: Phaser.Physics.Arcade.StaticGroup;
    private spikes?: Phaser.Physics.Arcade.StaticGroup;
    private saws?: Phaser.Physics.Arcade.StaticGroup;
    private platforms?: Phaser.Physics.Arcade.Group;
    private finishes?: Phaser.Physics.Arcade.StaticGroup;

    private currentLevel?: number;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    preload() {
        const assetLoader = new AssetLoader(this);
        assetLoader.loadAllAssets();
    }

    create() {
        const animationManager = new AnimationManager(this);
        animationManager.createAllAnimations();

        // const classes = Object.values(PlayerClass);
        // const randomIndex = Math.floor(Math.random() * classes.length);
        // this.chc = classes[randomIndex];

        this.currentLevel = 2;
        this.loadLevel(this.currentLevel);
    }

    override update() {
        if (this.background) {
            this.background.tilePositionX += 0.2;
        }

        if (this.player && this.cursors) {
            this.player.update(this.cursors);
        }

        if (this.fruits?.children.size === 0) {
            this.finishes?.children.entries.forEach((finish) => {
                if (finish instanceof Finish && !finish.getCanFinish()) {
                finish.enableFinish();
                }
            })
        } 
    }

    loadLevel(level: number) {
        this.currentLevel = level;

        const classes = Object.values(PlayerClass);
        const randomIndex = Math.floor(Math.random() * classes.length);
        const character = classes[randomIndex];

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
        console.log(this.layer.layer.properties);

        this.fruits = this.physics.add.staticGroup();
        this.spikes = this.physics.add.staticGroup();
        this.finishes = this.physics.add.staticGroup();
        this.saws = this.physics.add.staticGroup();
        this.platforms = this.physics.add.group({
            immovable: true,
            allowGravity: false,
            bounceY: 100,
        });

        const playerStartingPosX = this.map.getObjectLayer('Player')?.objects[0].x;
        const playerStartingPosY = this.map.getObjectLayer('Player')?.objects[0].y;

        const fruitObjects = this.map.getObjectLayer('Collectibles')?.objects;
        const spikeObjects = this.map.getObjectLayer('Spikes')?.objects;
        const finishObjects = this.map.getObjectLayer('Finish')?.objects;
        const sawObjects = this.map.getObjectLayer('Saws')?.objects;
        const platformObjects = this.map.getObjectLayer('Platforms')?.objects;


        fruitObjects?.forEach(fruitObject => {
            if (fruitObject.x && fruitObject.y) {
                const fruit = new Fruit(this, 2*fruitObject.x, 2*fruitObject.y, fruitObject.name);
                
                // const glowCircle = this.add.graphics();
                // glowCircle.fillStyle(0xFFD700, 0.3);
                // glowCircle.fillCircle(fruit.x, fruit.y, 32);

                this.fruits?.add(fruit);
                fruit.setScale(2);
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

        sawObjects?.forEach(sawObject => {
            if (sawObject.x && sawObject.y) {
                const saw = new Saw(this, 2*sawObject.x, 2*sawObject.y, '');
                saw.setScale(2);
                saw.setOrigin(0, 1);
                saw.setDepth(-1);
                this.saws?.add(saw);
            }
        });

        platformObjects?.forEach(platformObject => {
            if (platformObject.x && platformObject.y) {
                const platform = new Platform(this, 2*platformObject.x, 2*platformObject.y, 'platform-off');
                platform.setScale(2);
                platform.setOrigin(0, 1);
                this.platforms?.add(platform);
            }
        });

        if (playerStartingPosX && playerStartingPosY) {
            this.player = new Player(this, 2*playerStartingPosX, 2*playerStartingPosY, character);
            this.player.setScale(2);

            this.physics.add.collider(this.player, this.layer);
            this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

            const properties = this.layer.layer.properties as { name: string; value: any }[];
            const background = properties.find(prop => prop.name === 'background')?.value;
            if (background) {
                this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, `${background}-bg`);
            } else {
                this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'green-bg');

            }
            this.background.setOrigin(0, 0);
            this.background.setDepth(-2);
            this.background.setScale(2.5);
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setRoundPixels(true);
        }

        if (this.player) {
            this.physics.add.overlap(this.player, this.fruits, (player, fruit) => {
                const fruitObject = fruit as Fruit;
                fruitObject.collect();
            });

            this.physics.add.overlap(this.player, this.saws, (player, saw) => {
                this.player?.kill().then(() => {
                    if (playerStartingPosX && playerStartingPosY) {
                    this.platforms?.clear(true, true);
                    this.player?.respawn(2*playerStartingPosX, 2*playerStartingPosY);
                    this.renegeratePlatforms();}
                })
            });

            this.physics.add.collider(this.player, this.spikes, () => {
                this.player?.kill().then(() => {
                    if (playerStartingPosX && playerStartingPosY) {
                    this.platforms?.clear(true, true);
                    this.player?.respawn(2*playerStartingPosX, 2*playerStartingPosY)}
                    this.renegeratePlatforms();
                })
            });

            if (this.platforms)
            this.physics.add.collider(this.player, this.platforms, (player, platform) => {
                const platformObject = platform as Platform;
                const player2 = player as Player;
                if (player2 && player2.body && platformObject && platformObject.body && player2.body.bottom <= platformObject.body.top + 5)
                platformObject.steppedOn();
            });

            this.physics.add.overlap(this.player, this.finishes, (player, finish) => {
                const finishObject = finish as Finish;
                if (finishObject.getCanFinish()) {

                this.map?.destroy();
                this.player?.destroy();
                this.layer?.destroy();
                this.fruits?.clear();
                this.finishes?.clear();
                this.spikes?.clear();
                let allSprites = this.children.list.filter(x => x instanceof Phaser.GameObjects.Sprite);
                allSprites.forEach(x => x.destroy());
                this.nextLevel();
                }
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

    renegeratePlatforms() {
        if(this.map){
        const platformObjects = this.map.getObjectLayer('Platforms')?.objects;
        platformObjects?.forEach(platformObject => {
            if (platformObject.x && platformObject.y) {
                const platform = new Platform(this, 2*platformObject.x, 2*platformObject.y, 'platform-off');
                platform.setScale(2);
                platform.setOrigin(0, 1);
                this.platforms?.add(platform);
            }
        })};
    }
}
