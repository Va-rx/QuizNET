
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
  attackRange = 50;
  nickname = '';
  questionsToAnswer = 2;
  players: { [id: string]: Player } = {};

  private socket: Socket;

  constructor(config: Phaser.Types.Scenes.SettingsConfig, socket: Socket, nickname: string) {
    super(config);
    this.socket = socket;
    this.nickname = nickname;
  }

  preload() {
    this.load.spritesheet('dude', 'assets/games/multiplayergame/Player/player.png', {frameWidth: 48, frameHeight: 48});
    this.load.image('star', 'assets/games/firstgame/assets/star.png');
    this.load.tilemapTiledJSON('map', 'assets/games/multiplayergame/Map/multiplayerMap.json');
    this.load.image('plains', 'assets/games/multiplayergame/Map/plains.png');
    this.load.image('grass', 'assets/games/multiplayergame/Map/grass.png');
  }

  create() {

    this.socket.emit('requestCurrentPlayers');
    this.socket.emit('requestCurrentStars');
    this.socket.on('currentPlayers', (players) => {
      for (let id in players) {
        this.addPlayer(id, players[id]);
        if (id === this.socket.id ) {
          this.player = this.players[id];
        }
      }
    });

    this.socket.on('currentStars', (stars) => {
      for (let star of stars) {
        this.addStar(star.x, star.y);
      }
    });

    this.matter.world.setBounds();
    this.matter.world.disableGravity();

    this.socket.on('newPlayer', (player) => {
      this.addPlayer(player.id, player);
    });

    this.socket.on('gameFinished', (id) => {
      if (this.players[id]) {
        console.log(`Player ${id} has finished the game. Socket id: ${this.socket.id}`);
        if (id === this.socket.id) {
          this.game.events.emit('requestFinishGame');
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
        this.players[player.id].sprite.setPosition(player.x, player.y);

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
      }
    });

    this.socket.on('playerKilled', (player) => {
      const killedPlayer = this.players[player.id];
      if (killedPlayer) {
        killedPlayer.health = player.hp;
        killedPlayer.stopAnimation = true;
        killedPlayer.sprite.anims.play('death', true).once('animationcomplete', () => {
          killedPlayer.stopAnimation = false;
          killedPlayer.sprite.setPosition(player.x, player.y);
        });
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

    this.game.events.on('questionAnswered', () => {
      this.socket.emit('playerQuestionAnswered', this.socket.id);
    });



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

    let mappy = this.make.tilemap({ key: 'map' });
    let plains = mappy.addTilesetImage( 'plains', 'plains');
    let grass = mappy.addTilesetImage( 'grass', 'grass');
    if (plains && grass) {
      let botLayer = mappy.createLayer("bot", [grass, plains], 0, 0)?.setDepth(-1);
      let topLayer = mappy.createLayer("top", plains, 0, 0);
      if (botLayer) {
        this.matter.world.convertTilemapLayer(botLayer);
      }
      if (topLayer) {
        topLayer.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(topLayer)
      }
    }

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    this.pointer = this.input.activePointer;





    // this.game.events.emit('chooseRole');

    this.input.on('pointerdown', (pointer) => {
      this.socket.emit('requestAttackAnimation', this.socket.id);

      const clickedPlayer = Object.keys(this.players).find(id => {
        const playerSprite = this.players[id].sprite;
        const distance = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, playerSprite.x, playerSprite.y);
        return (
          distance <= 50 &&
          this.players[id].isTargetable &&
          pointer.x >= playerSprite.x - playerSprite.width / 2 &&
          pointer.x <= playerSprite.x + playerSprite.width / 2 &&
          pointer.y >= playerSprite.y - playerSprite.height / 2 &&
          pointer.y <= playerSprite.y + playerSprite.height / 2
        );
      });

      if (clickedPlayer && clickedPlayer !== this.player.id) {
        this.socket.emit('playerAttack', { attackerId: this.player.id, targetId: clickedPlayer });
      }
    });

    this.socket.on('spawnStar', (star) => {
      this.addStar(star.x, star.y);
    });
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
      this.socket.emit('playerMovement', {x: 0, y: 0}, this.player.lastDirection)
    }
    this.player.updateHealthBar();
    this.player.updateNameText();
  }
    //   this.player.nameText.setPosition(this.player.sprite.x, this.player.sprite.y - 50);
    //   this.socket.on('roleChosen', (role) => {
    //     this.updateRole(role);
    //   })
  }


  updateRole(role: MultiplayerRoles){
    this.player.role = role;
    switch (role) {
      case MultiplayerRoles.OFFENSIVE:
        this.player.healthBar.destroy();
        this.player = new OffensivePlayer(this.player.sprite, this.nickname, this.player.id);
        break;
      case MultiplayerRoles.DEFENSIVE:
        this.player.healthBar.destroy();
        this.player = new DefensivePlayer(this.player.sprite, this.nickname, this.player.id);
        break;
      case MultiplayerRoles.NONE:
        break;
    }
  }

  addPlayer(id, position) {
    if (!this.players[id]) {
      const playerSprite = this.matter.add.sprite(position.x, position.y, 'dude').setCircle(12).setOrigin(0.5, 0.65);
      playerSprite.setName(this.socket.id === id ? 'dude' : 'enemy');
      playerSprite.setStatic(true);
      this.players[id] = new Player(playerSprite, this.nickname, 100, id);
    }
  }

  addStar(x, y){
    let star = this.matter.add.image(x, y, 'star');
    star.setName('star');
    star.setSensor(true);
    star.setOnCollide((pair) => {
      const {bodyA, bodyB} = pair;
      if (bodyA.gameObject && bodyB.gameObject) {
        if (bodyA.gameObject.name == 'star' && bodyB.gameObject.name == 'dude' || bodyA.gameObject.name == 'dude' && bodyB.gameObject.name == 'star') {
          this.socket.emit('collectStar',  star, this.socket.id);
        }
      }
    });
    this.stars.push(star);
  }

  removeStar(star) {
    const index = this.stars.findIndex(s => s.x === star.x && s.y === star.y);
    if (index !== -1) {
      this.stars[index].destroy();
      this.stars.splice(index, 1);
    }
  }
}

export class OffensivePlayer extends Player {
  constructor(sprite: Phaser.GameObjects.Sprite, nickname: string, id: string) {
    super(sprite, nickname, 100, id);
  }
}

export class DefensivePlayer extends Player {


  constructor(sprite: Phaser.GameObjects.Sprite, nickname: string, id: string) {
    super(sprite, nickname, 200, id);
  }
}

