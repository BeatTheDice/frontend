import { Scene } from 'phaser';
import { DiceHandler } from '../classes/DiceHandler';
import { LevelEngine } from '../classes/LevelEngine';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    diceHandler: DiceHandler;
    diceText: Phaser.GameObjects.Text;
    levelNumberText: Phaser.GameObjects.Text;
    enemyNameText: Phaser.GameObjects.Text;
    enemyHealthText: Phaser.GameObjects.Text;
    remainingThrowsText: Phaser.GameObjects.Text;
    levelEngine: LevelEngine;
    isDiceRolling: boolean = false;

    constructor() {
        super('Game');
    }

    init() {        
        // Update scene context 
        this.levelEngine = window.levelEngine as LevelEngine;
        this.diceHandler = window.diceHandler as DiceHandler;
        if (this.levelEngine) this.levelEngine.scene = this;
        if (this.diceHandler) this.diceHandler.scene = this;
    }

    create() {
        this.isDiceRolling = false;
        this.camera = this.cameras.main;
        this.background = this.add.image(768, 512, 'mm_background');

        this.levelEngine.nextLevel();                
        this.diceHandler.renderPlayerDice();
        
        this.createTexts();        
        this.createButtons();
    }

    changeScene() {
        this.scene.start('GameOver');
    }

    createTexts() {
        this.diceText = this.add.text(768, 512, '', {
            fontFamily: 'actionman', fontSize: 64, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        this.levelNumberText = this.add.text(50, 50, `Level ${this.levelEngine.currentLevel}`, {
            fontFamily: 'actionman', fontSize: 64, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        });
        this.enemyNameText = this.add.text(1048, 50, `${this.levelEngine.getEnemyName()}`, {
            fontFamily: 'actionman', fontSize: 48, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        });
        this.enemyHealthText = this.add.text(1048, 100, `HP: ${this.levelEngine.getCurrentEnemyHitPoints()} / ${this.levelEngine.getEnemyMaxHitPoints()}`, {
            fontFamily: 'actionman', fontSize: 48, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        });
        this.remainingThrowsText = this.add.text(524, 50, `Würfe übrig: ${this.levelEngine.remainingThrows}`, {
            fontFamily: 'actionman', fontSize: 48, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        });
    }

    updateTexts() {
        this.levelNumberText.setText(`Level ${this.levelEngine.currentLevel}`);
        this.enemyNameText.setText(`${this.levelEngine.getEnemyName()}`);
        this.enemyHealthText.setText(`HP: ${this.levelEngine.getCurrentEnemyHitPoints()} / ${this.levelEngine.getEnemyMaxHitPoints()}`);
        this.remainingThrowsText.setText(`Würfe übrig: ${this.levelEngine.remainingThrows}`);
    }

    createButtons() {
        const button = this.add.image(1100, 900, 'dice');

        // Interaktiv machen
        button.setInteractive();

        // Klick-Event
        button.on('pointerdown', async () => {
            if (this.isDiceRolling) return;
            
            this.isDiceRolling = true;
            button.setAlpha(0.5);
            button.setScale(1);
            
            const result = await this.diceHandler.throwDice();
            const total = result.reduce((s, v) => s + v, 0);

            this.diceText.setText(total.toString());
            
            this.tweens.add({
                targets: this.diceText,
                scale: 1,
                duration: 200,
                ease: 'Back.Out'
            });

            this.levelEngine.remainingThrows --;
            this.remainingThrowsText.setText(`Würfe übrig: ${this.levelEngine.remainingThrows}`);
            this.levelEngine.dealDamageToEnemy(total);
            this.enemyHealthText.setText(`HP: ${this.levelEngine.getCurrentEnemyHitPoints()} / ${this.levelEngine.getEnemyMaxHitPoints()}`);

            if (this.levelEngine.getCurrentEnemyHitPoints() <= 0) {
                this.time.delayedCall(2000, () => {
                    this.diceHandler.clearDice();
                    this.diceText.setVisible(false);
                    this.scene.start('Reward');
                });
            } else if (this.levelEngine.remainingThrows === 0) {
                this.time.delayedCall(2000, () => {
                    this.scene.start('GameOver');
                });
            } else {
                this.isDiceRolling = false;
                button.setAlpha(1);
            }
        });

        // Hover-Effekt
        button.on('pointerover', () => {
            if (!this.isDiceRolling) {
                button.setScale(1.1);
            }
        });

        button.on('pointerout', () => {
            if (!this.isDiceRolling) {
                button.setScale(1);
            }
        });

    }
}
