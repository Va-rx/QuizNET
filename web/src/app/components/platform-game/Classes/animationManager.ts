import { FruitAnimations } from "./fruit/fruitAnimations";
import { PlayerAnimations } from "./player/playerAnimations";

export class AnimationManager {
    private scene: Phaser.Scene;

    constructor(scene) {
        this.scene = scene;
    }

    createAllAnimations() {
        this.createPlayerAnimations();
        this.createFruitAnimations();
        this.createFinishesAnimations();
        this.createEnvironmentAnimations();
    }

    private createPlayerAnimations() {
        const playerAnimations = new PlayerAnimations(this.scene);
        playerAnimations.createAllAnimations();
    }

    private createFruitAnimations() {
        const fruitAnimations = new FruitAnimations(this.scene);
        fruitAnimations.createAllAnimations();
    }

    private createFinishesAnimations() {
        this.scene.anims.create({
            key: 'finish-flag-out',
            frames: this.scene.anims.generateFrameNumbers('finish-flag-out', {start: 0, end: 25}),
            frameRate: 25,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'finish-flag-idle',
            frames: this.scene.anims.generateFrameNumbers('finish-flag-idle', {start: 0, end: 9}),
            frameRate: 25,
            repeat: -1
        });
    }

    private createEnvironmentAnimations() {
        this.scene.anims.create({
            key: 'saw',
            frames: this.scene.anims.generateFrameNumbers('saw', { start: 0, end: 7}),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'platform-on',
            frames: this.scene.anims.generateFrameNumbers('platform-on', { start: 0, end: 3}),
            frameRate: 25,
            repeat: -1
        });
    }
}