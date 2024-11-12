import { Direction } from "./direction";

export class Player extends Phaser.Physics.Arcade.Sprite {
    private direction: Direction = Direction.RIGHT;

    private jumpVelocity: number = -500;
    private moveVelocity: number = -240

    private lastJumpTime: number = 0;
    private jumpButtonReleased: boolean = true;
    private jumpInRowCount: number = 0;
    private jumpInRowCountMax: number = 2;

    private canControl: boolean = false;


    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        // this.setOrigin(0,0);

        this.loadAnimations();
        scene.physics.world.enable(this);

        this.setBounce(0.2);  
        this.body?.setSize(28, 28);    

        this.spawn();
    }

    public spawn() {
        this.scene.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setOrigin(0,0);

        this.body?.setOffset(-28, -28);
        this.anims.play('appear', true);
        this.body?.setOffset(-28, -28);

        this.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
            if (anim.key === 'appear') {
                this.canControl = true;
                this.body?.setOffset(2,4);
                this.anims.play('idle', true);
            }
        });
    }

    public jump() {
        if (this.canJump()) {
            this.performJump('jump');
        } else if (this.canJumpMidair()) {
            this.performJump('jump-midair');
        }
    }

    private canJump() {
        return this.body?.blocked.down;
    }

    private canJumpMidair() {
        return !this.body?.blocked.down && (Date.now() - this.lastJumpTime) < 1000 && this.jumpButtonReleased && this.jumpInRowCount < this.jumpInRowCountMax-1;
    }

    private performJump(animationKey: string) {
        this.setVelocityY(this.jumpVelocity);
        this.lastJumpTime = Date.now();
        this.jumpInRowCount++;
        this.jumpButtonReleased = false;

        this.anims.play(animationKey, true);
    }

    public moveRight() {
        this.setVelocityX(-this.moveVelocity);

        this.flipX = false;
        if (this.body?.blocked.down) {
            this.anims.play('run', true);
        }
    }

    public moveLeft() {
        this.setVelocityX(this.moveVelocity);

        this.flipX = true;  // Enables animation rotation
        if (this.body?.blocked.down) {
            this.anims.play('run', true);
        }
    }

    public moveStop() {
        this.setVelocityX(0);

        if (this.body?.blocked.down) {
            this.anims.play('idle', true);
        }
    }

    private handlePlayerMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (cursors.left.isDown) {
            this.moveLeft();
        } else if (cursors.right.isDown) {
            this.moveRight();
        } else {
            this.moveStop();
        }

        if (cursors.up.isDown) {
            this.jump();
        }
    }

    public respawn(x: number, y: number) {
        this.setCollideWorldBounds(true);
        this.setVisible(true);
        this.x = x;
        this.y = y;
        this.setOrigin(0,0);



        // this.anims.play('appear', true);
        // this.setOrigin(0.5, 0.5);
        this.body?.setSize(32, 32);
        this.body?.setOffset(32, 32);
        // this.setOrigin(0.5, 1);
        this.refreshBody();

        this.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
            if (anim.key === 'appear') {
                this.setVelocityY(0);
                this.body?.setOffset(0,0);
                this.anims.play('idle', true);
            }
        });
    }

    public kill(): Promise<void> {
        return new Promise((resolve) => {
            this.canControl = false;
            this.setVelocityX(0);
            this.setVelocityY(300);

        this.body?.setOffset(32, 32);
            this.anims.play('disappear', true);
            this.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
                if (anim.key === 'disappear') {
                    resolve();
                }
            })
        });
    }

    public override update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (this && this.active && this.canControl) {
        this.handlePlayerMovement(cursors);

        if (cursors.up.isUp) {
            this.jumpButtonReleased = true;
        }

        if (this.body?.blocked.down) {
            this.jumpInRowCount = 0;
        }

        // console.log('x:', this.x)
        // console.log(this.y);
    }
    }

    private loadAnimations() {
        this.scene.anims.create({
            key: 'appear',
            frames: this.scene.anims.generateFrameNumbers('appear', { start: 0, end: 6 }),
            frameRate: 25,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'idle',
            frames: this.scene.anims.generateFrameNumbers('frog-idle', { start: 0, end: 10 }),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'run',
            frames: this.scene.anims.generateFrameNumbers('frog-move', { start: 0, end: 11 }),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'jump',
            frames: this.scene.anims.generateFrameNumbers('frog-jump', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'jump-midair',
            frames: this.scene.anims.generateFrameNumbers('frog-jump-midair', { start: 0, end: 4 }),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'disappear',
            frames: this.scene.anims.generateFrameNumbers('disappear', { start: 0, end: 4 }),
            frameRate: 25,
            repeat: 0
        });
    }
}