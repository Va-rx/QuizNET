
import {SocketServiceService} from "../../services/socket/socket-service.service";
import Phaser from "phaser";
import {Socket} from "socket.io-client";
import Pointer = Phaser.Input.Pointer;

export default class multiplayerScene extends Phaser.Scene {
  player!: Player;
  stars: any = [];
  // playerHP: number = 100;
  // healthBar!: Phaser.GameObjects.Graphics;
  // playerNameText!: Phaser.GameObjects.Text;
  otherStars;
  angle = 0;
  cursors;
  others;
  othersprites: any = [];
  pointer!: Phaser.Input.Pointer;
  attackRange = 50;

  private socket: Socket;

  constructor(config: Phaser.Types.Scenes.SettingsConfig, socket: Socket) {
    super(config);
    this.socket = socket;
  }

  preload() {
    this.load.spritesheet('dude', 'assets/games/firstgame/assets/dude.png', {frameWidth: 32, frameHeight: 48});
    this.load.image('star', 'assets/games/firstgame/assets/star.png');
  }

  create() {
    this.matter.world.setBounds();
    this.matter.world.disableGravity();

    this.player =  new Player(this.matter.add.sprite(100, 450, 'dude'), this.add.text(100, 400, 'PlayerName', {  fontSize: '16px',  color: '#ffffff'}).setOrigin(0.5), 100);

    // this.player.sprite.s(16); // Możesz ustawić inne kształty, np. prostokąt setRectangle(width, height)
    // this.player.sprite.setBounce(0.2);

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

    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('dude', { start: 6, end: 8 }),
      frameRate: 10,
      repeat: 0
    });


    // Initialize keyboard input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    this.pointer = this.input.activePointer;
    this.game.events.emit('chooseRole');
    this.input.on('pointerdown', (pointer) => {
      this.swingSword();
    });



    this.socket.on('spawnStar', (star) => {
      this.spawnStar(star.x, star.y);
    });


    console.log("currentStars");
    this.socket.on("currentStars", (stars) => {
      console.log(stars);
    });

  }

  override update() {
    if (this.player) {

      this.player.updateHealthBar();
      if (this.player.canMove) {
        if (this.cursors.left.isDown) {
          this.player.sprite.x += -1.3
          this.player.sprite.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
          this.player.sprite.x += 1.3;
          this.player.sprite.anims.play('right', true);
        } else {
          this.player.sprite.anims.play('turn');
        }

        if (this.cursors.up.isDown) {
          this.player.sprite.y += -1.3;
          this.player.sprite.anims.play('left', true);
        } else if (this.cursors.down.isDown) {
          this.player.sprite.y += 1.3
          this.player.sprite.anims.play('left', true);
        } else {
          this.player.sprite.anims.play('turn');
        }
      }

      this.socket.on("playerDied", (id, posx, posy) => {
        if (id == this.socket.id) {
          this.player.sprite.destroy()
          this.player.nameText.destroy();
          this.player.setSprite(this.matter.add.sprite(posx, posy, 'dude'));
          this.player.setNameText(this.add.text(posx, posy - 50, 'PlayerName', {  fontSize: '16px',  color: '#ffffff'}).setOrigin(0.5));
          this.player.health = 100;
          this.player.sprite.setVisible(false);

          // setTimeout(() => {
          //   this.player.showPlayer();
          // }, 2000);
          this.player.showPlayer();
        }
      })
      this.player.nameText.setPosition(this.player.sprite.x, this.player.sprite.y - 50);

      this.socket.emit('updatePlayers', {posy: this.player.sprite.y, posx: this.player.sprite.x, hp: this.player.health, visible: this.player.sprite.visible});
      this.socket.on('updatePlayers', (data) => {
        if (this.othersprites[0] != undefined) {
          for (let sprite of this.othersprites) {
            sprite.removePlayer();
            this.othersprites = [];
          }
        }
        this.others = data;
      });

      if (this.others != null) {
        for (let i = 0; i < this.others.length; i++) {
          if (this.others[i].id != this.socket.id) {
            let newPlayer = new Player(this.matter.add.sprite(this.others[i].posx, this.others[i].posy, 'dude'),
              this.add.text(this.others[i].posx, this.others[i].posy - 50, 'PlayerName ' + this.others[i].hp, {  fontSize: '16px',
              color: '#ffffff'}).setOrigin(0.5), this.others[i].hp);
            newPlayer.sprite.setName('enemy');
            newPlayer.showPlayer();
            if (!this.others[i].visible) {
              newPlayer.collectStar();
            }
            this.othersprites.push(newPlayer);
          }
          else {
            this.player.health = this.others[i].hp;
          }
        }
      }

      this.game.events.on('questionAnswered', () => {
        this.socket.emit('questionAnswered', this.socket.id);
        this.player.showPlayer();
      })
      this.socket.on('removeStar', (star) => {
        if (this.stars.length > 0) {
          this.stars.forEach((s, index) => {
            if (s.x == star.x && s.y == star.y) {
              s.destroy();
              this.stars.splice(index, 1);
            }
          });
        }
      });



    }
  }

  spawnStar(x: number, y: number) {
    let star = this.matter.add.image(x, y, 'star');
    star.setName('star');
    star.setSensor(true);
    star.setOnCollide((pair) => {
      const {bodyA, bodyB} = pair;
      if (bodyA.gameObject && bodyB.gameObject) {
        if (bodyA.gameObject.name == 'star' && bodyB.gameObject.name == 'dude' || bodyA.gameObject.name == 'dude' && bodyB.gameObject.name == 'star') {
          this.socket.emit("collectStar", star, this.socket.id);
          this.player.collectStar();
          this.game.events.emit('spawnQuestion');
          this.stars = this.stars.filter(s => s.x !== star.x && s.y !== star.y);
          star.destroy();
          // this.player.setVisible(false);
        }
      }

    });
    this.stars.push(star);
  }

  swingSword() {
    const x = this.pointer.x;
    const y = this.pointer.y;

    this.others.forEach(player => {
      if (player.id != this.socket.id) {
      const distance = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, player.posx, player.posy);
        const playerBounds = new Phaser.Geom.Rectangle(player.posx - 16, player.posy - 24, 32, 48);
        // Assuming player sprite is 32x48
        console.log(player)
        if (distance < 50 && player.visible && playerBounds.contains(x, y)) {
          this.socket.emit('attack', player.id,);
        }
    }});
  }
}


