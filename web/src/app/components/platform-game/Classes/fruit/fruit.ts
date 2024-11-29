export class Fruit extends Phaser.Physics.Arcade.Sprite {


    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);

        this.body?.setSize(16, 16);

        this.anims.play(texture, true);
    }

    public collect() {
        if (this.anims.currentAnim?.key !== 'fruit-collect') {
            this.anims.play('fruit-collect');

            this.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
                if (anim.key === 'fruit-collect') {
                    this.destroy();
                }
            });
        }
    }
}