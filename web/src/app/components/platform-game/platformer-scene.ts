import Phaser from "phaser";
import { Player } from "./Classes/player/player";
import { Fruit } from "./Classes/fruit/fruit";
import { Spikes } from "./Classes/obstacles/spikes";
import { Finish } from "./Classes/finish/finish";
import { Saw } from "./Classes/obstacles/saw";
import { Platform } from "./Classes/obstacles/platform"
import { AssetLoader } from "./Classes/assetLoader";
import { AnimationManager } from "./Classes/animationManager";

export default class platformerScene extends Phaser.Scene {

    private map?: Phaser.Tilemaps.Tilemap
    private tilesets?: Phaser.Tilemaps.Tileset[];
    private layer?: Phaser.Tilemaps.TilemapLayer;

    private background?: Phaser.GameObjects.TileSprite;

    private player?: Player;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    private fruits?: Phaser.Physics.Arcade.StaticGroup;
    private spikes?: Phaser.Physics.Arcade.StaticGroup;
    private saws?: Phaser.Physics.Arcade.StaticGroup;
    private platforms?: Phaser.Physics.Arcade.Group;
    private finishes?: Phaser.Physics.Arcade.StaticGroup;

    private currentLevel?: number;
    private levelSpawnX?: number;
    private levelSpawnY?: number;

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

