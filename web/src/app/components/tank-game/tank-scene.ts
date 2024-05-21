import { bindCallback } from "rxjs";

class EnemyTurret {
  index;
  game;
  player;
  x;
  y;
  turret;
  fireRate = 1000;
  nextFire = 0;
  range = 700;
  health = 100;
  healthBar;
  emptyBody;
  disabled = false;
  constructor(index, game, player, x, y,range) {
    this.range = range;
    this.x = x + game.cameras.main.scrollX;
    this.y = y + game.cameras.main.scrollY;
    //draw circle of turret range, for debug purposes
    //const circle = new Phaser.Geom.Circle(this.x, this.y, this.range);
    //const graphics = game.add.graphics({ lineStyle: { color: 0xff0000 } });
    //graphics.strokeCircleShape(circle);
    ///

    this.game = game;
    this.index = index;
    this.player = player;
    this.turret = game.add.sprite(this.x, this.y, 'tankTurret', 0);
    //console.log(this.turret);
    this.turret.anims.create({
      key: 'shoot',
      frames: this.game.anims.generateFrameNumbers('tankTurret', { start: 0, end: 7 }),
      frameRate: 30,
      repeat: 0
    });
    //use scale to size up
    this.turret.setScale(1.5);
    this.drawHealthBar();

    //create collision zone in x and y matterjs
    this.emptyBody = this.game.matter.add.rectangle(this.x,this.y, 105, 105, { isStatic: true, isSensor: true, label: 'emptyBody' });
    if (this.emptyBody) {
      //check if empty body exists
      this.emptyBody.onCollideCallback = (pair) => {
        const { bodyA, bodyB } = pair;

        if (bodyB.gameObject) {
          if (bodyB.gameObject.name == 'bulletPlayer') {
            //console.log('Player bullet collided with Turret');
            if (bodyB.gameObject.label == 'bullet') {
              //PLAYER HIT DAMAGE = 10
              this.health -= 20;
              bodyB.gameObject.destroy();
              this.updateHealthBar();
            }
            else {
              //PLAYER HIT DAMAGE = 10
              this.health -= 20;
              bodyB.gameObject.destroy();
              this.updateHealthBar();
            }
          }
        }
      }
    }
  }

  drawHealthBar() {
    this.healthBar = this.game.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    if (this.health <= 0) {
      this.turret.destroy();
      this.healthBar.clear();
      //destroy whole object
      this.game.matter.world.remove(this.emptyBody);
      this.disabled = true;
      return;
    }
    this.healthBar.clear();
    const barWidth = 50;
    const barHeight = 5;
    const barX = this.turret.x - barWidth / 2;
    const barY = this.turret.y + 40;
    const remainingWidth = (this.health / 100) * barWidth;
    this.healthBar.fillStyle(0x00ff00);
    this.healthBar.fillRect(barX, barY, remainingWidth, barHeight);
  }

