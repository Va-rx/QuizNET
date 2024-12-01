import Phaser from "phaser";
import {MultiplayerRoles} from "../role-dialog/role.model";

export class Player {
  sprite: Phaser.GameObjects.Sprite;
  nameText!: Phaser.GameObjects.Text;
  maxHealth = 30;
  health: number;
  healthBar!: Phaser.GameObjects.Graphics;
  canMove!: boolean;
  isTargetable: boolean = true;
  direction = 'down';
  lastDirection = 'idleDown';
  questionsAnswered = 0;
  role: MultiplayerRoles = MultiplayerRoles.NONE;
  id!: string;
  stopAnimation = false;
  playersKilled = 0;
  attackDamage = 10;
  attackRange = 60;
  movementSpeed = 2.2;
  visibilityScale: number = 9;
  vision;
  isAnswering: boolean = false;
  canCollectStar: boolean = false;

  // Offensive
  offensivePowerUps: string[] = ['damage', 'attackRange'];
  // Defensive
  defensivePowerUps: string[] = ['health', 'speed'];

  constructor(sprite: Phaser.GameObjects.Sprite, nickname: string, health: number, id: string, vision) {
    this.sprite = sprite;
    this.sprite.setScale(2);
    this.health = health;
    this.canMove = false;
    this.healthBar = this.sprite.scene.add.graphics();
    this.id = id;
    this.drawHealthBar();
    this.vision = vision;
    this.vision.scale = this.visibilityScale;
    this.nameText = this.sprite.scene.add.text(this.sprite.x, this.sprite.y - 50, nickname, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  public setAttackDamage(damage: number): void {
    this.attackDamage = damage;
  }
  public collectStar(): void{
    this.isAnswering = true;
    this.isTargetable = false;
    this.canMove = false;
    this.sprite.setVisible(false);
    this.nameText.setVisible(false);
    this.healthBar.setVisible(false);
  }


  // Used only after collecting star
  public showPlayer(): void{
    this.isAnswering = false;
    this.isTargetable = true;
    this.canMove = true;
    this.sprite.setVisible(true);
    this.nameText.setVisible(true);
    this.healthBar.setVisible(true);
  }

  public hidePlayer(): void{
    this.sprite.setVisible(false);
    this.healthBar.setVisible(false);
    this.nameText.setVisible(false);
  }

  public unHidePlayer(): void {
    if (!this.isAnswering) {
      this.sprite.setVisible(true);
      this.healthBar.setVisible(true);
      this.nameText.setVisible(true);
    }
  }

  public removePlayer(): void{
    this.sprite.destroy();
    this.nameText.destroy();
    this.healthBar.destroy();
  }

  public updateHealthBar(): void {
    this.drawHealthBar();
  }

  public updateNameText(): void {
    this.nameText.setPosition(this.sprite.x, this.sprite.y - 50);
  }

  private drawHealthBar(): void {
    const barWidth = 100;
    const barHeight = 10;
    const borderColor = 0x000000;
    const fillColor = this.sprite.name === 'enemy' ? 0xff0000 : 0x00ff00;
    this.healthBar.clear();
    this.healthBar.lineStyle(2, borderColor);
    this.healthBar.strokeRect(this.sprite.x - barWidth / 2, this.sprite.y - 40, barWidth, barHeight);
    this.healthBar.fillStyle(fillColor);
    this.healthBar.fillRect(this.sprite.x - barWidth / 2, this.sprite.y - 40, barWidth * (this.health / this.maxHealth), barHeight);
  }

  public move(direction){
    if (this.canMove) {
      switch (direction) {
        case 'left':
          this.sprite.x += -this.movementSpeed;
          this.lastDirection = 'idleLeft';
          break;
        case 'right':
          this.sprite.x += this.movementSpeed;
          this.lastDirection = 'idleRight';
          break;
        case 'up':
          this.sprite.y += -this.movementSpeed;
          this.lastDirection = 'idleUp';
          break;
        case 'down':
          this.sprite.y += this.movementSpeed;
          this.lastDirection = 'idleDown';
          break;
      }
    }
    return {x: this.sprite.x, y: this.sprite.y};
  }

  public addPowerUp(powerUp: string): void {
    switch (powerUp) {
      case 'attackRange':
        this.attackRange += 30;
        break;
      case 'damage':
        this.attackDamage += 5;
        break;
      case 'health':
        this.maxHealth = 45;
        this.health = this.maxHealth;
        break;
      case 'speed':
        this.movementSpeed += 0.8;
        break;
    }
  }
}
