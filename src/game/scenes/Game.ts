import { Scene } from 'phaser';
import { DiceHandler } from '../classes/DiceHandler';
import { LevelEngine } from '../classes/LevelEngine';
import { Dice } from '../classes/Dice';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    diceHandler: DiceHandler;
    diceSumText: Phaser.GameObjects.Text;
    levelNumberText: Phaser.GameObjects.Text;
    enemyNameText: Phaser.GameObjects.Text;
    enemyHealthText: Phaser.GameObjects.Text;
    remainingThrowsText: Phaser.GameObjects.Text;
    bossEffectText: Phaser.GameObjects.Text;
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

        this.diceSumText = this.add.text(1048, 400, '', {
            fontFamily: 'actionman', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        this.bossEffectText = this.add.text(768, 180, '', {
            fontFamily: 'actionman', fontSize: 36, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setDepth(100).setVisible(false);
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
            
            await this.animateProgressiveSum(result);
            
            const total = result.reduce((s, v) => s + v, 0);
            this.levelEngine.remainingThrows --;
            this.remainingThrowsText.setText(`Würfe übrig: ${this.levelEngine.remainingThrows}`);
            this.levelEngine.dealDamageToEnemy(total);
            this.enemyHealthText.setText(`HP: ${this.levelEngine.getCurrentEnemyHitPoints()} / ${this.levelEngine.getEnemyMaxHitPoints()}`);

            if (this.levelEngine.getCurrentEnemyHitPoints() <= 0) {
                this.time.delayedCall(2000, () => {
                    this.diceHandler.clearDice();
                    this.diceSumText.setVisible(false);
                    if (this.levelEngine.currentLevel === 5) {
                        this.scene.start('Winner');
                    } else {
                        this.scene.start('Reward');
                    }
                });
            } else if (this.levelEngine.currentLevel === 5) {
                await this.handleVampireCounterattack();
                this.enemyHealthText.setText(`HP: ${this.levelEngine.getCurrentEnemyHitPoints()} / ${this.levelEngine.getEnemyMaxHitPoints()}`);
                if (this.levelEngine.getCurrentEnemyHitPoints() <= 0) {
                    this.time.delayedCall(1000, () => {
                        this.diceHandler.clearDice();
                        this.diceSumText.setVisible(false);
                        this.scene.start('Winner');
                    });
                } else if (this.levelEngine.remainingThrows === 0) {
                    this.time.delayedCall(1000, () => {
                        if (this.levelEngine.enemySprite) {
                            this.levelEngine.setEnemyWinTexture();
                        }
                        this.scene.start('GameOver');
                    });
                } else {
                    this.isDiceRolling = false;
                    button.setAlpha(1);
                }
            } else if (this.levelEngine.remainingThrows === 0) {
                this.time.delayedCall(2000, () => {
                    if (this.levelEngine.enemySprite) {
                        this.levelEngine.setEnemyWinTexture();
                    }
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

    private async animateProgressiveSum(results: number[]): Promise<void> {
        this.diceSumText.setVisible(true);
        let currentSum = 0;

        for (let i = 0; i < results.length; i++) {
            currentSum += results[i];
            this.diceSumText.setText(currentSum.toString());

            // Scale animation: grow and shrink
            await new Promise<void>((resolve) => {
                this.tweens.add({
                    targets: this.diceSumText,
                    scale: { from: 1, to: 1.3 },
                    duration: 150,
                    ease: 'Back.Out',
                    onComplete: () => {
                        this.tweens.add({
                            targets: this.diceSumText,
                            scale: { from: 1.3, to: 1 },
                            duration: 150,
                            ease: 'Back.In',
                            onComplete: () => {
                                resolve();
                            }
                        });
                    }
                });
            });

            // Small delay between each dice sum
            if (i < results.length - 1) {
                await new Promise<void>((resolve) => {
                    this.time.delayedCall(150, () => {
                        resolve();
                    });
                });
            }
        }

        // Check if critical hit (damage > half max HP)
        const maxHP = this.levelEngine.getEnemyMaxHitPoints();
        if (currentSum > maxHP / 2) {
            this.diceSumText.setText(currentSum.toString() + ' Crit!');
            this.diceSumText.setFontSize(64);
            this.diceSumText.setColor('#ff0000');
            this.diceSumText.setStroke('#ffff00', 8);
        }
    }

    async handleVampireCounterattack() {
        if (this.levelEngine.currentLevel !== 5 || this.levelEngine.getCurrentEnemyHitPoints() <= 0) {
            return;
        }

        const enemySprite = this.levelEngine.enemySprite;
        if (!enemySprite) {
            return;
        }

        const vampireDice = new Dice([
            { 1: 'regular-dice-1' },
            { 2: 'regular-dice-2' },
            { 3: 'regular-dice-3' },
            { 4: 'regular-dice-4' },
            { 5: 'regular-dice-5' },
            { 6: 'regular-dice-6' }
        ], 'Vampire Dice');

        const result = vampireDice.roll();
        const value = Number(Object.keys(result)[0]);
        const texture = Object.values(result)[0];

        const startX = enemySprite.x;
        const startY = enemySprite.y - 120;
        const targetX = 768;
        const targetY = 400;

        const rollSprite = this.add.image(startX, startY, texture)
            .setOrigin(0.5)
            .setScale(0)
            .setDepth(250)
            .setAngle(0);

        return new Promise<void>((resolve) => {
            this.tweens.add({
                targets: rollSprite,
                x: targetX,
                y: targetY,
                angle: 720,
                scale: { from: 0, to: 0.7 },
                duration: 900,
                ease: 'Cubic.Out',
                onComplete: () => {
                    this.bossEffectText.setText(`Vampir wirft zurück und heilt sich um ${value} HP`).setVisible(true);
                    this.levelEngine.healEnemy(value);
                    this.time.delayedCall(2500, () => {
                        this.bossEffectText.setVisible(false);
                        rollSprite.destroy();
                        resolve();
                    });
                }
            });
        });
    }
}
