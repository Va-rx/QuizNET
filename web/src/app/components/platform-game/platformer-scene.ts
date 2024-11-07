import Phaser from "phaser";
import { Player } from "./Classes/player";
import Enemy from "./Classes/enemy";

export default class platformerScene extends Phaser.Scene {

    private player?: Player;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private spikes?: Phaser.Physics.Arcade.StaticGroup;
    private enemy?: Phaser.Physics.Arcade.Sprite;

    private playerAttackHitboxes?: Phaser.Physics.Arcade.StaticGroup;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    preload() {
        this.load.spritesheet('dude', 'assets/games/firstgame/assets/dude.png', {frameWidth: 32, frameHeight: 48});
        this.load.image('star', 'assets/games/firstgame/assets/star.png');
        this.load.image('sky', 'assets/games/firstgame/assets/sky.png');
        this.load.image('ground', 'assets/games/firstgame/assets/platform.png');
        this.load.image('spikes', 'assets/games/platformer/Spikes.png');

        this.load.spritesheet('frog-idle', 'assets/games/platformer/Idle (32x32).png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('frog-move', 'assets/games/platformer/Run (32x32).png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('frog-jump', 'assets/games/platformer/Jump (32x32).png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('frog-jump-midair', 'assets/games/platformer/Double Jump (32x32).png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('appear', 'assets/games/platformer/Appearing (96x96).png', {frameWidth: 96, frameHeight: 96});
        this.load.spritesheet('disappear', 'assets/games/platformer/Disappearing (96x96).png', {frameWidth: 96, frameHeight: 96});
    };

    create() {
        this.add.image(400, 300, 'sky');

        this.platforms = this.physics.add.staticGroup();
        this.spikes = this.physics.add.staticGroup();

        const ground = this.platforms.create(400, 568, 'ground') as Phaser.Physics.Arcade.Sprite;
        const spike = this.spikes.create(400, 512, 'spikes') as Phaser.Physics.Arcade.Sprite;

        spike
            .setScale(3)
            .refreshBody();

        ground
            .setScale(2)
            .refreshBody();

        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');


        this.player = new Player(this, 100, 450, 'frog-idle');
        this.player.setScale(2);
        this.enemy = new Enemy(this, 300, 450, 'dude');

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.enemy);
        this.physics.add.collider(this.enemy, this.platforms);

        this.physics.add.collider(this.player, this.spikes, () => {
            this.player?.kill();
            this.player?.respawn(100, 450);
        });


        this.cursors = this.input.keyboard?.createCursorKeys();
    };

    override update() {
        if (this.cursors) {
            this.player?.update(this.cursors);
        }
    };
}