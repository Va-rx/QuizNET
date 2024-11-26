export class Finish extends Phaser.Physics.Arcade.Sprite {
    private canFinish: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        this.body?.setSize(64, 64);
    }

    public enableFinish() {
        this.canFinish = true;
        this.anims.play('finish-flag-out');

        this.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
            if (anim.key === 'finish-flag-out') {
                this.anims.play('finish-flag-idle', true);
            }
        });
    }

    public getCanFinish() {
        return this.canFinish;
    }
}