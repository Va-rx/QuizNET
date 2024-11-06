import { Sword } from "./sword";
import { Direction } from "./direction";

export class Player extends Phaser.Physics.Arcade.Sprite {
    private health: number = 100;
    private weapon: Sword;
    private lastAttackTime: number = 0;
    private direction: Direction = Direction.RIGHT;

    private jumpVelocity: number = -500;
    private moveVelocity: number = -240


    private lastJumpTime: number = 0;
    private jumpButtonReleased: boolean = true;
    private jumpInRowCount: number = 0;
    private jumpInRowCountMax: number = 2;
    

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        this.weapon = new Sword();

        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.setBounce(0.2);
        this.setCollideWorldBounds(true);

        scene.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNumbers('frog-idle', { start: 0, end: 10 }),
            frameRate: 25,
            repeat: -1
        });

        scene.anims.create({
            key: 'run',
            frames: scene.anims.generateFrameNumbers('frog-move', { start: 0, end: 11 }),
            frameRate: 25,
            repeat: -1
        });

        scene.anims.create({
            key: 'jump',
            frames: scene.anims.generateFrameNumbers('frog-jump', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });

        scene.anims.create({
            key: 'jump-midair',
            frames: scene.anims.generateFrameNumbers('frog-jump-midair', { start: 0, end: 5 }),
            frameRate: 25,
            repeat: -1
        });
    }


    public attack() {
        if(!this.canAttackCooldown()) return;

        let startX = this.x;
        let endX = this.x;
        console.log('hm');

        if (this.weapon instanceof Sword) {
            endX = this.x + this.weapon.range;
        }

        let hitbox = this.scene.add.rectangle(this.x+16, this.y, this.weapon.range, 30, 0xff0000, 0.5);
        this.scene.time.delayedCall(200, () => hitbox.destroy(), [], this);
        return hitbox;
    }

    private canJump() {
        return this.body?.touching.down;
    }

    private canJumpMidair() {
        return !this.body?.touching.down && (Date.now() - this.lastJumpTime) < 1000 && this.jumpButtonReleased && this.jumpInRowCount < this.jumpInRowCountMax-1;
    }

    public jump() {
        if (this.canJump()) {
            this.performJump('jump');
        } else if (this.canJumpMidair()) {
            this.performJump('jump-midair');
        }
    }

    public moveRight() {
        this.setVelocityX(-this.moveVelocity);

        this.flipX = false;
        if (this.body?.touching.down) {
            this.anims.play('run', true);
        }
    }

    public moveLeft() {
        this.setVelocityX(this.moveVelocity);

        this.flipX = true;  // Enables animation rotation
        if (this.body?.touching.down) {
            this.anims.play('run', true);
        }
    }

    public moveStop() {
        this.setVelocityX(0);

        if (this.body?.touching.down) {
            this.anims.play('idle', true);
        }
    }

    private performJump(animationKey: string) {
        this.setVelocityY(this.jumpVelocity);
        this.lastJumpTime = Date.now();
        this.jumpInRowCount++;
        this.jumpButtonReleased = false;

        this.anims.play(animationKey, true);
    }

    private canAttackCooldown() {
        const currentTime = Date.now();
        if (currentTime - this.lastAttackTime > this.weapon.attackCooldown) {
            this.lastAttackTime = currentTime;
            return true;
        }
        return false;
    }

    private determineAttackPixels() {
        switch (this.direction) {
            case Direction.RIGHT:
                
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

    public override update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        this.handlePlayerMovement(cursors);

        if (cursors.up.isUp) {
            this.jumpButtonReleased = true;
        }

        if (this.body?.touching.down) {
            this.jumpInRowCount = 0;
        }
    }
}