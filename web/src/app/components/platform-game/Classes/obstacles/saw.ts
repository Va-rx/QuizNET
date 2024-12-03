export class Saw extends Phaser.Physics.Arcade.Sprite {


    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        this.body?.setCircle(38, 38);

        this.anims.play('saw', true);
    }
}