  update() {
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.turret.x, this.turret.y) - Phaser.Math.PI2 / 4;
    this.turret.rotation = angle;


  }

  canFire(playerX, playerY) {
    const distance = Phaser.Math.Distance.Between(this.turret.x, this.turret.y, playerX, playerY);
    return distance < this.range;
  }

  fire() {
    if (!this.disabled) {
      if (this.game.time.now > this.nextFire && this.canFire(this.player.x, this.player.y)) {
        this.turret.anims.play('shoot', true);
        this.nextFire = this.game.time.now + this.fireRate;
        //var bullet = this.bullets.getFirst();
        var bullet = this.game.matter.add.image(128, 128, 'bullet');
        bullet.setPosition(this.turret.x, this.turret.y);
        bullet.setSensor(true);
        //bullet.setMass(0.000000000000000000000000000001);
        //bullet.thrust(0.0002);
        //bullet.setVelocityX(-10);
        //bullet.setVelocityY(-10);
        const deltax = this.player.x - bullet.x;
        const deltay = this.player.y - bullet.y;
        const bulletSpeed = 50;
        const normalizedDeltax = deltax / Math.sqrt(deltax ** 2 + deltay ** 2);
        const normalizedDeltay = deltay / Math.sqrt(deltax ** 2 + deltay ** 2);
        const xVelocity = normalizedDeltax * bulletSpeed;
        const yVelocity = normalizedDeltay * bulletSpeed;

        bullet.setVelocity(xVelocity, yVelocity);
        //bullet.setCollidesWith(0);
        bullet.label = "bullet";

        bullet.setOnCollide(pair => {
          if (pair.bodyA.gameObject && pair.bodyB.gameObject) {
            if ((pair.bodyB.gameObject.label == 'bullet' && pair.bodyA.gameObject.label == 'stationaryObject') || (pair.bodyA.gameObject.label == 'bullet' && pair.bodyB.gameObject.label == 'stationaryObject')) {
              if (this.turret.x + 55 < pair.bodyA.gameObject.body.position.x || this.turret.y + 55 < pair.bodyA.gameObject.body.position.y || this.turret.x - 55 > pair.bodyA.gameObject.body.position.x || this.turret.y - 55 > pair.bodyA.gameObject.body.position.y) {
                if (pair.bodyB.gameObject.label == 'bullet') {
                  pair.bodyB.gameObject.destroy();
                }
                else {
                  pair.bodyA.gameObject.destroy();
                }
              }
            }
          }
        });
      }
    }
  }


}

class Checkpoint {
  x;
  y;
  checkpoint;
  game;
  id;
  player;
  finsihsed = false;
  constructor(x, y,game,id,player) {
    this.x = x;
    this.y = y;
    this.game = game;
    //create empty body for collision detection
    this.checkpoint = this.game.matter.add.rectangle(this.x,this.y, 50, 50, { isStatic: true, isSensor: true, label: 'checkpoint' });
    this.id = id;
    this.player = player;
    if (this.checkpoint) {
      //check if empty body exists
      this.checkpoint.onCollideCallback = (pair) => {
        const { bodyA, bodyB } = pair;
        if (bodyA.gameObject) {
          if (bodyA.gameObject.label == 'tankPlayer') {
            console.log('LEVEL '+ id +' COMPLETED, QUESSTION HERE');

            //emit level complete event
            if(!this.finsihsed){
            this.game.events.emit('levelComplete', this.id);
            }
            this.finsihsed = true;
            this.game.matter.world.remove(this.checkpoint);
          }
        }
      }
    }
  }
}


export default class Tanks extends Phaser.Scene {

  vec;
  keys;
  tankTurret;
  tankBody;
  currentSpeed = 0;
  bullets; //player bullets group
  fireRate = 200;
  nextFire = 0;
  testEnemyTurret;
  cursors;
  playerAmmo = 100;
  playerHealth = 1000000;
  playerHealthBar;
  ammoText;
  deaths = 0;
  enemyTurrets:EnemyTurret[]=[];

