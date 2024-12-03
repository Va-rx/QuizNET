import { Enemy } from "./enemy";

export default class Spiker extends Enemy {
    private moveDirection: 'left' | 'right' = 'right';
    private platforms: Phaser.Physics.Arcade.StaticGroup;
    private turnDelay: number = 500; // Opóźnienie w ms przed zmianą kierunku
    private lastTurnTime: number = 0; // Czas ostatniej zmiany kierunku

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, platforms: Phaser.Physics.Arcade.StaticGroup) {
        super(scene, x, y, texture);

        this.platforms = platforms;
        // this.setCircle(this.halfWidth, 0, this.body.halfHeight - this.body.halfWidth);
        this.width = 50;
        this.height = 50;
        this.setOffset(0.5, 0.5);
        this.setCircle(this.width / 2, 0, this.height / 2 - this.width / 2);

        // this.setOffset(0, 0);

        scene.anims.create({
            key: 'blink-right',
            frames: scene.anims.generateFrameNumbers('spiker-blink', { start: 0, end: 3}),
            frameRate: 25,
            repeat: -1
        });
    };

    public moveRight() {
        this.setVelocityX(100);
        this.moveDirection = 'right';
    }

    public moveLeft() {
        this.setVelocityX(-100);
        this.moveDirection = 'left';
    }

    // Metoda sprawdzająca, czy przed przeciwnikiem jest podłoże
    private checkGroundAhead(): boolean {
        // const offsetX = this.moveDirection === 'right' ? this.width+1: -this.width-1;

        const checkX = this.x + (this.width) / 2 + 1;

        const sensor = this.scene.physics.add.sprite(checkX, this.y + this.height / 1.3, '')
            .setVisible(false)
            .setOffset(0,0);
        
        const isGround = this.scene.physics.overlap(sensor, this.platforms);
        sensor.destroy();
        console.log(isGround);
        
        return isGround;

        // Ustawiamy punkt kolizji pod prawej lub lewej krawędzi hitboxu przeciwnika
        // const offsetX = this.moveDirection === 'right' ? this.width * 0.4 : -this.width * 0.4;
        // const checkX = this.x + offsetX;
        // const checkY = this.y + this.height / 2;

        // // Tworzymy niewidzialny punkt kolizji pod brzegiem hitboxu przeciwnika
        // const groundCheckSensor = this.scene.physics.add.sprite(checkX, checkY, '')
        //     .setVisible(false)
        //     .setSize(2, 2); // Zwiększony rozmiar sensora

        // const isGroundAhead = this.scene.physics.overlap(groundCheckSensor, this.platforms);
        // groundCheckSensor.destroy();

        // return isGroundAhead;
    }

    public move() {
        const now = this.scene.time.now;

        if (this.moveDirection === 'right') {
            this.moveRight();
        } else {
            this.moveLeft();
        }

        // Jeśli nie ma podłoża w kierunku ruchu i minął czas od ostatniej zmiany kierunku, odwróć ruch
        if (!this.checkGroundAhead() && now - this.lastTurnTime > this.turnDelay) {
            this.lastTurnTime = now;
            if (this.moveDirection === 'right') {
                this.moveLeft();
            } else {
                this.moveRight();
            }
        }
    }

    public start() {
        // Inicjalizacja ruchu przeciwnika
        this.moveRight();
    }

    // Aktualizacja przeciwnika w pętli gry
    public updatex() {
        // this.move();
        // console.log(this.moveDirection);
    }
}