        this.currentLevel = 2;
        this.loadLevel(this.currentLevel);
    }

    override update() {
        if (this.background) {
            this.background.tilePositionY -= 0.1;
        }

        if (this.player && this.cursors) {
            this.player.update(this.cursors);
        }
    }

    loadLevel(level: number) {
        this.currentLevel = level;

        this.createLayer();
        this.initializeObjects();
        this.createObjects();

        if (this.layer && this.map) {
            this.levelSpawnX = this.map.getObjectLayer('Player')?.objects[0].x;
            this.levelSpawnY = this.map.getObjectLayer('Player')?.objects[0].y;
        }
       
        this.createPlayer();
        this.playerColliders();
        this.createBackground();
        this.setCamera();
        this.setEvents();

        this.cursors = this.input.keyboard?.createCursorKeys();

        this.checkEnableFinish();  // if the level has 0 fruits
    }

    nextLevel() {
        if (this.currentLevel) {
            this.loadLevel(this.currentLevel+1);
        } else {
            this.loadLevel(1);
        }
    }

    regenerateFallingPlatforms() {
        if(this.map){
            const platformObjects = this.map.getObjectLayer('Platforms')?.objects;
            platformObjects?.forEach(platformObject => {
                if (platformObject.x && platformObject.y) {
                    const platform = new Platform(this, 2*platformObject.x, 2*platformObject.y, 'platform-off');
                    platform.setScale(2);
                    platform.setOrigin(0, 1);
                    this.platforms?.add(platform);
                }
            });
        };
    }

    checkEnableFinish() {
        const fruitsList = this.fruits?.children.entries;
        if (fruitsList) {
            for (const fruit of fruitsList) {
                const fruitObject = fruit as Fruit;
                if (!fruitObject.getIsBonus()) return;
            }
        }

        this.finishes?.children.entries.forEach((finish) => {
            if (finish instanceof Finish && !finish.getCanFinish()) {
                finish.enableFinish();
            }
        });
    }

    createLayer() {
        this.map = this.make.tilemap({ key: `map${this.currentLevel}` });
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
    }

    initializeObjects() {
        this.fruits = this.physics.add.staticGroup();
        this.spikes = this.physics.add.staticGroup();
        this.finishes = this.physics.add.staticGroup();
        this.saws = this.physics.add.staticGroup();
        this.platforms = this.physics.add.group({
            immovable: true,
            allowGravity: false,
            bounceY: 100,
        });
    }

    createObjects() {
        if (this.map) {
            const fruitObjects = this.map.getObjectLayer('Collectibles')?.objects;
            const spikeObjects = this.map.getObjectLayer('Spikes')?.objects;
            const finishObjects = this.map.getObjectLayer('Finish')?.objects;
            const sawObjects = this.map.getObjectLayer('Saws')?.objects;
            const platformObjects = this.map.getObjectLayer('Platforms')?.objects;
    
            fruitObjects?.forEach(fruitObject => {
                if (fruitObject.x && fruitObject.y) {                    
                    let fruit;
                    if (fruitObject.name) {
                        if (fruitObject.name.substring(0, 2) === 's-') {
                            fruit = new Fruit(this, 2*fruitObject.x, 2*fruitObject.y, fruitObject.name.substring(2));
                            fruit.setBonus();
                        } else {
                            fruit = new Fruit(this, 2*fruitObject.x, 2*fruitObject.y, fruitObject.name);
                        }
                    } else {
                        fruit = new Fruit(this, 2*fruitObject.x, 2*fruitObject.y, this.randomFruit());
                    }

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
        }
    }

    createPlayer() {
        if (this.levelSpawnX && this.levelSpawnY) {
            this.player = new Player(this, 2*this.levelSpawnX, 2*this.levelSpawnY, '');
            this.player.setRandomCharacter();
            this.player.setScale(2);
        }
    }

    playerColliders() {
        if (this.player) {
            if (this.layer) {
                this.physics.add.collider(this.player, this.layer);
            }

            if (this.fruits) {
                this.physics.add.overlap(this.player, this.fruits, (player, fruit) => {
                    const fruitObject = fruit as Fruit;
                    fruitObject.collect().then(res => {
                        this.checkEnableFinish();
                    })
                });
            }

            if (this.saws) {
                this.physics.add.overlap(this.player, this.saws, (player, saw) => {
                    this.player?.kill().then(() => {
                        if (this.levelSpawnX && this.levelSpawnY) {
                        this.platforms?.clear(true, true);
                        this.player?.respawn(2*this.levelSpawnX, 2*this.levelSpawnY);
                        this.regenerateFallingPlatforms();}
                    })
                });
            }

            if (this.spikes) {
                this.physics.add.collider(this.player, this.spikes, () => {
                    this.player?.kill().then(() => {
                        if (this.levelSpawnX && this.levelSpawnY) {
                        this.platforms?.clear(true, true);
                        this.player?.respawn(2*this.levelSpawnX, 2*this.levelSpawnY)}
                        this.regenerateFallingPlatforms();
                    })
                });
            }

            if (this.platforms) {
                this.physics.add.collider(this.player, this.platforms, (player, platform) => {
                    const platformObject = platform as Platform;
                    const player2 = player as Player;
                    if (player2 && player2.body && platformObject && platformObject.body && player2.body.bottom <= platformObject.body.top + 5)
                    platformObject.steppedOn();
                });
            }

            if (this.finishes) {
                this.physics.add.overlap(this.player, this.finishes, (player, finish) => {
                    const finishObject = finish as Finish;
                    if (finishObject.getCanFinish()) {
                    this.game.events.emit('finishLevel', this.currentLevel);
                    }
                });
            }
        }
    }

    createBackground() {
        if (this.layer) {
            const properties = this.layer.layer.properties as { name: string; value: any }[];
            const background = properties.find(prop => prop.name === 'background')?.value;
            if (background) {
                this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, `${background}-bg`);
            } else {
                this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, `${this.randomBackground()}-bg`);

            }
            this.background.setOrigin(0, 0);
            this.background.setDepth(-2);
            this.background.setScale(3);
        }
    }

    randomBackground() {
        const backgrounds = ['blue', 'brown', 'gray', 'green', 'pink', 'purple', 'yellow'];
        const randomIndex = Math.floor(Math.random() * backgrounds.length);
        return backgrounds[randomIndex];
    }

    randomFruit() {
        const fruits = ['apple', 'banana', 'cherry', 'kiwi', 'melon', 'orange', 'pineapple', 'strawberry'];
        const randomIndex = Math.floor(Math.random() * fruits.length);
        return fruits[randomIndex];
    }

    setCamera() {
        if (this.map && this.player) {
            this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setRoundPixels(true);
        }
    }

    setEvents() {
        this.game.events.on("nextLevel", () => {
            this.map?.destroy();
            this.player?.destroy();
            this.layer?.destroy();
            this.fruits?.clear();
            this.finishes?.clear();
            this.spikes?.clear();
            this.background?.destroy();
            let allSprites = this.children.list.filter(x => x instanceof Phaser.GameObjects.Sprite);
            allSprites.forEach(x => x.destroy());
            this.nextLevel();
        });
    }
}