  preload() {
    this.load.tilemapTiledJSON('map', 'assets/games/tankgame/MAP/tanktest.json');
    this.load.spritesheet('terrain', 'assets/games/tankgame/Terrains/terrain.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('tankBody', 'assets/games/tankgame/Camo/Bodies/body_tracks.png');
    this.load.spritesheet('tankTurret', 'assets/games/tankgame/Camo/Weapons/turret_01_mk1.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('tankTurret2', 'assets/games/tankgame/Camo/Weapons/turret_01_mk4.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image('bullet', 'assets/games/firstgame/assets/bomb.png');
    this.load.spritesheet('towers_walls_blank', 'assets/games/tankgame/Camo/Towers/towers_walls_blank.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('ammo', 'assets/games/tankgame/ammo.png');
    this.load.image('health', 'assets/games/tankgame/health.png');
  }

  create() {
    //console.log(this.scene);
    if (this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys('W,S,A,D');
    }

    //shwo fps

    // Generate a tilemap
    let mappy = this.make.tilemap({ key: 'map' });
    let terrain = mappy.addTilesetImage('terrain', 'terrain');
    let towers = mappy.addTilesetImage('towers_walls_blank', 'towers_walls_blank');
    if (towers && terrain) {
      let topLayer = mappy.createLayer('TOP', towers, 0, 0);
      let bottomLayer = mappy.createLayer('BOTTOM', terrain, 0, 0)?.setDepth(-1);
      if (topLayer) {
        topLayer.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(topLayer);
        this.matter.world.getAllBodies().forEach(body => {
          // Set the label property of each body
          body.gameObject.label = 'stationaryObject';
        });
      }
    }


    this.spawnPickups.apply(this);
    this.events.emit('updateHealth', this.playerHealth);
    this.events.emit('updateAmmo', this.playerAmmo);


    //



    this.tankBody = this.matter.add.image(128, 128, 'tankBody');
    this.tankBody.setAngle(-90);
    this.tankBody.setFrictionAir(0.3);
    this.tankBody.setMass(1000);
    this.tankBody.setFriction(0.3);
    this.tankBody.label = "tankPlayer";
    //this.cameras.main.startFollow(this.tankBody, true);
    this.cameras.main.setBounds(0, 0, 10000,800); // Set your game world bounds
    this.cameras.main.startFollow(this.tankBody, true);
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }
    this.vec = this.matter.vector;

    this.tankTurret = this.add.sprite(128, 128, 'tankTurret', 0);

    this.input.on('pointermove', (pointer) => {
      const angle = Phaser.Math.Angle.Between(this.tankTurret.x, this.tankTurret.y, pointer.x + this.cameras.main.scrollX, pointer.y + this.cameras.main.scrollY) + Phaser.Math.PI2 / 4;
      this.tankTurret.rotation = angle;
    });

    this.tankTurret.anims.create({
      key: 'shoot',
      frames: this.anims.generateFrameNumbers('tankTurret', { start: 0, end: 7 }),
      frameRate: 30,
      repeat: 0
    });

    this.input.on('pointerdown', () => {
     //x,y plus camera scroll
       console.log(this.input.activePointer.x + this.cameras.main.scrollX, this.input.activePointer.y + this.cameras.main.scrollY);
      if (this.time.now > this.nextFire) {
        this.tankTurret.anims.play('shoot', true);
      }
    });

    //this.testEnemyTurret = new EnemyTurret(0, this, this.tankBody, 800, 575);
    /////////////////////ENERMY TURRETS////////////////////////
    ////////////////////LEVEL 1///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(0, this, this.tankBody, 800, 575, 450));
    this.enemyTurrets.push(new EnemyTurret(1, this, this.tankBody, 435, 270,300));
    this.enemyTurrets.push(new EnemyTurret(2, this, this.tankBody, 640, 270,300));
    this.enemyTurrets.push(new EnemyTurret(3, this, this.tankBody, 1120, 115,700));
    this.enemyTurrets.push(new EnemyTurret(4, this, this.tankBody, 60, 430,300));
    this.enemyTurrets.push(new EnemyTurret(5, this, this.tankBody, 286, 705,400));
    new Checkpoint(1270, 270,this,1,this.tankBody);
    ////////////////////LEVEL 2///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(6, this, this.tankBody,1501, 381, 300));
    this.enemyTurrets.push(new EnemyTurret(7, this, this.tankBody,1502, 590, 300));
    this.enemyTurrets.push(new EnemyTurret(8, this, this.tankBody,1757, 240, 300));
    this.enemyTurrets.push(new EnemyTurret(9, this, this.tankBody,1760, 430, 300));
    this.enemyTurrets.push(new EnemyTurret(10, this, this.tankBody,2015, 493, 3000));
    new Checkpoint(2109, 675,this,2,this.tankBody);
    ////////////////////LEVEL 3///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(11, this, this.tankBody, 2319, 190, 300));
    this.enemyTurrets.push(new EnemyTurret(12, this, this.tankBody, 2350, 557, 300));
    this.enemyTurrets.push(new EnemyTurret(13, this, this.tankBody, 2509, 559, 300));
    this.enemyTurrets.push(new EnemyTurret(14, this, this.tankBody, 2668, 559, 300));
    new Checkpoint(2894, 506,this,3,this.tankBody);
    ////////////////////LEVEL 4///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(15, this, this.tankBody, 3117, 591, 300));
    this.enemyTurrets.push(new EnemyTurret(16, this, this.tankBody, 3375, 237, 300));
    this.enemyTurrets.push(new EnemyTurret(17, this, this.tankBody, 3628, 494, 300));
    this.enemyTurrets.push(new EnemyTurret(18, this, this.tankBody, 3373, 429, 300));
    new Checkpoint(3722, 673,this,4,this.tankBody);
    ////////////////////LEVEL 5///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(19, this, this.tankBody, 4046, 416, 450));
    this.enemyTurrets.push(new EnemyTurret(20, this, this.tankBody, 3807, 110, 450));
    new Checkpoint(4123, 163,this,5,this.tankBody);

    const offset=2962;

    ////////////////////LEVEL 6///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(6, this, this.tankBody,1501+offset, 381, 300));
    this.enemyTurrets.push(new EnemyTurret(7, this, this.tankBody,1502+offset, 590, 300));
    this.enemyTurrets.push(new EnemyTurret(8, this, this.tankBody,1757+offset, 240, 300));
    this.enemyTurrets.push(new EnemyTurret(9, this, this.tankBody,1760+offset, 430, 300));
    this.enemyTurrets.push(new EnemyTurret(10, this, this.tankBody,2015+offset, 493, 3000));
    new Checkpoint(2109+offset, 675,this,6,this.tankBody);
    ////////////////////LEVEL 7///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(11, this, this.tankBody, 2319+offset, 190, 300));
    this.enemyTurrets.push(new EnemyTurret(12, this, this.tankBody, 2350+offset, 557, 300));
    this.enemyTurrets.push(new EnemyTurret(13, this, this.tankBody, 2509+offset, 559, 300));
    this.enemyTurrets.push(new EnemyTurret(14, this, this.tankBody, 2668+offset, 559, 300));
    new Checkpoint(2894+offset, 506,this,7,this.tankBody);
    ////////////////////LEVEL 8///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(15, this, this.tankBody, 3117+offset, 591, 300));
    this.enemyTurrets.push(new EnemyTurret(16, this, this.tankBody, 3375+offset, 237, 300));
    this.enemyTurrets.push(new EnemyTurret(17, this, this.tankBody, 3628+offset, 494, 300));
    this.enemyTurrets.push(new EnemyTurret(18, this, this.tankBody, 3373+offset, 429, 300));
    new Checkpoint(3722+offset, 673,this,8,this.tankBody);
    ////////////////////LEVEL 9///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(19, this, this.tankBody, 4046+offset, 416, 450));
    this.enemyTurrets.push(new EnemyTurret(20, this, this.tankBody, 3807+offset, 110, 450));
    new Checkpoint(4123+offset, 163,this,9,this.tankBody);
    ///////////////////////////////////////////////////////////
    this.matter.world.on('collisionstart', (event) => {
      const pairs = event.pairs;
      pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        if (bodyA.gameObject && bodyB.gameObject) {
          if (bodyA.gameObject.name == 'bulletPlayer' && bodyB.gameObject.label == 'stationaryObject' || bodyA.gameObject.label == 'stationaryObject' && bodyB.gameObject.name == 'bulletPlayer') {
            //console.log('Player bullet collided with stationary object');
            if (bodyA.gameObject.label == 'bullet') {

              bodyA.gameObject.destroy();

            }
            else {
              bodyB.gameObject.destroy();

            }
          }
        }

      });
    });

  }