export class Player {
  sprite: Phaser.GameObjects.Sprite;
  nameText: Phaser.GameObjects.Text;
  health: number;
  healthBar!: Phaser.GameObjects.Graphics;
  canMove!: boolean;
  isTargetable!: boolean;
  constructor(sprite: Phaser.GameObjects.Sprite, nameText: Phaser.GameObjects.Text, health: number) {
    this.sprite = sprite;
    this.nameText = nameText;
    this.health = health;
    this.canMove = true;
    this.isTargetable = true;
    this.sprite.setName('dude')

    this.healthBar = this.sprite.scene.add.graphics();
    this.drawHealthBar();
  }

  public setSprite(sprite: Phaser.GameObjects.Sprite): void{
    this.sprite = sprite;
  }

  public setNameText(nameText: Phaser.GameObjects.Text): void{
    this.nameText = nameText;
  }

  public collectStar(): void{
    this.isTargetable = false;
    this.canMove = false;
    this.sprite.setVisible(false);
    this.nameText.setVisible(false);
    this.healthBar.setVisible(false);
  }

  public showPlayer(): void{
    this.isTargetable = true;
    this.canMove = true;
    this.sprite.setVisible(true);
    this.nameText.setVisible(true);
  }

  public removePlayer(): void{
    this.sprite.destroy();
    this.nameText.destroy();
    this.healthBar.destroy();
  }

  public updateHealthBar(): void {
    this.drawHealthBar();
    // console.log('pozycja mojego spirtea', this.sprite.x, this.sprite.y);
    // console.log('pozycja mojego hp', this.healthBar.x, this.healthBar.y);
  }

  private drawHealthBar(): void {
    const barWidth = 100;
    const barHeight = 10;
    const borderColor = 0x000000;
    const fillColor = 0xff0000;
    this.healthBar.clear();
    this.healthBar.lineStyle(2, borderColor);
    this.healthBar.strokeRect(this.sprite.x - barWidth / 2, this.sprite.y - 40, barWidth, barHeight);
    this.healthBar.fillStyle(fillColor);
    this.healthBar.fillRect(this.sprite.x - barWidth / 2, this.sprite.y - 40, barWidth * (this.health / 100), barHeight);
  }

}
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'matter',
    matter: {
      debug: true,
      gravity: {
        x: 0,
        y: 0
      }
    }
  },
  scene: multiplayerScene
};

