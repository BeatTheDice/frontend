import { Math as PhaserMath, Scene, type Cameras, type GameObjects, type Time } from 'phaser';
import { DiceHandler } from '../classes/DiceHandler';
import { LevelEngine } from '../classes/LevelEngine';
import { DiceCollection } from '../classes/DiceCollection';
import { setupBackgroundAmbience } from '../BackgroundAmbience';
import { EventBus } from '../EventBus';
import { GAME_EVENTS } from '../backend-events';
import { t } from '../labels';
import { createInProgressRunSnapshot } from '../runMetrics';

export class Game extends Scene {
    camera: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    gameText: GameObjects.Text;
    diceHandler: DiceHandler;
    diceSumText: GameObjects.Text;
    levelNumberText: GameObjects.Text;
    enemyNameText: GameObjects.Text;
    enemyHealthText: GameObjects.Text;
    remainingThrowsText: GameObjects.Text;
    bonusThrowsText: GameObjects.Text;
    bossEffectText: GameObjects.Text;
    levelEngine: LevelEngine;
    isDiceRolling: boolean = false;
    diceCollection: DiceCollection;
    cupTooltip: GameObjects.Text;
    toolTipTimer?: Time.TimerEvent;
    enemyHealthBarX: number;
    enemyHealthBarY: number;
    enemyHealthBarWidth: number;
    enemyHealthBarHeight: number;
    enemyHealthBar: GameObjects.Graphics;

    constructor() {
        super('Game');
    }

    init() {        
        // Update scene context 
        const gameWindow = globalThis as typeof globalThis & Window;
        this.levelEngine = gameWindow.levelEngine as LevelEngine;
        this.diceHandler = gameWindow.diceHandler as DiceHandler;
        this.diceCollection = gameWindow.diceCollection as DiceCollection;
        if (this.levelEngine) this.levelEngine.scene = this;
        if (this.diceHandler) this.diceHandler.scene = this;
    }

    create() {
        this.isDiceRolling = false;
        this.camera = this.cameras.main;
        this.add.image(768, 512, 'sky_background').setDepth(-4);
        this.background = this.add.image(768, 512, 'main_background');
        this.background.setDepth(-2);
        setupBackgroundAmbience(this);

        this.levelEngine.nextLevel();                
        this.diceHandler.renderPlayerDice();
        
        this.createTexts();        
        this.createButtons();
        this.createEnemyHealthBar();
        this.updateTexts();

        EventBus.emit('current-scene-ready', this);
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

        // --- Exit button (bottom-right) with confirmation modal ---
        const cam = this.cameras.main;
        const margin = 24;
        const exitX = cam.width - margin - 80; // leave room for button width
        const exitY = cam.height - margin - 40;

        const exitBtn = this.add.text(exitX, exitY, t('game.exit'), {
            fontFamily: 'funblob',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            backgroundColor: '#1a1a1a'
        }).setPadding(12).setOrigin(1, 1).setInteractive({ useHandCursor: true }).setDepth(1000);

        // Modal group (initially hidden)
        const modalContainer = this.add.container(0, 0).setDepth(2000).setVisible(false);

        const overlay = this.add.rectangle(0, 0, cam.width, cam.height, 0x000000, 0.6).setOrigin(0).setInteractive();
        const boxW = 700;
        const boxH = 220;

        const box = this.add.rectangle(cam.centerX, cam.centerY, boxW, boxH, 0x111827, 0.98).setStrokeStyle(4, 0x4f46e5);
        const msg = this.add.text(cam.centerX, cam.centerY - 30, t('game.confirmExit', { default: 'Run wird abgebrochen. Sicher?' }), {
            fontFamily: 'funblob', fontSize: 36, color: '#ffffff', stroke: '#000000', strokeThickness: 8, align: 'center', wordWrap: { width: boxW - 60 }
        }).setOrigin(0.5);

        const yesBtn = this.add.text(cam.centerX - 80, cam.centerY + 60, t('game.yes'), {
            fontFamily: 'funblob', fontSize: 32, color: '#ffffff', backgroundColor: '#006400', stroke: '#000000', strokeThickness: 8
        }).setPadding(12).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const noBtn = this.add.text(cam.centerX + 80, cam.centerY + 60, t('game.no'), {
            fontFamily: 'funblob', fontSize: 32, color: '#ffffff', backgroundColor: '#8b0000', stroke: '#000000', strokeThickness: 8
        }).setPadding(12).setOrigin(0.5).setInteractive({ useHandCursor: true });

        modalContainer.add([overlay, box, msg, yesBtn, noBtn]);

        exitBtn.on('pointerdown', () => {
            modalContainer.setVisible(true);
        });

        // Cancel
        noBtn.on('pointerdown', () => {
            modalContainer.setVisible(false);
        });

        // Confirm: go back to MainMenu
        yesBtn.on('pointerdown', () => {
            // optionally clear running level state
            EventBus.emit(GAME_EVENTS.runCompleted, createInProgressRunSnapshot(this.levelEngine));
            this.scene.start('MainMenu');
        });

    }

    private async handleDiceThrow(button: GameObjects.Image) {
        if (this.isDiceRolling) return;

        this.isDiceRolling = true;
        EventBus.emit(GAME_EVENTS.runRolled);

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
            return this.handleVictory(button, 2000);
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
                return this.handleVictory(button, 1000);                
            }
        }        

        if (this.levelEngine.remainingThrows === 0 && this.levelEngine.bonusThrows === 0) {
            return this.handleGameOver();
        }

        this.resetDiceButton(button);
    }

    private handleVictory(diceButton: GameObjects.Image, delay = 2000) {
        this.time.delayedCall(delay, () => {

            this.diceHandler.clearDice();
            this.diceSumText.setVisible(false);            
            
            if (this.levelEngine.currentLevel === 5) {
                this.scene.start('Winner');
            } else if (this.levelEngine.currentLevel < 5) {
                this.scene.start('Reward');
            } else if (this.levelEngine.shouldShowMerchant()) {
                this.scene.start('Merchant');
            } else if (this.levelEngine.shouldShowMagician()) {
                this.scene.start('Magician');
            } else {
                // Kein besonderes Event, nächstes Level
                this.scene.start('Reward');
                this.resetDiceButton(diceButton);
                this.levelEngine.nextLevel();
                this.updateTexts();
            }
        });
    }

    private handleGameOver(delay = 2000) {
        this.time.delayedCall(delay, () => {
            EventBus.emit(GAME_EVENTS.runCompleted, createInProgressRunSnapshot(this.levelEngine, 'game-over'));
            this.scene.start('GameOver');
        });
    }

    private resetDiceButton(button: GameObjects.Image) {
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