  override update() {
    this.tankTurret.x = this.tankBody.x;
    this.tankTurret.y = this.tankBody.y;

    //this.testEnemyTurret.update();
    //this.testEnemyTurret.fire();
    this.enemyTurrets.forEach(turret => {
      turret.update();
      turret.fire();
    });

    const point1 = this.tankBody.getTopRight();
    const point2 = this.tankBody.getBottomRight();
    const speed = 3;
    const angle = this.vec.angle(point1, point2);

    if (this.input.activePointer.isDown) {
      this.playerFire();
    }

    if (this.keys.W.isDown) {
      this.tankBody.thrust(speed);
    }
    else if (this.keys.S.isDown) {
      this.tankBody.thrustBack(speed);

      if (this.keys.A.isDown) {
        this.tankBody.rotation += 0.05;
      }
      else if (this.keys.D.isDown) {
        this.tankBody.rotation -= 0.05;
      }
    }
    if (this.keys.A.isDown && !this.keys.S.isDown) {
      this.tankBody.rotation -= 0.05;
    }
    else if (this.keys.D.isDown && !this.keys.S.isDown) {
      this.tankBody.rotation += 0.05;
    }



    this.matter.overlap(this.tankBody.body, undefined, (bodyA: any, bodyB: any) => {//potencjalny problem z pamiecia jak pocisk nie trafi w czolg to sie nie usuwa
      if (bodyA.gameObject && bodyB.gameObject) {
        if ((bodyA.gameObject.label == 'tankPlayer' && bodyB.gameObject.label == 'bullet') ||
          (bodyA.gameObject.label == 'bullet' && bodyB.gameObject.label == 'tankPlayer')) {
          //console.log('Tank hit by bullet!');
          if (bodyB.gameObject.label == 'bullet') {
            bodyB.gameObject.destroy();
            //TURRET HIT DAMAGE = 10
            this.playerHealth -= 25;
            if(this.playerHealth <= 0){
              this.playerHealth = 100;
              this.deaths++;
              //emit death event
              this.events.emit('updateDeaths', this.deaths);
              this.tankBody.setPosition(128, 128);
            }
            this.events.emit('updateHealth', this.playerHealth);
          }
          else {
            bodyA.gameObject.destroy();
            this.playerHealth -= 25;
            if(this.playerHealth <= 0){
              this.playerHealth = 100;
              this.deaths++;
              //emit death event
              this.events.emit('updateDeaths', this.deaths);
              this.tankBody.setPosition(128, 128);
            }
            this.events.emit('updateHealth', this.playerHealth);
          }
        }
      }
    })






  }

