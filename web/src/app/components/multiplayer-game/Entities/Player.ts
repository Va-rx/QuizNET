import Phaser from "phaser";
import {MultiplayerRoles} from "../role-dialog/role.model";

export class Player {
  sprite: Phaser.GameObjects.Sprite;
  nameText!: Phaser.GameObjects.Text;
  health: number;
  healthBar!: Phaser.GameObjects.Graphics;
  canMove!: boolean;
  isTargetable!: boolean;
  direction = 'down';
  lastDirection = 'idleDown';
  questionsAnswered = 0;
  role: MultiplayerRoles = MultiplayerRoles.NONE;
  id!: string;
  stopAnimation = false;
  playersKilled = 0;

  constructor(sprite: Phaser.GameObjects.Sprite, nickname: string, health: number, id: string) {
    this.sprite = sprite;
    this.sprite.setScale(2);
    this.health = health;
    this.canMove = true;
    this.isTargetable = true;
    this.healthBar = this.sprite.scene.add.graphics();
    this.id = id;
    this.drawHealthBar();
    // this.nameText = this.sprite.add.text(100, 400, nickname, {  fontSize: '16px',  color: '#ffffff'}).setOrigin(0.5)
  }

  public collectStar(): void{
    this.isTargetable = false;
    this.canMove = false;
    this.sprite.setVisible(false);
    // this.nameText.setVisible(false);
    this.healthBar.setVisible(false);
  }

  public showPlayer(): void{
    this.isTargetable = true;
    this.canMove = true;
    this.sprite.setVisible(true);
    // this.nameText.setVisible(true);
    this.healthBar.setVisible(true);
  }

  public removePlayer(): void{
    this.sprite.destroy();
    // this.nameText.destroy();
    this.healthBar.destroy();
  }

  public updateHealthBar(): void {
    this.drawHealthBar();
  }

  public updateNameText(): void {
    // this.nameText.setVisible(true);
    // this.nameText.setPosition(this.sprite.x, this.sprite.y - 50);
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

  public move(direction){
    const movement = { x: 0, y: 0 };
    if (this.canMove) {
      switch (direction) {
        case 'left':
          movement.x = -1.3;
          this.lastDirection = 'idleLeft';
          break;
        case 'right':
          movement.x = 1.3;
          this.lastDirection = 'idleRight';
          break;
        case 'up':
          movement.y = -1.3;
          this.lastDirection = 'idleUp';
          break;
        case 'down':
          movement.y = 1.3;
          this.lastDirection = 'idleDown';
          break;
      }
    }
    return movement;
  }
}
