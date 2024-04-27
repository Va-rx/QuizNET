import { io } from "socket.io-client";

export default class Example extends Phaser.Scene
{
    scoreText;
    lastScore=-1;
    score = 0;
    cursors;
    platforms;
    stars;
    player;
    //socket=io('http://localhost:8080');
    others;
    othersprites;
    preload ()
    {

        this.load.image('sky', 'assets/games/firstgame/assets/sky.png');
        this.load.image('ground', 'assets/games/firstgame/assets/platform.png');
        this.load.image('star', 'assets/games/firstgame/assets/star.png');
        this.load.image('bomb', 'assets/games/firstgame/assets/bomb.png');
        this.load.spritesheet('dude', 'assets/games/firstgame/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create ()
    {
        this.add.image(400, 300, 'sky');

        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        this.player = this.physics.add.sprite(100, 450, 'dude');

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        if(this.input.keyboard){
          this.cursors = this.input.keyboard.createCursorKeys();
        }

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate(child =>
        {

            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000' });

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);

        this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);
    }

    override update ()
    {      
        //emiting user score
        if(this.score!=this.lastScore){
            this.lastScore=this.score;
            this.game.events.emit('userScoreUpdate',this.score);
        
            console.log(this.score);
        }
        
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-330);
        }
    }

    collectStar (player, star)
    {
        star.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x:0,y: 300 },
            debug: false
        }
    },
    scene: Example
};

//const game = new Phaser.Game(config);