  playerFire() {
    if (this.time.now > this.nextFire) {
      this.playerAmmo--;
      this.events.emit('updateAmmo', this.playerAmmo);
      this.nextFire = this.time.now + this.fireRate;
      //var bullet = this.bullets.getFirst();
      var bullet = this.matter.add.image(128, 128, 'bullet');
      bullet.setPosition(this.tankBody.x, this.tankBody.y);
      bullet.setSensor(true);
      //bullet.setMass(0.000000000000000000000000000001);
      //bullet.thrust(0.0002);
      //bullet.setVelocityX(-10);
      //bullet.setVelocityY(-10);
      const deltax = this.input.activePointer.x + this.cameras.main.scrollX - bullet.x;
      const deltay = this.input.activePointer.y + this.cameras.main.scrollY - bullet.y;
      const bulletSpeed = 50;
      const normalizedDeltax = deltax / Math.sqrt(deltax ** 2 + deltay ** 2);
      const normalizedDeltay = deltay / Math.sqrt(deltax ** 2 + deltay ** 2);
      const xVelocity = normalizedDeltax * bulletSpeed;
      const yVelocity = normalizedDeltay * bulletSpeed;

      bullet.setVelocity(xVelocity, yVelocity);
      //bullet.setCollidesWith(0);
      bullet.setName("bulletPlayer");




    }
  }

  addHealth() {
    this.playerHealth += 50;
    if(this.playerHealth > 100){
      this.playerHealth = 100;
    }
    //emit event to update health bar
    this.events.emit('updateHealth', this.playerHealth);
  }

  addAmmo() {
    this.playerAmmo += 10;
    this.events.emit('updateAmmo', this.playerAmmo);
  }

