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

        this.setOrigin(0.5, 1);

        scene.anims.create({
            key: 'appear',
            frames: scene.anims.generateFrameNumbers('appear', { start: 0, end: 6 }),
            frameRate: 25,
            repeat: 0
        });

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
            frames: scene.anims.generateFrameNumbers('frog-jump-midair', { start: 0, end: 4 }),
            frameRate: 25,
            repeat: -1
        });

        scene.anims.create({
            key: 'disappear',
            frames: scene.anims.generateFrameNumbers('disappear', { start: 0, end: 4 }),
            frameRate: 25,
            repeat: -1
        });
                            

        scene.physics.world.enable(this);
        this.spawn();
        this.setBounce(0.2);
    }


    public attack() {
        if(!this.canAttackCooldown()) return;

        let startX = this.x;
        let endX = this.x;

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

    public spawn() {
        this.scene.add.existing(this);
        this.setCollideWorldBounds(true);

        this.body?.setSize(32, 32);
        this.refreshBody();
        this.body?.setOffset(32, 64);
        this.anims.play('appear', true);

        this.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
            if (anim.key === 'appear') {
                this.body?.setOffset(0,0);
                this.anims.play('idle', true);
            }
        });
    }

    public despawn() {
        // this.body?.setSize(32, 32);
        console.log('halo');
        this.anims.play('disappear', true);
    }

    public respawn(x: number, y: number) {
        this.setVisible(true);
        this.x = x;
        this.y = y;

        this.anims.play('appear', true);

        this.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
            if (anim.key === 'appear') {
                console.log('hm');
                this.body?.setOffset(0,0);
                this.anims.play('idle', true);
            }
        });
    
        // player.setCollideWorldBounds(true);
        // player.setSize(32, 32);
        // player.anims.play('idle', true);
    }

    public kill() {
        // this.setVisible(false);
        
        // this.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
        //     if (anim.key === 'disappear') {
        //         this.setVisible(false);
        //         this.anims.stop();
        //         this.destroy();
        //     }
        // });
    }

    public override update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (this && this.active) {
        this.handlePlayerMovement(cursors);

        if (cursors.up.isUp) {
            this.jumpButtonReleased = true;
        }

        if (this.body?.touching.down) {
            this.jumpInRowCount = 0;
        }
    }
}
}