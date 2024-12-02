export class AssetLoader {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    loadAllAssets() {
        this.loadMaps();
        this.loadTiles();
        this.loadBackgrounds();
        this.loadCharacters();
        this.loadFruits();
        this.loadFinishes();
    }

    private loadMaps() {
        this.scene.load.tilemapTiledJSON('map1', 'assets/games/platformer/levels/mapa-1.json');
        this.scene.load.tilemapTiledJSON('map2', 'assets/games/platformer/levels/mapa-2.json');
        this.scene.load.tilemapTiledJSON('map3', 'assets/games/platformer/levels/mapa-3.json');
        this.scene.load.tilemapTiledJSON('map4', 'assets/games/platformer/levels/mapa-4.json');

        this.scene.load.tilemapTiledJSON('map5', 'assets/games/platformer/levels/mapa-5.json');
        this.scene.load.tilemapTiledJSON('map6', 'assets/games/platformer/levels/mapa-6.json');
        this.scene.load.tilemapTiledJSON('map7', 'assets/games/platformer/levels/mapa-7.json');
    }

    private loadTiles() {
        this.scene.load.image('tileset', 'assets/games/platformer/tilesets/Terrain.png');
        this.scene.load.image('spikes', 'assets/games/platformer/tilesets/Spikes.png');
        this.scene.load.spritesheet('saw', 'assets/games/platformer/tilesets/On (38x38).png', {frameWidth: 38, frameHeight: 38});
        this.scene.load.image('platform-off', 'assets/games/platformer/tilesets/platforms/Off.png')
        this.scene.load.spritesheet('platform-on', 'assets/games/platformer/tilesets/platforms/On.png', {frameWidth: 32, frameHeight: 10});
    }

    private loadBackgrounds() {
        this.scene.load.image('pink-bg', 'assets/games/platformer/backgrounds/Pink.png');
        this.scene.load.image('brown-bg', 'assets/games/platformer/backgrounds/Brown.png');
        this.scene.load.image('gray-bg', 'assets/games/platformer/backgrounds/Gray.png');
        this.scene.load.image('green-bg', 'assets/games/platformer/backgrounds/Green.png');
        this.scene.load.image('blue-bg', 'assets/games/platformer/backgrounds/Blue.png');
        this.scene.load.image('purple-bg', 'assets/games/platformer/backgrounds/Purple.png');
        this.scene.load.image('yellow-bg', 'assets/games/platformer/backgrounds/Yellow.png');
    }

    private loadCharacters() {
        this.scene.load.spritesheet('appear', 'assets/games/platformer/characters/basics/Appearing.png', {frameWidth: 96, frameHeight: 96});
        this.scene.load.spritesheet('disappear', 'assets/games/platformer/characters/basics/Disappearing.png', {frameWidth: 96, frameHeight: 96});

        this.scene.load.spritesheet('frog-idle', 'assets/games/platformer/characters/frog/Idle.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('frog-move', 'assets/games/platformer/characters/frog/Run.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('frog-jump', 'assets/games/platformer/characters/frog/Jump.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('frog-jump-midair', 'assets/games/platformer/characters/frog/Double Jump.png', {frameWidth: 32, frameHeight: 32});

        this.scene.load.spritesheet('masker-idle', 'assets/games/platformer/characters/masker/Idle.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('masker-move', 'assets/games/platformer/characters/masker/Run.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('masker-jump', 'assets/games/platformer/characters/masker/Jump.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('masker-jump-midair', 'assets/games/platformer/characters/masker/Double Jump.png', {frameWidth: 32, frameHeight: 32});

        this.scene.load.spritesheet('pinker-idle', 'assets/games/platformer/characters/pinker/Idle.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('pinker-move', 'assets/games/platformer/characters/pinker/Run.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('pinker-jump', 'assets/games/platformer/characters/pinker/Jump.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('pinker-jump-midair', 'assets/games/platformer/characters/pinker/Double Jump.png', {frameWidth: 32, frameHeight: 32});

        this.scene.load.spritesheet('virtual-idle', 'assets/games/platformer/characters/virtual/Idle.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('virtual-move', 'assets/games/platformer/characters/virtual/Run.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('virtual-jump', 'assets/games/platformer/characters/virtual/Jump.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('virtual-jump-midair', 'assets/games/platformer/characters/virtual/Double Jump.png', {frameWidth: 32, frameHeight: 32});
    }

    private loadFruits() {
        this.scene.load.spritesheet('fruit-collect', 'assets/games/platformer/fruits/Collected.png', {frameWidth: 32, frameHeight: 32});

        this.scene.load.spritesheet('cherry', 'assets/games/platformer/fruits/Cherry.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('banana', 'assets/games/platformer/fruits/Banana.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('apple', 'assets/games/platformer/fruits/Apple.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('kiwi', 'assets/games/platformer/fruits/Kiwi.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('melon', 'assets/games/platformer/fruits/Melon.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('orange', 'assets/games/platformer/fruits/Orange.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('pineapple', 'assets/games/platformer/fruits/Pineapple.png', {frameWidth: 32, frameHeight: 32});
        this.scene.load.spritesheet('strawberry', 'assets/games/platformer/fruits/Strawberry.png', {frameWidth: 32, frameHeight: 32});
    }

    private loadFinishes() {
        this.scene.load.image('finish-not-yet', 'assets/games/platformer/finishes/Finish (No Flag).png');
        this.scene.load.spritesheet('finish-flag-out', 'assets/games/platformer/finishes/Finish (Flag Out).png', {frameWidth: 64, frameHeight: 64});
        this.scene.load.spritesheet('finish-flag-idle', 'assets/games/platformer/finishes/Finish (Flag Idle).png', {frameWidth: 64, frameHeight: 64});
    }
}