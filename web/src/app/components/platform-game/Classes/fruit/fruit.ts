export class Fruit extends Phaser.Physics.Arcade.Sprite {
    private isBonus: boolean = false;
    private bonusGlow?: Phaser.GameObjects.Graphics;

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

    public setBonus() {
        this.isBonus = true;
        this.bonusGlow = this.scene.add.graphics();
        this.bonusGlow.fillStyle(0xc97928, 0.3);
        this.bonusGlow.fillCircle(this.x, this.y, 32);
    }

    public override destroy() {
        this.bonusGlow?.destroy();
        super.destroy(true);
    }
}