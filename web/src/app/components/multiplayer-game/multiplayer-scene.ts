import {SocketServiceService} from "../../services/socket/socket-service.service";
import Phaser from "phaser";
import {Socket} from "socket.io-client";
import Pointer = Phaser.Input.Pointer;
import {MultiplayerRoles} from "./role-dialog/role.model";
import {Player} from "./Entities/Player";

export default class multiplayerScene extends Phaser.Scene {
  player!: Player;
  stars: any = [];
  cursors;
  pointer!: Phaser.Input.Pointer;
  nickname = '';
  questionsToAnswer = 2;
  players: { [id: string]: Player } = {};
  startingPlayers: any;
  mapBoundaries: {height: number, width: number } = {height: 0, width: 0};
  visibilityRadius: number = 15;
  bonusText!: Phaser.GameObjects.Text;
  questionsLeftText!: Phaser.GameObjects.Text;
  maxQuestions: number = 0;

  private socket: Socket;

  constructor(config: Phaser.Types.Scenes.SettingsConfig, socket: Socket, startingPlayers: any, maxQuestions: number) {
    super(config);
    this.socket = socket;
    this.startingPlayers = startingPlayers;
    this.maxQuestions = maxQuestions;
  }

  preload() {
    this.load.spritesheet('dude', 'assets/games/multiplayergame/Player/player.png', {frameWidth: 48, frameHeight: 48});
    this.load.image('star', 'assets/games/firstgame/assets/star.png');
    this.load.tilemapTiledJSON('map', 'assets/games/multiplayergame/Map/multiplayerMap.json');
    this.load.image('plains', 'assets/games/multiplayergame/Map/plains.png');
    this.load.image('grass', 'assets/games/multiplayergame/Map/grass.png');
    this.load.image('fences', 'assets/games/multiplayergame/Map/fences.png');
  }

  create() {

    let mappy = this.make.tilemap({ key: 'map' });
    let plains = mappy.addTilesetImage( 'plains', 'plains');
    let grass = mappy.addTilesetImage( 'grass', 'grass');
    let fences = mappy.addTilesetImage( 'fences', 'fences');
    this.mapBoundaries.height = mappy.heightInPixels;
    this.mapBoundaries.width = mappy.widthInPixels;
    const rt = this.make.renderTexture({
      width: this.mapBoundaries.width * 2,
      height: this.mapBoundaries.height * 2
    }, true)
    rt.fill(0x000000, 0.8)
    if (plains && grass && fences) {
      let botLayer = mappy.createLayer("bot", [grass, plains], 0, 0)?.setDepth(-1);
      let topLayer = mappy.createLayer("top", [plains, fences], 0, 0)?.setDepth(0);
      if (botLayer) {
        this.matter.world.convertTilemapLayer(botLayer);
        rt.draw(botLayer)
      }
      if (topLayer) {
        topLayer.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(topLayer)
        rt.draw(topLayer)
      }
    }

    for (let id in this.startingPlayers) {
      this.addPlayer(id, this.startingPlayers[id]);
      if (id === this.socket.id ) {
        this.player = this.players[id];
      }
    }



    this.bonusText = this.add.text(10, 10, 'Bonus: None', {  fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 2,
        stroke: true,
        fill: true
      }}).setDepth(5);

