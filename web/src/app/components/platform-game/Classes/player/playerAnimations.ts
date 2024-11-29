export class PlayerAnimations {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    createAllAnimations() {
        this.createGeneralAnimations();
        this.createFrogAnimations();
        this.createMaskerAnimations();
        this.createPinkerAnimations();
        this.createVirtualAnimations();
    }

    private createGeneralAnimations() {
        this.scene.anims.create({
            key: 'appear',
            frames: this.scene.anims.generateFrameNumbers('appear', { start: 0, end: 6 }),
            frameRate: 25,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'disappear',
            frames: this.scene.anims.generateFrameNumbers('disappear', { start: 0, end: 4 }),
            frameRate: 25,
            repeat: 0
        });
    }

    private createFrogAnimations() {
        this.scene.anims.create({
            key: 'frog-idle',
            frames: this.scene.anims.generateFrameNumbers('frog-idle', { start: 0, end: 10 }),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'frog-run',
            frames: this.scene.anims.generateFrameNumbers('frog-move', { start: 0, end: 11 }),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'frog-jump',
            frames: this.scene.anims.generateFrameNumbers('frog-jump', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'frog-jump-midair',
            frames: this.scene.anims.generateFrameNumbers('frog-jump-midair', { start: 0, end: 4 }),
            frameRate: 25,
            repeat: -1
        });
    }

    private createMaskerAnimations() {
        this.scene.anims.create({
            key: 'masker-idle',
            frames: this.scene.anims.generateFrameNumbers('masker-idle', { start: 0, end: 10 }),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'masker-run',
            frames: this.scene.anims.generateFrameNumbers('masker-move', { start: 0, end: 11 }),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'masker-jump',
            frames: this.scene.anims.generateFrameNumbers('masker-jump', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'masker-jump-midair',
            frames: this.scene.anims.generateFrameNumbers('masker-jump-midair', { start: 0, end: 4 }),
            frameRate: 25,
            repeat: -1
        });
    }

    private createPinkerAnimations() {
        this.scene.anims.create({
            key: 'pinker-idle',
            frames: this.scene.anims.generateFrameNumbers('pinker-idle', { start: 0, end: 10 }),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'pinker-run',
            frames: this.scene.anims.generateFrameNumbers('pinker-move', { start: 0, end: 11 }),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'pinker-jump',
            frames: this.scene.anims.generateFrameNumbers('pinker-jump', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'pinker-jump-midair',
            frames: this.scene.anims.generateFrameNumbers('pinker-jump-midair', { start: 0, end: 4 }),
            frameRate: 25,
            repeat: -1
        });
    }

    private createVirtualAnimations() {
        this.scene.anims.create({
            key: 'virtual-idle',
            frames: this.scene.anims.generateFrameNumbers('virtual-idle', { start: 0, end: 10 }),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'virtual-run',
            frames: this.scene.anims.generateFrameNumbers('virtual-move', { start: 0, end: 11 }),
            frameRate: 25,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'virtual-jump',
            frames: this.scene.anims.generateFrameNumbers('virtual-jump', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'virtual-jump-midair',
            frames: this.scene.anims.generateFrameNumbers('virtual-jump-midair', { start: 0, end: 4 }),
            frameRate: 25,
            repeat: -1
        });
    }
}