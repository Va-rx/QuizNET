export class Finish extends Phaser.Physics.Arcade.Sprite {
    private canFinish: boolean = false;
    private openSound = this.scene.sound.add('open-finish', { volume: 0.2 })

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        // this.body?.setSize(16, 16);
    }

    public enableFinish() {
        this.canFinish = true;
        this.anims.play('finish-flag-out');
        this.openSound.play();

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