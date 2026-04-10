import { EventBus } from '../EventBus';
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

    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;

        this.background = this.add.image(768, 512, 'mm_background');

        this.diceHandler = new DiceHandler(this);

        this.levelEngine = new LevelEngine(this);
        
        this.createTexts();
        
        this.createButtons();

        EventBus.emit('current-scene-ready', this);
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

    createButtons() {
        const button = this.add.image(1100, 900, 'dice');

        // Interaktiv machen
        button.setInteractive();

        // Klick-Event
        button.on('pointerdown', async () => {
            this.levelEngine.remainingThrows --;
            this.remainingThrowsText.setText(`Würfe übrig: ${this.levelEngine.remainingThrows}`);
            const result = await this.diceHandler.throwDice();
            const total = result.reduce((s, v) => s + v, 0);

            this.diceText.setText(total.toString());
            
            this.tweens.add({
                targets: this.diceText,
                scale: 1,
                duration: 200,
                ease: 'Back.Out'
            });
            this.levelEngine.dealDamageToEnemy(total);
            this.enemyHealthText.setText(`HP: ${this.levelEngine.getCurrentEnemyHitPoints()} / ${this.levelEngine.getEnemyMaxHitPoints()}`);
            if (this.levelEngine.remainingThrows === 0 && this.levelEngine.getCurrentEnemyHitPoints() > 0) {
                this.scene.start('GameOver');
            }
        });

        // Hover-Effekt
        button.on('pointerover', () => {
            button.setScale(1.1);
        });

        button.on('pointerout', () => {
            button.setScale(1);
        });

    }
}