  spawnPickups() {
    //ammo pickups
    const offset=2962;

    let cords = [[450, 450],[550,420],[1427,103],[2679,729],[3099,368],[3769,540],[1427+offset,103],[2679+offset,729],[3099+offset,368],[3769+offset,540]];
    cords.forEach(cord => {
      let ammo = this.matter.add.image(cord[0], cord[1], 'ammo');
      ammo.setName('ammo');
      ammo.setSensor(true);
      ammo.setOnCollide((pair) => {
        const { bodyA, bodyB } = pair;
        if (bodyA.gameObject && bodyB.gameObject) {
          if (bodyA.gameObject.name == 'ammo' && bodyB.gameObject.label == 'tankPlayer' || bodyA.gameObject.label == 'tankPlayer' && bodyB.gameObject.name == 'ammo') {
            //console.log('Player collided with ammo');
            this.addAmmo();
            if (bodyA.gameObject.label != 'tankPlayer') {
              bodyA.gameObject.destroy();
            }
            else {
              bodyB.gameObject.destroy();
            }
          }
        }
      });
    });
    //Health pickups
    cords = [ [400, 430],[500, 450],[1477, 153],[2582,739],[2964,276],[3832,585],[1477+offset, 153],[2582+offset,739],[2964+offset,276],[3832+offset,585]];
    cords.forEach(cord => {
      let health = this.matter.add.image(cord[0], cord[1], 'health');
      health.setName('health');
      health.setSensor(true);
      health.setOnCollide((pair) => {
        const { bodyA, bodyB } = pair;
        if (bodyA.gameObject && bodyB.gameObject) {
          if (bodyA.gameObject.name == 'health' && bodyB.gameObject.label == 'tankPlayer' || bodyA.gameObject.label == 'tankPlayer' && bodyB.gameObject.name == 'health') {
            //console.log('Player collided with health');
            this.addHealth();
            if (bodyA.gameObject.label != 'tankPlayer') {
              bodyA.gameObject.destroy();
            }
            else {
              bodyB.gameObject.destroy();
            }
          }
        }
      });
    });

  }




}

export class UIScene extends Phaser.Scene {
  score: number;
  ammoText;
  playerHealthBar;
  levelsCompleted = 0;
  constructor() {
    super({ key: 'UIScene', active: true });

    this.score = 0;
  }

  create() {
    //  Our Text object to display the Score

    const ourGame = this.scene.get('default');
    //console.log(this.scene);
    this.playerHealthBar = this.add.graphics();
    ourGame.events.on('updateHealth', this.updatePlayerHealthBar, this);
    //var text = this.add.text(10, 10, 'Pointer Position: (0, 0)', { font: '16px Arial', color: '#ffffff' });

    // Listen for pointer movement
    ourGame.input.on('pointermove', function (pointer) {
      //text.setText('Pointer Position: (' + pointer.x + ', ' + pointer.y + ')');
    });

    ourGame.events.on('updateAmmo', this.updateAmmoCount, this);
    // Display ammo count
    this.ammoText = this.add.text(
      Number(this.sys.game.config.width) - 200,
      50,
      'Ammo: ',
      {
        fontSize: '20px',
        color: '#fff'
      }
    );

    //dispaly death count
    this.add.text(Number(this.sys.game.config.width) - 200, 80, 'Deaths: 0', {
      fontSize: '20px',
      color: '#fff'
    });

    ourGame.events.on('updateDeaths', this.updateDeaths, this);


    //dispaly level complete
    this.add.text(Number(this.sys.game.config.width) - 200, 110, 'Levels:', {
      fontSize: '20px',
      color: '#fff'
    });

    ourGame.events.on('levelComplete', (id) => {
      this.levelsCompleted++;
      const levelText = this.children.list[3] as Phaser.GameObjects.Text;
      levelText.setText('Levels:'+this.levelsCompleted);
    });
  }

  updateDeaths(deaths) {
    const deathsText = this.children.list[2] as Phaser.GameObjects.Text;
    deathsText.setText('Deaths: ' + deaths);
  }
  updateAmmoCount(playerAmmo) {
    this.ammoText.setText('Ammo: ' + playerAmmo);
  }
  updatePlayerHealthBar(playerHealth) {
    const barWidth = 200;
    const barHeight = 20;
    const barX = Number(this.sys.game.config.width) - barWidth - 20;
    const barY = 20;
    const remainingWidth = (playerHealth / 100) * barWidth;

    this.playerHealthBar.clear();
    this.playerHealthBar.fillStyle(0xff0000);
    this.playerHealthBar.fillRect(barX, barY, remainingWidth, barHeight);
  }
}


