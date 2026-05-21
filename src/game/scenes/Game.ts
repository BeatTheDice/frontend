import { Math as PhaserMath, Scene } from 'phaser';
import { DiceHandler } from '../classes/DiceHandler';
import { LevelEngine } from '../classes/LevelEngine';
import { DiceCollection } from '../classes/DiceCollection';
import { t } from '../labels';

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
    bonusThrowsText: Phaser.GameObjects.Text;
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

        // Set endless mode flag for levels 6+
        if (this.levelEngine.currentLevel >= 5) {
            this.levelEngine.isEndlessMode = true;
        }

        this.levelEngine.nextLevel();                
        this.diceHandler.renderPlayerDice();
        
        this.createTexts();        
        this.createButtons();
        this.createEnemyHealthBar();
        this.updateTexts();
    }

    createTexts() {
        this.levelNumberText = this.add.text(50, 50, `${t('game.level')} ${this.levelEngine.currentLevel}`, {
            fontFamily: 'funblob', fontSize: 64, color: '#ff9000',
            stroke: '#000000', strokeThickness: 10,
            align: 'left'
        }).setOrigin(0, 0);
        
        const throwsDisplay = this.levelEngine.bonusThrows > 0 
            ? `${t('game.throwsLeft')}: ${this.levelEngine.remainingThrows} + ${this.levelEngine.bonusThrows}`
            : `${t('game.throwsLeft')}: ${this.levelEngine.remainingThrows}`;
            
        this.remainingThrowsText = this.add.text(50, 130, throwsDisplay, {
            fontFamily: 'funblob', fontSize: 48, color: '#ff9000',
            stroke: '#000000', strokeThickness: 10,
            align: 'left'
        }).setOrigin(0, 0);

        this.bonusThrowsText = this.add.text(50, 190, '', {
            fontFamily: 'funblob', fontSize: 36, color: '#00ff00',
            stroke: '#000000', strokeThickness: 8,
            align: 'left'
        }).setOrigin(0, 0);

        if (this.levelEngine.bonusThrows > 0) {
            this.bonusThrowsText.setText(`${t('game.bonusThrows')}: ${this.levelEngine.bonusThrows}`).setVisible(true);
        } else {
            this.bonusThrowsText.setVisible(false);
        }

        this.enemyNameText = this.add.text(1486, 50, `${this.levelEngine.getEnemyName()}`, {
            fontFamily: 'funblob', fontSize: 48, color: '#ff9000',
            stroke: '#000000', strokeThickness: 10,
            align: 'right'
        }).setOrigin(1, 0);
        this.enemyHealthText = this.add.text(1486, 100, `${t('game.hp')}: ${this.levelEngine.getCurrentEnemyHitPoints()} / ${this.levelEngine.getEnemyMaxHitPoints()}`, {
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
        this.levelNumberText.setText(`${t('game.level')} ${this.levelEngine.currentLevel}`);
        this.enemyNameText.setText(`${this.levelEngine.getEnemyName()}`);
        this.enemyHealthText.setText(`${t('game.hp')}: ${this.levelEngine.getCurrentEnemyHitPoints()} / ${this.levelEngine.getEnemyMaxHitPoints()}`);
        
        const throwsDisplay = this.levelEngine.bonusThrows > 0 
            ? `${t('game.throwsLeft')}: ${this.levelEngine.remainingThrows} + ${this.levelEngine.bonusThrows}`
            : `${t('game.throwsLeft')}: ${this.levelEngine.remainingThrows}`;
        this.remainingThrowsText.setText(throwsDisplay);

        if (this.levelEngine.bonusThrows > 0) {
            this.bonusThrowsText.setText(`${t('game.bonusThrows')}: ${this.levelEngine.bonusThrows}`).setVisible(true);
        } else {
            this.bonusThrowsText.setVisible(false);
        }
        
        this.updateEnemyHealthBar();
    }

    updateEnemyHealthBar() {
        const currentHp = this.levelEngine.getCurrentEnemyHitPoints();
        const maxHp = this.levelEngine.getEnemyMaxHitPoints();

        const percentage = PhaserMath.Clamp(currentHp / maxHp, 0, 1);

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

        this.cupTooltip = this.add.text(0, 0, t('game.rollTooltip'), {
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
            
            await this.handleDiceThrow(button);
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
        button.setTexture('dicecupLying');

        const result = await this.diceHandler.throwDice();

        await this.animateProgressiveSum(result);

        const total = result.reduce((s, v) => s + v, 0);

        // Use bonus throw if available, otherwise use regular throw
        const usedBonusThrow = this.levelEngine.remainingThrows === 0 && this.levelEngine.bonusThrows > 0 && this.levelEngine.useBonusThrow();
        if (!usedBonusThrow) {
            if (this.levelEngine.remainingThrows > 0) {
                this.levelEngine.remainingThrows--;
            }
        }

        const throwsDisplay = this.levelEngine.bonusThrows > 0 
            ? `${t('game.throwsLeft')}: ${this.levelEngine.remainingThrows} + ${this.levelEngine.bonusThrows}`
            : `${t('game.throwsLeft')}: ${this.levelEngine.remainingThrows}`;
        this.remainingThrowsText.setText(throwsDisplay);

        if (this.levelEngine.bonusThrows > 0) {
            this.bonusThrowsText.setText(`${t('game.bonusThrows')}: ${this.levelEngine.bonusThrows}`).setVisible(true);
        } else {
            this.bonusThrowsText.setVisible(false);
        }

        this.levelEngine.dealDamageToEnemy(
            total,
            this.levelEngine.remainingThrows === 0 && this.levelEngine.bonusThrows === 0
        );

        this.updateEnemyHealthBar();

        this.enemyHealthText.setText(
            `${t('game.hp')}: ${this.levelEngine.getCurrentEnemyHitPoints()} / ${this.levelEngine.getEnemyMaxHitPoints()}`
        );

        if (this.levelEngine.getCurrentEnemyHitPoints() <= 0) {
            return this.handleVictory(2000, button);
        }

        // ===== Vampire Counterattack =====
        if (this.levelEngine.currentLevel === 5) {

            await this.handleVampireCounterattack();

            this.updateEnemyHealthBar();

            this.enemyHealthText.setText(
                `${t('game.hp')}: ${this.levelEngine.getCurrentEnemyHitPoints()} / ${this.levelEngine.getEnemyMaxHitPoints()}`
            );

            // Gegner nach Counterattack trotzdem tot
            if (this.levelEngine.getCurrentEnemyHitPoints() <= 0) {
                return this.handleVictory(1000, button);                
            }
        }        

        if (this.levelEngine.remainingThrows === 0 && this.levelEngine.bonusThrows === 0) {
            return this.handleGameOver();
        }

        this.resetDiceButton(button);
    }

    private handleVictory(delay = 2000, diceButton: Phaser.GameObjects.Image) {
        this.time.delayedCall(delay, () => {

            this.diceHandler.clearDice();
            this.diceSumText.setVisible(false);            
            
            if (this.levelEngine.currentLevel === 5) {
                this.scene.start('Winner');
            } else if (this.levelEngine.currentLevel < 5) {
                this.scene.start('Reward');
            } else {
                // Endlos-Modus: Prüfe auf Merchant, Magician oder Reward
                if (this.levelEngine.shouldShowMerchant()) {
                    this.scene.start('Merchant');
                } else if (this.levelEngine.shouldShowMagician()) {
                    this.scene.start('Magician');
                } else if (this.levelEngine.shouldShowReward()) {
                    this.scene.start('Reward');
                } else {
                    // Kein besonderes Event, nächstes Level
                    this.resetDiceButton(diceButton);
                    this.levelEngine.nextLevel();
                    this.updateTexts();
                }
            }
        });
    }

    private handleGameOver(delay = 2000) {
        this.time.delayedCall(delay, () => {
            this.scene.start('GameOver');
        });
    }

    private resetDiceButton(button: Phaser.GameObjects.Image) {
        this.isDiceRolling = false;

        button.setTexture('dicecupStanding');
        button.setAlpha(1);
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
            this.diceSumText.setText(`${currentSum} ${t('game.crit')}`);
            this.diceSumText.setFontSize(64);
            this.diceSumText.setColor('#ff0000');
            
            // Add bonus throw if artifact is equipped
            if (this.levelEngine.hasArtifact) {
                const beforeBonus = this.levelEngine.bonusThrows;
                this.levelEngine.addBonusThrow();
                if (this.levelEngine.bonusThrows !== beforeBonus) {
                    this.updateTexts();
                }
            }
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

        const vampireDice = this.diceCollection.getRandomDiceOptions(1, 1)[0];
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
                    this.bossEffectText.setText(t('boss.vampireDrain', { value })).setVisible(true);
                    this.levelEngine.healEnemy(value, this.levelEngine.remainingThrows === 0);
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
