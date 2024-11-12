export class Fruit extends Phaser.Physics.Arcade.Sprite {


    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);

        this.loadAnimations();
        this.body?.setSize(16, 16);

        this.anims.play('cherry', true);
    }

    public collect() {
        this.anims.play('fruit-collect');

        this.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
            if (anim.key === 'fruit-collect') {
                this.disableBody(true, true);
                // this.destroy();
            }
        });
    }

    private loadAnimations() {
        this.scene.anims.create({
            key: 'cherry',
            frames: this.scene.anims.generateFrameNumbers('cherry', { start: 0, end: 16 }),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'fruit-collect',
            frames: this.scene.anims.generateFrameNumbers('fruit-collect', {start: 0, end: 5}),
            frameRate: 200,
            repeat: 0
        });
    }
}