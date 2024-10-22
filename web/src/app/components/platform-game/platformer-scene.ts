import Phaser from "phaser";
import { Player } from "./Classes/player";

export default class platformerScene extends Phaser.Scene {

    private player?: Player;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private enemy?: Phaser.Physics.Arcade.Sprite;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    preload() {
        this.load.spritesheet('dude', 'assets/games/firstgame/assets/dude.png', {frameWidth: 32, frameHeight: 48});
        this.load.image('star', 'assets/games/firstgame/assets/star.png');
        this.load.image('sky', 'assets/games/firstgame/assets/sky.png');
        this.load.image('ground', 'assets/games/firstgame/assets/platform.png');
    };

    create() {
        this.add.image(400, 300, 'sky');

        this.platforms = this.physics.add.staticGroup();
        const ground = this.platforms.create(400, 568, 'ground') as Phaser.Physics.Arcade.Sprite;

        ground
            .setScale(2)
            .refreshBody();

        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        this.enemy = this.physics.add.sprite(300, 450, 'dude');
        this.enemy.setCollideWorldBounds(true);

        this.player = new Player(this, 100, 450, 'dude');

        // this.player.setBounce(0.2);
        // this.player.setCollideWorldBounds(true);
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });
        
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemy, this.platforms);

        this.cursors = this.input.keyboard?.createCursorKeys();
    };

    override update() {
        if (this.cursors) {
            this.player?.update(this.cursors);
        }

        // if (this.cursors?.left.isDown) {
        //     this.player?.setVelocityX(-200);
        //     this.player?.anims.play('left', true);
        // } else if (this.cursors?.right.isDown) {
        //     this.player?.setVelocityX(200);
        //     this.player?.anims.play('right', true);
        // } else {
        //     this.player?.setVelocityX(0);
        //     this.player?.anims.play('turn');
        // }

        // if (this.cursors?.up.isDown && this.player?.body?.touching.down) {
        //     this.player.setVelocityY(-400);
        // }

        // if (this.cursors?.shift.isDown) {
        //     console.log('attack!')
        //     this.player?.attack();
        // }
    };
}