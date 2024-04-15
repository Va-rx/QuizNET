
export default class Tanks extends Phaser.Scene {
  keys;
  tankTurret;
  tankBody!: Phaser.GameObjects.Image;
  currentSpeed = 0;
  bullets; //player bullets group
  fireRate = 100;
  nextFire = 0;
  testEnemyTank;
  preload() {
    this.load.spritesheet('terrain', 'assets/games/tankgame/Terrains/terrain.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image('tankBody', 'assets/games/tankgame/Camo/Bodies/body_tracks.png');
    this.load.spritesheet('tankTurret', 'assets/games/tankgame/Camo/Weapons/turret_01_mk1.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image('bullet', 'assets/games/firstgame/assets/bomb.png');
  }

  create() {
    // Generate a tilemap
    const map = this.make.tilemap({ tileWidth: 128, tileHeight: 128, width: 10, height: 6 });

    // Add a tileset to the map
    const terrainTiles = map.addTilesetImage('terrain');



    if (terrainTiles) {
      // Create a layer from the tilemap data using the terrain tiles
      const layer = map.createBlankLayer('terrainLayer', terrainTiles);

      // Generate random terrain
      for (let row = 0; row < map.height; row++) {
        for (let col = 0; col < map.width; col++) {
          // Choose a random frame from the terrain spritesheet
          const frame = 28;
          console.log(frame);


          // Put the selected tile at the current position in the layer
          if (layer) {
            layer.putTileAt(frame, col, row);
          }
        }
      }
    }
    this.tankBody = this.physics.add.image(128, 128, 'tankBody');
    this.testEnemyTank=this.physics.add.image(800, 600, 'tankBody');
    this.tankTurret = this.add.sprite(128, 128, 'tankTurret', 0);

    this.physics.world.enable(this.tankBody);
    this.physics.world.enable(this.testEnemyTank);

    
  
    const area = 0;
    if (this.tankBody.body instanceof Phaser.Physics.Arcade.Body) {
      this.tankBody.body.setSize(80, 80);
      this.tankBody.body.drag.set(0.7);
      this.tankBody.body.maxVelocity.setTo(400, 400);
      this.tankBody.body.collideWorldBounds = true;
      this.testEnemyTank.body.collideWorldBounds =true;
    }

    this.tankTurret.anims.create({
      key: 'shoot',
      frames: this.anims.generateFrameNumbers('tankTurret', { start: 0, end: 7 }),
      frameRate: 30,
      repeat: 0
    });

    //play shoot once on left mouse click
    this.input.on('pointerdown', () => {
      this.tankTurret.anims.play('shoot', true);

    });
    //make tank point to mouse position
    this.input.on('pointermove', (pointer) => {
      const angle = Phaser.Math.Angle.Between(this.tankTurret.x, this.tankTurret.y, pointer.x, pointer.y) + Phaser.Math.PI2 / 4;
      this.tankTurret.rotation = angle;
    });

    if (this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys('W,S,A,D');
    }

    this.bullets = this.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.Arcade;
    //this.bullets.createMultiple(30,'bullet',0,false);
    //this.bullets.SetAll('outOfBoundsKill', true);do naprawy bo nie działa
    //this.bullets.SetAll('checkWorldBounds', true);

  }



  override update() {
    this.physics.collide(this.tankBody, this.testEnemyTank);
    this.physics.collide(this.bullets, this.testEnemyTank);

    if (this.keys.W.isDown) {
      this.currentSpeed = 200
    } else {
      if (this.currentSpeed > 0) {
        this.currentSpeed -= 4;
      }
    }


    if (this.keys.A.isDown) {
     // this.tankBody.angle -= 4;
     this.tankBody.setAngle(this.tankBody.angle-4);
    }
    else if (this.keys.D.isDown) {
     // this.tankBody.angle += 4;
     this.tankBody.setAngle(this.tankBody.angle+4);
    }

    if (this.currentSpeed > 0 && this.tankBody.body instanceof Phaser.Physics.Arcade.Body) {
      this.physics.velocityFromRotation(this.tankBody.rotation, this.currentSpeed, this.tankBody.body.velocity);
    }


    this.tankTurret.x = this.tankBody.x;
    this.tankTurret.y = this.tankBody.y;

    if (this.input.activePointer.isDown) {
      //  Boom!
      this.fire();
    }
  }

  fire() {
    if (this.time.now > this.nextFire) {
      this.nextFire = this.time.now + this.fireRate;
      //var bullet = this.bullets.getFirst();
      var bullet = this.physics.add.image(128, 128, 'bullet');
      this.bullets.add(bullet);
      bullet.setPosition(this.tankTurret.x, this.tankTurret.y);
      
      //bullet.enableBody=true;
      //bullet.physicsBodyType=Phaser.Physics.Arcade;

      this.physics.world.enable(bullet);
      bullet.body.collideWorldBounds = true;
      bullet.body.onWorldBounds = true
      bullet.body.world.on('worldbounds', function(body) {
        // Check if the body's game object is the sprite you are listening for
        if (body.gameObject === bullet) {
          // Stop physics and render updates for this object
          bullet.destroy();
        }
      }, bullet);

      bullet.rotation = this.physics.moveToObject(bullet, this.input.activePointer, 1000, 0);
    }

  }

}


