export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
    private health: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.physics.add.existing(this);

        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.health = 100;

        // this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);
        (this.body as Phaser.Physics.Arcade.Body).pushable = false;
    };

    takeDamage(damage: number) {
        this.health -= damage;
        console.log(`I've got a hit! I have a ${this.health} hp left`);

        if (this.health <= 0) this.die();
    }

    die() {
        this.setActive(false);
        this.setVisible(false);
        this.disableBody(true, true);
        console.log("Enemy defeated!");
    }
}