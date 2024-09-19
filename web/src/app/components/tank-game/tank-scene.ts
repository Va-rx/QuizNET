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
  enemyShot;
  disabled = false;


  constructor(index, game, player, x, y, range) {
    this.range = range;
    this.x = x + game.cameras.main.scrollX;
    this.y = y + game.cameras.main.scrollY;
    //draw circle of turret range, for debug purposes
    //const circle = new Phaser.Geom.Circle(this.x, this.y, this.range);
    //const graphics = game.add.graphics({ lineStyle: { color: 0xff0000 } });
    //graphics.strokeCircleShape(circle);

    this.enemyShot = game.sound.add('enemyShot', {
      volume: 0.1
    })
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
    this.emptyBody = this.game.matter.add.rectangle(this.x, this.y, 105, 105, { isStatic: true, isSensor: true, label: 'emptyBody' });
    if (this.emptyBody) {
      //check if empty body exists
      this.emptyBody.onCollideCallback = (pair) => {
        const { bodyA, bodyB } = pair;

        if (bodyB.gameObject) {
          if (bodyB.gameObject.name == 'bulletPlayer') {
            //console.log('Player bullet collided with Turret');
            if (bodyB.gameObject.label == 'bullet') {
              //PLAYER HIT DAMAGE = 10
              this.health -= this.game.playerBulletDmg;
              bodyB.gameObject.destroy();
              this.updateHealthBar();
            }
            else {
              //PLAYER HIT DAMAGE = 10
              this.health -= this.game.playerBulletDmg;
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
      this.game.turretsKilled += 1;
      this.game.BARTLE_turrets_destroyed+=1;
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
        this.enemyShot.play();
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
  constructor(x, y, game, id, player) {
    this.x = x;
    this.y = y;
    this.game = game;
    //create empty body for collision detection
    this.checkpoint = this.game.matter.add.rectangle(this.x, this.y, 50, 50, { isStatic: true, isSensor: true, label: 'checkpoint' });
    this.id = id;
    this.player = player;
    if (this.checkpoint) {
      //check if empty body exists
      this.checkpoint.onCollideCallback = (pair) => {
        const { bodyA, bodyB } = pair;
        if (bodyA.gameObject) {
          if (bodyA.gameObject.label == 'tankPlayer') {
            console.log('LEVEL ' + id + ' COMPLETED, QUESSTION HERE!');

            //emit level complete event
            if (!this.finsihsed) {
              this.game.tankSound.pause()
              this.game.tankSound.play()
              this.game.tankSound.volume = 0.1;
              this.game.events.emit('levelComplete', this.id);
              this.game.game.events.emit('levelCompleted_SpawnQuestion', this.id);

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
  turretsKilled = 0;
  pickupsFound = 0;
  allTurrets = 0;
  allPickups = 0;
  bonus = 0;
  vec;
  keys;
  tankTurret;
  tankBody;
  currentSpeed = 0;
  bullets; //player bullets group
  fireRate = 500;
  nextFire = 0;
  testEnemyTurret;
  cursors;
  playerAmmo = 100;
  playerHealth = 1000000;
  // playerHealth=100;
  playerHealthBar;
  ammoText;
  deaths = 0;
  enemyTurrets: EnemyTurret[] = [];
  tankSound;
  tankShot;
  reloadTimerGraphics;
  reloadTimer = 0;
  playerBulletDmg = 20;
  pickedUpHealth = 0;

  ///////BARTLE STATS///////
  BARTLE_stars_picked=0;
  BARTLE_medkits_shared=0;
  BARTLE_turrets_destroyed=0;

  preload() {
    this.load.audio('tankRiding', 'assets/games/tankgame/sounds/engine_heavy_loop.ogg');
    this.load.audio('tankShot', 'assets/games/tankgame/sounds/heavy_canon.ogg');
    this.load.audio('enemyShot', 'assets/games/tankgame/sounds/heavy_canon.ogg');
    this.load.tilemapTiledJSON('map', 'assets/games/tankgame/MAP/tanktest.json');
    this.load.spritesheet('terrain', 'assets/games/tankgame/Terrains/terrain.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('tankBody', 'assets/games/tankgame/Camo/Bodies/body_tracks.png');
    this.load.spritesheet('tankTurret', 'assets/games/tankgame/Camo/Weapons/turret_01_mk1.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('tankTurret2', 'assets/games/tankgame/Camo/Weapons/turret_01_mk4.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image('bullet', 'assets/games/firstgame/assets/bomb.png');
    this.load.spritesheet('towers_walls_blank', 'assets/games/tankgame/Camo/Towers/towers_walls_blank.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('ammo', 'assets/games/tankgame/ammo.png');
    this.load.image('star', 'assets/games/firstgame/assets/star.png');
    this.load.image('health', 'assets/games/tankgame/health.png');
  }

  create() {
    this.createTutorialDialog();
    this.game.events.on("receiveHealth_inPhaser",(userName)=>{
      console.log("IN GAME RECEIVE MEDKIT WORKS"+userName)
      this.pickedUpHealth+=1;
      this.events.emit("updateMedkits",this.pickedUpHealth)
      this.drawDialogMsg(userName);

    })
    this.tankSound = this.sound.add('tankRiding', {
      loop: true,
      volume: 0.5,
      rate: 0.5,
    });
    this.tankShot = this.sound.add('tankShot', {
      volume: 1
    })

    if (this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys('W,S,A,D,F,E');
    }

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
          body.gameObject.label = 'stationaryObject';
        });
      }
    }


    this.spawnPickups.apply(this);
    this.events.emit('updateHealth', this.playerHealth);
    this.events.emit('updateAmmo', this.playerAmmo);

    this.tankBody = this.matter.add.image(128, 128, 'tankBody');
    this.tankBody.setAngle(-90);
    this.tankBody.setFrictionAir(0.3);
    this.tankBody.setMass(1000);
    this.tankBody.setFriction(0.3);
    this.tankBody.label = "tankPlayer";
    //this.cameras.main.startFollow(this.tankBody, true);
    this.cameras.main.setBounds(0, 0, 10000, 800);
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
    this.enemyTurrets.push(new EnemyTurret(1, this, this.tankBody, 435, 270, 300));
    this.enemyTurrets.push(new EnemyTurret(2, this, this.tankBody, 640, 270, 300));
    this.enemyTurrets.push(new EnemyTurret(3, this, this.tankBody, 1120, 115, 700));
    this.enemyTurrets.push(new EnemyTurret(4, this, this.tankBody, 60, 430, 300));
    this.enemyTurrets.push(new EnemyTurret(5, this, this.tankBody, 286, 705, 400));
    new Checkpoint(1270, 270, this, 1, this.tankBody);
    ////////////////////LEVEL 2///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(6, this, this.tankBody, 1501, 381, 300));
    this.enemyTurrets.push(new EnemyTurret(7, this, this.tankBody, 1502, 590, 300));
    this.enemyTurrets.push(new EnemyTurret(8, this, this.tankBody, 1757, 240, 300));
    this.enemyTurrets.push(new EnemyTurret(9, this, this.tankBody, 1760, 430, 300));
    this.enemyTurrets.push(new EnemyTurret(10, this, this.tankBody, 2015, 493, 300));
    new Checkpoint(2109, 675, this, 2, this.tankBody);
    ////////////////////LEVEL 3///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(11, this, this.tankBody, 2319, 190, 300));
    this.enemyTurrets.push(new EnemyTurret(12, this, this.tankBody, 2350, 557, 300));
    this.enemyTurrets.push(new EnemyTurret(13, this, this.tankBody, 2509, 559, 300));
    this.enemyTurrets.push(new EnemyTurret(14, this, this.tankBody, 2668, 559, 300));
    new Checkpoint(2894, 506, this, 3, this.tankBody);
    ////////////////////LEVEL 4///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(15, this, this.tankBody, 3117, 591, 300));
    this.enemyTurrets.push(new EnemyTurret(16, this, this.tankBody, 3375, 237, 300));
    this.enemyTurrets.push(new EnemyTurret(17, this, this.tankBody, 3628, 494, 300));
    this.enemyTurrets.push(new EnemyTurret(18, this, this.tankBody, 3373, 429, 300));
    new Checkpoint(3722, 673, this, 4, this.tankBody);
    ////////////////////LEVEL 5///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(19, this, this.tankBody, 4046, 416, 450));
    this.enemyTurrets.push(new EnemyTurret(20, this, this.tankBody, 3807, 110, 450));
    new Checkpoint(4123, 163, this, 5, this.tankBody);

    const offset = 2962;

    ////////////////////LEVEL 6///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(6, this, this.tankBody, 1501 + offset, 381, 300));
    this.enemyTurrets.push(new EnemyTurret(7, this, this.tankBody, 1502 + offset, 590, 300));
    this.enemyTurrets.push(new EnemyTurret(8, this, this.tankBody, 1757 + offset, 240, 300));
    this.enemyTurrets.push(new EnemyTurret(9, this, this.tankBody, 1760 + offset, 430, 300));
    this.enemyTurrets.push(new EnemyTurret(10, this, this.tankBody, 2015 + offset, 493, 300));
    new Checkpoint(2109 + offset, 675, this, 6, this.tankBody);
    ////////////////////LEVEL 7///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(11, this, this.tankBody, 2319 + offset, 190, 300));
    this.enemyTurrets.push(new EnemyTurret(12, this, this.tankBody, 2350 + offset, 557, 300));
    this.enemyTurrets.push(new EnemyTurret(13, this, this.tankBody, 2509 + offset, 559, 300));
    this.enemyTurrets.push(new EnemyTurret(14, this, this.tankBody, 2668 + offset, 559, 300));
    new Checkpoint(2894 + offset, 506, this, 7, this.tankBody);
    ////////////////////LEVEL 8///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(15, this, this.tankBody, 3117 + offset, 591, 300));
    this.enemyTurrets.push(new EnemyTurret(16, this, this.tankBody, 3375 + offset, 237, 300));
    this.enemyTurrets.push(new EnemyTurret(17, this, this.tankBody, 3628 + offset, 494, 300));
    this.enemyTurrets.push(new EnemyTurret(18, this, this.tankBody, 3373 + offset, 429, 300));
    new Checkpoint(3722 + offset, 673, this, 8, this.tankBody);
    ////////////////////LEVEL 9///////////////////////////////
    this.enemyTurrets.push(new EnemyTurret(19, this, this.tankBody, 4046 + offset, 416, 450));
    this.enemyTurrets.push(new EnemyTurret(20, this, this.tankBody, 3807 + offset, 110, 450));
    new Checkpoint(4123 + offset, 163, this, 9, this.tankBody);
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


    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.tankSound.play();


    this.reloadTimerGraphics = this.scene.get("UIScene").add.graphics();
    this.updateReloadTimer(1);

    this.allTurrets = this.enemyTurrets.length;
  }



  override update() {
    if (this.tankBody.y > 800) {
      this.cameras.main.setBounds(0, 0, 10000, 1100);
    }
    else {
      this.cameras.main.setBounds(0, 0, 10000, 800);
    }
    this.bonus = this.calculateBonus();
    if (this.reloadTimer + 0.04 <= 1) {
      this.reloadTimer += 0.04;
      this.updateReloadTimer(this.reloadTimer);
    } else {
      this.updateReloadTimer(1);
    }
    //console.log(this.tankSound.rate,this.tankSound.volume)
    this.tankTurret.x = this.tankBody.x;
    this.tankTurret.y = this.tankBody.y;
    //this.testEnemyTurret.update();
    //this.testEnemyTurret.fire();
    this.enemyTurrets.forEach(turret => {
      turret.update();
      turret.fire();
    });

    if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
      if(this.pickedUpHealth>0){
        this.drawDialogMsg_share()
        this.game.events.emit("shareHealth");
        this.BARTLE_medkits_shared+=1;
        this.pickedUpHealth-=1;
        this.events.emit("updateMedkits",this.pickedUpHealth)
      }
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)){
      if(this.pickedUpHealth>0){
        this.addHealth();
        this.pickedUpHealth-=1;
        this.events.emit("updateMedkits",this.pickedUpHealth)
      }
    }

    const point1 = this.tankBody.getTopRight();
    const point2 = this.tankBody.getBottomRight();
    const speed = 3;
    const angle = this.vec.angle(point1, point2);
    const idle_audio_rate = 0.5;
    const idle_audio_volume = 0.5;
    const max_audio_volume = 1;
    const max_audio_rate = 1;

    if (this.input.activePointer.isDown) {
      this.playerFire();
    }

    if (this.keys.W.isDown) {
      this.tankBody.thrust(speed);
      if (this.tankSound.rate < max_audio_rate) {
        this.tankSound.rate += 0.01
      }
      if (this.tankSound.volume < max_audio_volume) {
        this.tankSound.volume += 0.01
      }
    }
    else if (this.keys.S.isDown) {
      this.tankBody.thrustBack(speed);
      if (this.tankSound.rate < max_audio_rate) {
        this.tankSound.rate += 0.01
      }
      if (this.tankSound.volume < max_audio_volume) {
        this.tankSound.volume += 0.01
      }
      if (this.keys.A.isDown) {
        this.tankBody.rotation += 0.05;
      }
      else if (this.keys.D.isDown) {
        this.tankBody.rotation -= 0.05;
      }
    }
    else {
      if (this.tankSound.rate > idle_audio_rate) {
        this.tankSound.rate -= 0.01
      }
      if (this.tankSound.volume > idle_audio_volume) {
        this.tankSound.volume -= 0.01
      }
    }
    if (this.keys.A.isDown && !this.keys.S.isDown) {
      this.tankBody.rotation -= 0.05;
    }
    else if (this.keys.D.isDown && !this.keys.S.isDown) {
      this.tankBody.rotation += 0.05;
    }



    this.matter.overlap(this.tankBody.body, undefined, (bodyA: any, bodyB: any) => {
      if (bodyA.gameObject && bodyB.gameObject) {
        if ((bodyA.gameObject.label == 'tankPlayer' && bodyB.gameObject.label == 'bullet') ||
          (bodyA.gameObject.label == 'bullet' && bodyB.gameObject.label == 'tankPlayer')) {
          //console.log('Tank hit by bullet!');
          if (bodyB.gameObject.label == 'bullet') {
            bodyB.gameObject.destroy();
            //TURRET HIT DAMAGE = 10
            this.playerHealth -= 25;
            if (this.playerHealth <= 0) {
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
            if (this.playerHealth <= 0) {
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

  calculateBonus() {
    const result = (this.pickupsFound + this.turretsKilled) / (this.allPickups + this.allTurrets)
    return result
  }

  updateReloadTimer(percentage) {
    const radius = 30; // Radius of the circular timer
    const thickness = 6; // Thickness of the circular timer
    const x_cord = 50;
    const y_cord = 100;
    // Clear previous graphics
    this.reloadTimerGraphics.clear();

    // Draw the background circle (full circle)
    this.reloadTimerGraphics.lineStyle(thickness, 0x000000, 0.5);
    this.reloadTimerGraphics.beginPath();
    this.reloadTimerGraphics.arc(x_cord, y_cord - 50, radius, 0, Phaser.Math.DegToRad(360), false);
    this.reloadTimerGraphics.strokePath();

    // Draw the foreground circle (progress arc)
    this.reloadTimerGraphics.lineStyle(thickness, 0x00ff00, 1);
    this.reloadTimerGraphics.beginPath();
    this.reloadTimerGraphics.arc(
      x_cord,
      y_cord - 50,
      radius,
      Phaser.Math.DegToRad(-90),
      Phaser.Math.DegToRad(-90 + 360 * percentage),
      false
    );
    this.reloadTimerGraphics.strokePath();
  }

  onWindowResize() {
    //change size of game
    this.game.scale.resize(window.innerWidth, Math.min(window.innerHeight - 80, 800));
  }

  playerFire() {
    if (this.time.now > this.nextFire) {
      this.tankShot.play()
      this.reloadTimer = 0;
      this.updateReloadTimer(0);
      this.playerAmmo--;
      this.events.emit('updateAmmo', this.playerAmmo);
      this.nextFire = this.time.now + this.fireRate;
      var bullet = this.matter.add.image(128, 128, 'bullet');
      bullet.setPosition(this.tankBody.x, this.tankBody.y);
      bullet.setSensor(true);
      const deltax = this.input.activePointer.x + this.cameras.main.scrollX - bullet.x;
      const deltay = this.input.activePointer.y + this.cameras.main.scrollY - bullet.y;
      const bulletSpeed = 50;
      const normalizedDeltax = deltax / Math.sqrt(deltax ** 2 + deltay ** 2);
      const normalizedDeltay = deltay / Math.sqrt(deltax ** 2 + deltay ** 2);
      const xVelocity = normalizedDeltax * bulletSpeed;
      const yVelocity = normalizedDeltay * bulletSpeed;

      bullet.setVelocity(xVelocity, yVelocity);
      bullet.setName("bulletPlayer");
    }
  }

  addHealth() {
    this.playerHealth += 50;
    if (this.playerHealth > 100) {
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
    const offset = 2962;

    let cords = [[450, 450], [550, 420], [1427, 103], [2679, 729], [3099, 368], [3769, 540], [1427 + offset, 103], [2679 + offset, 729], [3099 + offset, 368], [3769 + offset, 540]];
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
            this.pickupsFound += 1;
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
    this.allPickups += cords.length;
    //Health pickups
    cords = [[400, 430], [500, 450], [1477, 153], [2582, 739], [2964, 276], [3832, 585], [1477 + offset, 153], [2582 + offset + 20, 739], [2964 + offset, 276], [3832 + offset, 585]];
    cords.forEach(cord => {
      let health = this.matter.add.image(cord[0], cord[1], 'health');
      health.setName('health');
      health.setSensor(true);
      health.setOnCollide((pair) => {
        const { bodyA, bodyB } = pair;
        if (bodyA.gameObject && bodyB.gameObject) {
          if (bodyA.gameObject.name == 'health' && bodyB.gameObject.label == 'tankPlayer' || bodyA.gameObject.label == 'tankPlayer' && bodyB.gameObject.name == 'health') {
            //console.log('Player collided with health');
            //this.addHealth();
            this.pickupsFound += 1;
            ////
            this.pickedUpHealth += 1;
            this.events.emit("updateMedkits",this.pickedUpHealth)
            ////
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
    this.allPickups += cords.length;

    //Star pickups
    cords = [[1760, 896], [3861, 1044], [3141, 890], [5318, 895]];
    cords.forEach(cord => {
      let star = this.matter.add.image(cord[0], cord[1], 'star');
      star.setName('star');
      star.setSensor(true);
      star.setOnCollide((pair) => {
        const { bodyA, bodyB } = pair;
        if (bodyA.gameObject && bodyB.gameObject) {
          if (bodyA.gameObject.name == 'star' && bodyB.gameObject.label == 'tankPlayer' || bodyA.gameObject.label == 'tankPlayer' && bodyB.gameObject.name == 'star') {
            //console.log('Player collided with star');
            //this.addHealth();
            //this.pickupsFound+=1;
            this.BARTLE_stars_picked+=1;
            this.playerBulletDmg += 2;
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

  drawDialogMsg(userName) {
    // Get the main camera
    const camera = this.cameras.main;

    // Create a dialog box and position it relative to the camera's center
    const dialogBox = this.add.text(
      camera.worldView.x + camera.width / 2,
      camera.worldView.y + camera.height / 2,
      `User: ${userName} sent you a MedKit!`,
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 },
        align: 'center'
      }
    ).setOrigin(0.5);

    // Automatically destroy the dialog box after 3 seconds
    this.time.delayedCall(3000, () => {
      dialogBox.destroy();
    });

    // Ensure the dialog box stays centered if the camera moves
    this.events.on('cameraupdate', () => {
      dialogBox.setPosition(
        camera.worldView.x + camera.width / 2,
        camera.worldView.y + camera.height / 2
      );
    });
}

  drawDialogMsg_share() {
    // Get the center of the camera, not the game world
    const camera = this.cameras.main;
    const dialogBox = this.add.text(
      camera.worldView.x + camera.width / 2,
      camera.worldView.y + camera.height / 2,
      `You shared a MedKit with another user, Good Job!`,
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 },
        align: 'center'
      }
    ).setOrigin(0.5);

    // Destroy the dialog box after 3 seconds
    this.time.delayedCall(3000, () => {
      dialogBox.destroy();
    });

    // Ensure the dialog box follows the camera if it moves
    this.events.on('cameraupdate', () => {
      dialogBox.setPosition(
        camera.worldView.x + camera.width / 2,
        camera.worldView.y + camera.height / 2
      );
    });
}

  createTutorialDialog() {
    // Get the screen dimensions
    const screenWidth = Number(this.sys.game.config.width);
    const screenHeight = Number(this.sys.game.config.height);

    // Create a semi-transparent background to darken the game behind the dialog
    const backgroundOverlay = this.add.graphics();
    backgroundOverlay.fillStyle(0x000000, 0.5);
    backgroundOverlay.fillRect(0, 0, screenWidth, screenHeight);

    // Create the dialog box graphics (background)
    const dialogWidth = 400;
    const dialogHeight = 300;
    const dialogX = (screenWidth / 2) - (dialogWidth / 2);
    const dialogY = (screenHeight / 2) - (dialogHeight / 2);

    const dialogBox = this.add.graphics().setDepth(1);
    dialogBox.fillStyle(0x2d2d2d, 1); // Dark grey background
    dialogBox.fillRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 20); // Rounded corners

    // Create a border around the dialog box
    dialogBox.lineStyle(4, 0xffffff, 1);
    dialogBox.strokeRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 20);

    // Define the tutorial text content
    const tutorialText =
      "Welcome to the Game!\n\n" +
      "In this game, you can pick up Medkits that will be added to your inventory.\n\n" +
      "Press 'E' to use a Medkit on yourself.\n" +
      "Press 'F' to share it with another player!\n\n" +
      "Good luck and have fun!";

    const tutorialTextStyle = {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: dialogWidth - 40, useAdvancedWrap: true }
    };

    // Create the text object
    const tutorialTextObject = this.add.text(0, 0, tutorialText, tutorialTextStyle).setDepth(1);

    // Measure the text size and adjust position to center it vertically within a specific area
    const textBounds = tutorialTextObject.getBounds();
    const textMaxHeight = dialogHeight - 100; // Leave space for the button (around 100px)

    tutorialTextObject.setPosition(
      dialogX + (dialogWidth / 2) - (textBounds.width / 2), // Center horizontally
      dialogY + (textMaxHeight / 2) - (textBounds.height / 2) + 20 // Center vertically with padding
    );

    // Add a close button (optional for display, but not required for closing the dialog)
    const closeButton = this.add.text(
      screenWidth / 2,
      dialogY + dialogHeight - 40,  // Position the button below the text
      "Click to Start",
      {
        fontSize: '22px',
        color: '#ffcc00',
        backgroundColor: '#333',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setDepth(1);

    // Add an animation to the dialog box to fade in
    this.tweens.add({
      targets: [dialogBox, tutorialTextObject, closeButton],
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Power2'
    });

    // Close the dialog when clicking anywhere on the backgroundOverlay
    backgroundOverlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, screenWidth, screenHeight), Phaser.Geom.Rectangle.Contains);
    backgroundOverlay.once('pointerdown', () => {
      // Fade out and destroy the dialog elements
      this.tweens.add({
        targets: [backgroundOverlay, dialogBox, tutorialTextObject, closeButton],
        alpha: { from: 1, to: 0 },
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          backgroundOverlay.destroy();
          dialogBox.destroy();
          tutorialTextObject.destroy();
          closeButton.destroy();
        }
      });
    });
}
  calculateBartle(){

  }


}

export class UIScene extends Phaser.Scene {
  score: number;
  ammoText;
  playerHealthBar;
  levelsCompleted = 0;
  medkitImage;
  medkitCountText;
  medkitFrame;

  constructor() {
    super({ key: 'UIScene', active: true });

    this.score = 0;
  }
  preload() {
    // Preload the health medkit image
    this.load.image('medkit', 'assets/games/tankgame/health.png');
  }
  create() {
    //  Our Text object to display the Score

    const ourGame = this.scene.get('default');
    //console.log(this.scene);
    this.playerHealthBar = this.add.graphics();
    ourGame.events.on('updateHealth', this.updatePlayerHealthBar, this);
    this.updatePlayerHealthBar(100);
    //var text = this.add.text(10, 10, 'Pointer Position: (0, 0)', { font: '16px Arial', color: '#ffffff' });

    // Listen for pointer movement
    ourGame.input.on('pointermove', function (pointer) {
      // text.setText('Pointer Position: (' + pointer.x + ', ' + pointer.y + ')');
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
    this.updateAmmoCount(100);

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
      const levelText = this.children.list[4] as Phaser.GameObjects.Text;
      // levelText.setText('Levels:' + this.levelsCompleted);
    });
    // Define medkit box dimensions
    const boxSize = 50;
    const boxX = Number(this.sys.game.config.width) - 250;
    const boxY = 50;//170;

    // Create black frame (graphics object)
    this.medkitFrame = this.add.graphics();
    this.medkitFrame.lineStyle(4, 0x000000, 1); // 4-pixel wide black line
    this.medkitFrame.strokeRect(boxX - boxSize / 2, boxY - boxSize / 2, boxSize, boxSize);

    // Create medkit image (inside the frame)
    this.medkitImage = this.add.image(boxX, boxY, 'medkit').setDisplaySize(boxSize, boxSize);

    // Create medkit count text on top of the image
    this.medkitCountText = this.add.text(this.medkitImage.x + 20, this.medkitImage.y - 20, '0', {
      fontSize: '20px',
      color: '#fff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    // Listen for medkit update events
    ourGame.events.on('updateMedkits', this.updateMedkitCount, this);
  }

  updateMedkitCount(medkits) {
    // Update the medkit count number displayed on top of the medkit image
    this.medkitCountText.setText(medkits);
  }

  updateDeaths(deaths) {
    const deathsText = this.children.list[3] as Phaser.GameObjects.Text;
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

