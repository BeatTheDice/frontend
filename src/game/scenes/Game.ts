import { Scene } from 'phaser';
import { DiceHandler } from '../classes/DiceHandler';
import { LevelEngine } from '../classes/LevelEngine';
import { DiceCollection } from '../classes/DiceCollection';

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
    diceCollection: DiceCollection;
    cupTooltip: Phaser.GameObjects.Text;
    toolTipTimer: any;
    enemyHealthBarX: number;
    enemyHealthBarY: number;
    enemyHealthBarWidth: number;
    enemyHealthBarHeight: number;
    enemyHealthBar: Phaser.GameObjects.Graphics;

    constructor() {
        super('Game');
    }

    init() {        
        // Update scene context 
        this.levelEngine = window.levelEngine as LevelEngine;
        this.diceHandler = window.diceHandler as DiceHandler;
        this.diceCollection = window.diceCollection as DiceCollection;
        if (this.levelEngine) this.levelEngine.scene = this;
        if (this.diceHandler) this.diceHandler.scene = this;
    }

    create() {
        this.isDiceRolling = false;
        this.camera = this.cameras.main;
        this.background = this.add.image(768, 512, 'main_background');

        this.levelEngine.nextLevel();                
        this.diceHandler.renderPlayerDice();
        
        this.createTexts();        
        this.createButtons();
        this.createEnemyHealthBar();
    }

    changeScene() {
        this.scene.start('GameOver');
    }

    createTexts() {
        this.levelNumberText = this.add.text(50, 50, `Level ${this.levelEngine.currentLevel}`, {
            fontFamily: 'funblob', fontSize: 64, color: '#ff9000',
            stroke: '#000000', strokeThickness: 10,
            align: 'left'
        }).setOrigin(0, 0);
        this.remainingThrowsText = this.add.text(50, 130, `Würfe übrig: ${this.levelEngine.remainingThrows}`, {
            fontFamily: 'funblob', fontSize: 48, color: '#ff9000',
            stroke: '#000000', strokeThickness: 10,
            align: 'left'
        }).setOrigin(0, 0);
        this.enemyNameText = this.add.text(1486, 50, `${this.levelEngine.getEnemyName()}`, {
            fontFamily: 'funblob', fontSize: 48, color: '#ff9000',
            stroke: '#000000', strokeThickness: 10,
            align: 'right'
        }).setOrigin(1, 0);
        this.enemyHealthText = this.add.text(1486, 100, `HP: ${this.levelEngine.getCurrentEnemyHitPoints()} / ${this.levelEngine.getEnemyMaxHitPoints()}`, {
            fontFamily: 'funblob', fontSize: 48, color: '#ff9000',
            stroke: '#000000', strokeThickness: 10,
            align: 'right'
        }).setOrigin(1, 0);

        this.diceSumText = this.add.text(748, 300, '', {
            fontFamily: 'funblob', fontSize: 48, color: '#ff9000',
            stroke: '#000000', strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        this.bossEffectText = this.add.text(768, 180, '', {
            fontFamily: 'funblob', fontSize: 36, color: '#ff9000',
            stroke: '#000000', strokeThickness: 10,
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setDepth(100).setVisible(false);
    }

    createEnemyHealthBar() {
        // Position 
        this.enemyHealthBarWidth = 350;
        this.enemyHealthBarHeight = 32;
        this.enemyHealthBarX = 1048 - this.enemyHealthBarWidth / 2;
        this.enemyHealthBarY = 220;

        // Graphics Objekt
        this.enemyHealthBar = this.add.graphics();        
        this.updateEnemyHealthBar();
    }

    updateTexts() {
        this.levelNumberText.setText(`Level ${this.levelEngine.currentLevel}`);
        this.enemyNameText.setText(`${this.levelEngine.getEnemyName()}`);
        this.enemyHealthText.setText(`HP: ${this.levelEngine.getCurrentEnemyHitPoints()} / ${this.levelEngine.getEnemyMaxHitPoints()}`);
        this.remainingThrowsText.setText(`Würfe übrig: ${this.levelEngine.remainingThrows}`);
        this.updateEnemyHealthBar();
    }

    updateEnemyHealthBar() {
        const currentHp = this.levelEngine.getCurrentEnemyHitPoints();
        const maxHp = this.levelEngine.getEnemyMaxHitPoints();

        const percentage = Phaser.Math.Clamp(currentHp / maxHp, 0, 1);

        this.enemyHealthBar.clear();

        // Hintergrund / Rahmen
        this.enemyHealthBar.fillStyle(0x000000, 0.8);
        this.enemyHealthBar.fillRoundedRect(
            this.enemyHealthBarX - 4,
            this.enemyHealthBarY - 4,
            this.enemyHealthBarWidth + 8,
            this.enemyHealthBarHeight + 8,
            10
        );

        // Rot leerer Balken
        this.enemyHealthBar.fillStyle(0xaa0000, 1);
        this.enemyHealthBar.fillRoundedRect(
            this.enemyHealthBarX,
            this.enemyHealthBarY,
            this.enemyHealthBarWidth,
            this.enemyHealthBarHeight,
            8
        );
        
        if (percentage)
        {
            // Grüner HP Anteil
            this.enemyHealthBar.fillStyle(0x00ff00, 1);
            this.enemyHealthBar.fillRoundedRect(
                this.enemyHealthBarX,
                this.enemyHealthBarY,
                this.enemyHealthBarWidth * percentage,
                this.enemyHealthBarHeight,
                8
            );
        }
    }

    createButtons() {
        const button = this.add.image(200, 880, 'dicecupStanding');
        button.setScale(0.25);

        // Interaktiv machen
        button.setInteractive();

        this.cupTooltip = this.add.text(0, 0, 'Würfeln', {
        fontSize: '24px',
        fontFamily: 'funblob',
        backgroundColor: '#000000aa',
        color: '#ffffff',
        padding: { x: 6, y: 4 }
        })
        .setDepth(1000)
        .setVisible(false)
        .setOrigin(0.5);

        // Klick-Event
        button.on('pointerdown', async () => {
            if (this.toolTipTimer) {
            this.toolTipTimer.remove(false);
            this.toolTipTimer = undefined;
            }            
            this.cupTooltip.setVisible(false);
            
            button.setTexture('dicecupLying');
            await this.handleDiceThrow(button);
            button.setTexture('dicecupStanding');
        });

        // Hover-Effekt
        button.on('pointerover', () => {
            if (!this.isDiceRolling) {
                button.setScale(0.27);

                if (this.toolTipTimer) {
                    this.toolTipTimer.remove(false);
                }
                this.toolTipTimer = this.time.delayedCall(500, () => {
                this.cupTooltip.setVisible(true);
                this.cupTooltip.setPosition(button.x, button.y - 150);
            });
            }
        });

        button.on('pointerout', () => {
            if (!this.isDiceRolling) {
                button.setScale(0.25);
                if (this.toolTipTimer) {
                    this.toolTipTimer.remove(false);
                    this.toolTipTimer = undefined;
                }
                this.cupTooltip.setVisible(false);
            }
        });

    }

    private async handleDiceThrow(button: Phaser.GameObjects.Image) {
        if (this.isDiceRolling) return;
            
        this.isDiceRolling = true;
        button.setScale(0.25);
        
        const result = await this.diceHandler.throwDice();
        
        await this.animateProgressiveSum(result);
        
        const total = result.reduce((s, v) => s + v, 0);
        this.levelEngine.remainingThrows --;
        this.remainingThrowsText.setText(`Würfe übrig: ${this.levelEngine.remainingThrows}`);
        this.levelEngine.dealDamageToEnemy(total, this.levelEngine.remainingThrows === 0);
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
                }
                this.scene.start('GameOver');
            });
        } else {
            this.isDiceRolling = false;
            button.setAlpha(1);
        }
        this.updateEnemyHealthBar();
    }

    private async animateProgressiveSum(results: number[]): Promise<void> {
        this.diceSumText.setVisible(true);
        let currentSum = 0;

        for (let i = 0; i < results.length; i++) {
            currentSum += results[i];
            this.diceSumText.setText(currentSum.toString());            
            this.diceSumText.setColor('#ff9000');

            // Scale animation: grow and shrink
            await new Promise<void>((resolve) => {
                this.tweens.add({
                    targets: this.diceSumText,
                    scale: { from: 1, to: 1.3 },
                    duration: 100,
                    ease: 'Back.Out',
                    onComplete: () => {
                        this.tweens.add({
                            targets: this.diceSumText,
                            scale: { from: 1.3, to: 1 },
                            duration: 100,
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
        }
    }

    private async handleVampireCounterattack() {
        if (this.levelEngine.currentLevel !== 5 || this.levelEngine.getCurrentEnemyHitPoints() <= 0) {
            return;
        }

        const enemySprite = this.levelEngine.enemySprite;
        if (!enemySprite) {
            return;
        }

        const vampireDice = this.diceCollection.getRandomDiceOptions(1)[0];
        const result = vampireDice.roll();
        const value = Number(Object.keys(result)[0]);
        const texture = Object.values(result)[0];

        const startX = enemySprite.x;
        const startY = enemySprite.y - 120;
        const targetX = 1298;
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
                scale: { from: 0, to: 0.3 },
                duration: 900,
                ease: 'Cubic.Out',
                onComplete: () => {
                    this.bossEffectText.setText('Der Vampir saugt dich aus und heilt sich um ' + value + ' HP').setVisible(true);
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
