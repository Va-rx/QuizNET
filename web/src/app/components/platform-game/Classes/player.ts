import { Sword } from "./sword";
import { Direction } from "./direction";

export class Player extends Phaser.Physics.Arcade.Sprite {
    private health: number = 100;
    private weapon: Sword;
    private lastAttackTime: number = 0;
    private direction: Direction = Direction.RIGHT;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        this.weapon = new Sword();

        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.setBounce(0.2);
        this.setCollideWorldBounds(true);

        scene.anims.create({
            key: 'right',
            frames: scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'left',
            frames: scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
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
        // const hitboxBody = hitbox.body as Phaser.Physics.Arcade.Body;
        // hitboxBody.allowGravity = false;

        this.scene.time.delayedCall(200, () => hitbox.destroy(), [], this);
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

    public override update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (cursors.left?.isDown) {
            this.setVelocityX(-160);
            this.anims.play('left', true);
        } else if (cursors.right?.isDown) {
            this.setVelocityX(160);
            this.anims.play('right', true);
        } else {
            this.setVelocityX(0);
            this.anims.play('turn', false);
        }

        if (cursors.up?.isDown && this.body?.touching.down) {
            this.setVelocityY(-500);
        }

        if (cursors.shift.isDown) {
            this.attack();
        }
    }
}