    this.questionsLeftText = this.add.text(10, 30, '', {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 2,
        stroke: true,
        fill: true
      }
    }).setDepth(5);

    rt.mask = new Phaser.Display.Masks.GeometryMask(this, this.player.vision)
    rt.mask.invertAlpha = true
    this.cameras.main.startFollow(this.player.sprite, true);

    // fill it with black


    // draw the floorLayer into it
    //
    //
    // set a dark blue tint
    rt.setTint(0x0a2948)
    rt.setDepth(4)


    this.socket.emit('mapBoundaries', this.mapBoundaries);

    this.cameras.main.setBounds(0, 0, this.mapBoundaries.width, this.mapBoundaries.height);
    this.socket.emit('requestCurrentStars');

    this.socket.on('currentStars', (stars) => {
      for (let star of stars) {
        this.addStar(star.x, star.y);
      }
    });

    this.matter.world.setBounds(0, 0, this.mapBoundaries.width, this.mapBoundaries.height);
    this.matter.world.disableGravity();

    this.pointer = this.input.activePointer;

    this.socket.on('gameFinished', (id) => {
      if (this.players[id]) {
        if (id === this.socket.id) {
          this.game.events.emit('requestFinishGame', this.player.playersKilled);
        }
        this.players[id].removePlayer();
        delete this.players[id];
      }
    });


    this.socket.on('attackAnimation', (id) => {
      if (this.players[id]) {
        this.players[id].stopAnimation = true
        this.players[id].sprite.anims.play('attack', true).once('animationcomplete', () => {
          this.players[id].stopAnimation = false;
        });
      }
    });

    this.socket.on('playerMoved', (player) => {
      if (this.players[player.id]) {
        if (player.id !== this.socket.id) {
          this.players[player.id].sprite.setPosition(player.x, player.y);
          this.players[player.id].updateNameText();
        }

        this.players[player.id].sprite.setFlipX(false);
        if (player.direction === 'left' || player.direction === 'idleLeft') {
          this.players[player.id].sprite.setFlipX(true);
        }

        if (!this.players[player.id].stopAnimation) {
          this.players[player.id].sprite.anims.play(player.direction, true)
        }
        this.players[player.id].updateHealthBar();
      }

    });

    this.socket.on('playerStarCollected', (star, playerId) => {
      this.removeStar(star);
      if (this.players[playerId]) {
        this.players[playerId].collectStar();
      }
      if (this.socket.id === playerId) {
        this.game.events.emit('spawnQuestion', this.player.questionsAnswered);
      }
    })

    this.socket.on('playerAttacked', (player) => {
      const attackedPlayer = this.players[player.id];
      if (attackedPlayer) {
        attackedPlayer.health = player.hp;
        attackedPlayer.sprite.setTint(0xff0000);
        this.time.delayedCall(500, () => {
          attackedPlayer.sprite.clearTint();
        });
        attackedPlayer.updateHealthBar();
      }
    });

    this.socket.on('playerKilled', (player) => {
      const killedPlayer = this.players[player.id];
      if (killedPlayer) {
        killedPlayer.health = player.hp;
        killedPlayer.stopAnimation = true;
        killedPlayer.isTargetable = false;
        killedPlayer.sprite.anims.play('death', true).once('animationcomplete', () => {
          killedPlayer.stopAnimation = false;
          killedPlayer.isTargetable = true;
          killedPlayer.sprite.setPosition(player.x, player.y);
        });
      }
      const killerPlayer = this.players[player.killerId];
      if (killerPlayer) {
        killerPlayer.playersKilled = player.killerKills;
      }
    });

    this.socket.on('playerDisconnected', (id) => {
      if (this.players[id]) {
        this.players[id].removePlayer();
        delete this.players[id];
      }
    });

    this.socket.on('playerQuestionAnswered', (id, questionsAnswered) => {
      if (this.players[id]) {
        this.players[id].questionsAnswered = questionsAnswered;
        this.players[id].showPlayer();
      }
    });

    this.socket.on('playerRoleChosen', (role, id, powerUp) => {
      this.updateRole(role, id, powerUp);
    })

    this.socket.on('playerBuffed', (id, attackDamage) => {
      if (this.players[id]) {
        this.players[id].setAttackDamage(attackDamage);
      }
    })

    this.game.events.on('questionAnswered', () => {
      this.socket.emit('playerQuestionAnswered', this.socket.id);
    });

    this.game.events.on('enableMovement', () => {
      if (this.player) {
        this.player.canMove = true;
        this.player.canCollectStar = true;
      }
    })

    this.anims.create({
      key: 'idleLeft',
      frames: this.anims.generateFrameNumbers('dude', { start: 6, end: 11 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'idleRight',
      frames: this.anims.generateFrameNumbers('dude', { start: 6, end: 11 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 24, end: 29 }),
      frameRate: 10,
      repeat: -1
    });


    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 24, end: 29 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'idleUp',
      frames: this.anims.generateFrameNumbers('dude', { start: 12, end: 17 }),
      frameRate: 10,
      repeat: -1
    })


    this.anims.create({
      key: 'idleDown',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('dude', { start: 36, end: 39 }),
      frameRate: 30,
      repeat: 0
    });

    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('dude', { start: 30, end: 35 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('dude', { start: 18, end: 23 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'death',
      frames: this.anims.generateFrameNumbers('dude', { start: 55, end: 56 }),
      frameRate: 10,
      repeat: 0
    })



    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }



    this.input.on('pointerdown', (pointer) => {
      this.socket.emit('requestAttackAnimation', this.socket.id);
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const clickedPlayer = Object.keys(this.players).find(id => {
        if (id === this.socket.id) {
          return false;
        }
        const playerSprite = this.players[id].sprite;
        const distance = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, playerSprite.x, playerSprite.y);
        return (
          distance <= this.player.attackRange &&
          this.players[id].isTargetable &&
          worldPoint.x >= playerSprite.x - playerSprite.width / 2 &&
          worldPoint.x <= playerSprite.x + playerSprite.width / 2 &&
          worldPoint.y >= playerSprite.y - playerSprite.height / 2 &&
          worldPoint.y <= playerSprite.y + playerSprite.height / 2
        );

      });

      if (clickedPlayer && clickedPlayer !== this.player.id) {
        this.socket.emit('playerAttack', { attackerId: this.player.id, targetId: clickedPlayer });
      }
    });

    this.socket.on('spawnStar', (star) => {
      this.addStar(star.x, star.y);
    });

    this.socket.on('healthShared', (players) => {
      players.forEach((player: {id: number, hp: number}) => {
        if (this.players[player.id]) {
          this.players[player.id].health = player.hp;
          this.players[player.id].updateHealthBar();
        }
      })
    })

    this.socket.on('randomPlacePlayers', (player: {id: string, x: number, y: number}) => {
      if (this.players[player.id]) {
        this.players[player.id].sprite.setPosition(player.x, player.y);
      }
    });


    this.socket.emit('clientReady');
  }

  override update() {
    if (this.player) {
      if(this.cursors.left.isDown){
        this.socket.emit('playerMovement',  this.player.move('left'), 'left')
      }
      else if (this.cursors.right.isDown){
        this.socket.emit('playerMovement',  this.player.move('right'), 'right')
      }
      else if (this.cursors.up.isDown){

        this.socket.emit('playerMovement',  this.player.move('up'), 'up')
      }
      else if(this.cursors.down.isDown){
        this.socket.emit('playerMovement',  this.player.move('down'), 'down')
      }
      else {
        this.socket.emit('playerMovement', {x: this.player.sprite.x, y: this.player.sprite.y}, this.player.lastDirection)
      }
      this.player.updateHealthBar();


      if (this.player.vision)
      {
        this.player.vision.x = this.player.sprite.x
        this.player.vision.y = this.player.sprite.y
      }
      this.checkPlayerVisibility();
      this.checkStarVisibility();
      this.player.updateNameText();
      this.bonusText.setPosition(this.cameras.main.scrollX + 10, this.cameras.main.scrollY + 10)
      this.questionsLeftText.setText(`${this.player.questionsAnswered}/${this.maxQuestions}`).setPosition(this.cameras.main.scrollX + 10, this.cameras.main.scrollY + 30);
    }
  }


  updateRole(role: MultiplayerRoles, id: string, powerUp: string){
    if (this.players[id]) {
      this.players[id].role = role;
      this.players[id].addPowerUp(powerUp);
      if (id === this.socket.id) {
        this.bonusText.setText(`Bonus: ${powerUp}`);
      }
    }
  }

  addPlayer(id, player) {
    if (!this.players[id]) {
      const playerSprite = this.matter.add.sprite(player.x, player.y, 'dude').setCircle(12).setOrigin(0.5, 0.65);
      playerSprite.setName(this.socket.id === id ? 'dude' : 'enemy');
      const vision = this.make.graphics({ x: player.x, y: player.y });
      vision.fillStyle(0xffffff, 0.5);
      vision.fillCircle(0, 0, this.visibilityRadius);

      this.players[id] = new Player(playerSprite, player.nickname, 30, id, vision);
    }
  }

  addStar(x, y){
    if (this.matter.add) {
      let star = this.matter.add.image(x, y, 'star');
      star.setName('star');
      star.setSensor(true);
      star.setOnCollide((pair) => {
        const {bodyA, bodyB} = pair;
        if (bodyA.gameObject && bodyB.gameObject) {
          if (bodyA.gameObject.name == 'star' && bodyB.gameObject.name == 'dude' || bodyA.gameObject.name == 'dude' && bodyB.gameObject.name == 'star') {
            if (this.player && this.player.canCollectStar) {
              this.socket.emit('collectStar', star, this.socket.id);
            }
          }
        }
      });
      this.stars.push(star);
    }
  }

  removeStar(star) {
    if (star) {
    const index = this.stars.findIndex(s => s.x === star.x && s.y === star.y);
    if (index !== -1) {
      this.stars[index].destroy();
      this.stars.splice(index, 1);
    }
    }
  }

  checkPlayerVisibility() {
    const visionRadius =  15 * this.player.vision.scale + (this.player.sprite.height / 2)
    for (let id in this.players) {
      if (id !== this.socket.id) {
        const otherPlayer = this.players[id];
        const distance = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, otherPlayer.sprite.x, otherPlayer.sprite.y);
        if (distance <= visionRadius) {
          otherPlayer.unHidePlayer();
        } else {
          otherPlayer.hidePlayer();
        }
      }
    }
  }

  checkStarVisibility(){
    const visionRadius =  15 * this.player.vision.scale + (this.player.sprite.height / 2)
    if (this.stars) {
      this.stars.forEach(star => {
        const distance = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, star.x, star.y);
        if (distance <= visionRadius) {
          star.setVisible(true);
        } else {
          star.setVisible(false);
        }
      });
    }
  }
}
