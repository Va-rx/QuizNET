export class Platform extends Phaser.Physics.Arcade.Sprite {


    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        this.body?.setSize(32, 10);
        // this.setCollideWorldBounds(false);
        // this.setImmovable(true);
        // this.body.setAllowGravity(true);
        // this.setBounce(0.2);

        this.anims.play('platform-on', true);
    }

    steppedOn() {
        this.setVelocityY(-15);
        setTimeout(() => {
            this.turnOff();
        }, 150)
    }

    turnOff() {
        this.anims.stop();
        setTimeout(() => {
            this.setVelocityY(1000);
            this.setImmovable(false);
        }, 250)
        setTimeout(() => {
            this.destroy();
        }, 1000);
    }
}
