export class FruitAnimations {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    createAllAnimations() {
        this.createGeneralAnimations();
        this.createCherryAnimations();
        this.createAppleAnimations();
        this.createBananaAnimations();
        this.createKiwiAnimations();
        this.createMelonAnimations();
        this.createOrangeAnimations();
        this.createPineappleAnimations();
        this.createStrawberryAnimations();
    }

    private createGeneralAnimations() {
        this.scene.anims.create({
            key: 'fruit-collect',
            frames: this.scene.anims.generateFrameNumbers('fruit-collect', { start: 0, end: 5 }),
            frameRate: 25,
            repeat: 0
        });
    }

    private createAppleAnimations() {
        this.scene.anims.create({
            key: 'apple',
            frames: this.scene.anims.generateFrameNumbers('apple', { start: 0, end: 16 }),
            frameRate: 25,
            repeat: -1
        });
    }

    private createBananaAnimations() {
        this.scene.anims.create({
            key: 'banana',
            frames: this.scene.anims.generateFrameNumbers('banana', { start: 0, end: 16 }),
            frameRate: 25,
            repeat: -1
        });
    }

    private createCherryAnimations() {
        this.scene.anims.create({
            key: 'cherry',
            frames: this.scene.anims.generateFrameNumbers('cherry', { start: 0, end: 16 }),
            frameRate: 25,
            repeat: -1
        });
    }

    private createKiwiAnimations() {
        this.scene.anims.create({
            key: 'kiwi',
            frames: this.scene.anims.generateFrameNumbers('kiwi', { start: 0, end: 16 }),
            frameRate: 25,
            repeat: -1
        });
    }

    private createMelonAnimations() {
        this.scene.anims.create({
            key: 'melon',
            frames: this.scene.anims.generateFrameNumbers('melon', { start: 0, end: 16 }),
            frameRate: 25,
            repeat: -1
        });
    }

    private createOrangeAnimations() {
        this.scene.anims.create({
            key: 'orange',
            frames: this.scene.anims.generateFrameNumbers('orange', { start: 0, end: 16 }),
            frameRate: 25,
            repeat: -1
        });
    }

    private createPineappleAnimations() {
        this.scene.anims.create({
            key: 'pineapple',
            frames: this.scene.anims.generateFrameNumbers('pineapple', { start: 0, end: 16 }),
            frameRate: 25,
            repeat: -1
        });
    }

    private createStrawberryAnimations() {
        this.scene.anims.create({
            key: 'strawberry',
            frames: this.scene.anims.generateFrameNumbers('strawberry', { start: 0, end: 16 }),
            frameRate: 25,
            repeat: -1
        });
    }
}