export class Spikes extends Phaser.Physics.Arcade.Sprite {


    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        this.body?.setSize(16, 16);
    }
}