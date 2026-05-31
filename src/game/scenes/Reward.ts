import { EventBus } from '../EventBus';
import { Scene, type Cameras, type GameObjects } from 'phaser';
import { DiceHandler } from '../classes/DiceHandler';
import { Dice } from '../base classes/Dice';
import { DiceCollection } from '../collection classes/DiceCollection';
import { LevelEngine } from '../classes/LevelEngine';
import { t } from '../labels';
import { setupBackgroundAmbience } from '../BackgroundAmbience';

export class Reward extends Scene {
    camera: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    titleText: GameObjects.Text;
    rewardDiceSprites: GameObjects.Image[] = [];
    continueButton: GameObjects.Image;
    continueText: GameObjects.Text;
    skipButton: GameObjects.Text;
    diceHandler: DiceHandler;
    levelEngine: LevelEngine;
    selectedDice: Dice | null = null;
    selectedDiceIndex: number | null = null;
    selectedPlayerDiceIndex: number | null = null;
    infoText: GameObjects.Text;
    diceCollection: DiceCollection;
    isSwapMode: boolean = false;
    playerDiceSprites: GameObjects.Image[] = [];
    playerDiceBadgeTexts: GameObjects.Text[] = [];
    newDiceBadgeTexts: GameObjects.Text[] = [];
    selectedNewSelectionBorder: GameObjects.Graphics | null = null;
    selectedPlayerSelectionBorder: GameObjects.Graphics | null = null;
    selectionBorder: GameObjects.Graphics | null = null;

    constructor() {
        super('Reward');
    }

    init() {
        this.diceHandler = window.diceHandler as DiceHandler;
        this.diceHandler.scene = this;
        this.diceCollection = window.diceCollection as DiceCollection;
        this.levelEngine = window.levelEngine as LevelEngine;
        if (this.levelEngine) this.levelEngine.scene = this;
    }

    create() {
        this.camera = this.cameras.main;

        this.add.image(768, 512, 'sky_background').setDepth(-4);
        this.background = this.add.image(768, 512, 'main_background');
        this.background.setDepth(-2);
        setupBackgroundAmbience(this);

        // Bestimme den Modus
        this.isSwapMode = this.levelEngine.isEndlessMode;

        const titleKey = this.isSwapMode ? 'reward.titleSwap' : 'reward.title';
        this.titleText = this.add.text(768, 100, t(titleKey), {
            fontFamily: 'funblob', fontSize: 48, color: '#ff9000',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.infoText = this.add.text(768, 900, '', {
            fontFamily: 'funblob', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        const diceOptions: Dice[] = this.diceCollection.getRandomDiceOptions(3, this.levelEngine.currentLevel);

        const baseX = 768;
        const baseY = 400;
        const spacing = 250;

        // Im Swap-Modus zeige die aktuellen Würfel des Spielers
        if (this.isSwapMode) {
            this.createSwapModeUI(diceOptions, baseX, baseY, spacing);
        } else {
            this.createNormalModeUI(diceOptions, baseX, baseY, spacing);
        }

        // Continue Button (initial versteckt)
        this.continueButton = this.add.image(768, 800, 'dice')
            .setOrigin(0.5)
            .setScale(0.3)
            .setDepth(50)
            .setVisible(false)
            .setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(768, 800, t('reward.continue'), {
            fontFamily: 'funblob', fontSize: 32, color: '#ff9000',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(60).setVisible(false);

        this.continueButton.on('pointerdown', () => {
            this.continueToNextLevel();
        });

        EventBus.emit('current-scene-ready', this);
    }

    private createNormalModeUI(diceOptions: Dice[], baseX: number, baseY: number, spacing: number) {
        const itemScale = 0.55;
        const hoverScale = 0.6;

        diceOptions.forEach((dice, index) => {
            const x = baseX + (index - 1) * spacing;
            const sprite = this.add.image(x, baseY, dice.getDisplayTexture())
                .setOrigin(0.5)
                .setScale(itemScale)
                .setDepth(50)
                .setInteractive({ useHandCursor: true });

            sprite.on('pointerover', () => {
                const values = dice.getFaceValues().join(', ');
                this.infoText.setText(`${dice.getDisplayName()}: ${values}`).setVisible(true);
                sprite.setScale(hoverScale);
            });

            sprite.on('pointerout', () => {
                this.infoText.setVisible(false);
                sprite.setScale(itemScale);
            });

            sprite.on('pointerdown', () => {
                this.selectDice(dice, sprite);
            });

            this.rewardDiceSprites.push(sprite);
        });
    }

    private createSwapModeUI(diceOptions: Dice[], baseX: number, baseY: number, spacing: number) {
        this.titleText.setText(t('reward.titleSwap'));
        this.add.text(768, 200, t('reward.swapInstruction'), {
            fontFamily: 'funblob', fontSize: 28, color: '#cccccc',
            stroke: '#000000', strokeThickness: 6,
            align: 'center',
            wordWrap: { width: 900 }
        }).setOrigin(0.5).setDepth(100);

        this.skipButton = this.add.text(this.camera.width - 200, this.camera.height - 100, t('reward.skip'), {
            fontFamily: 'funblob',
            fontSize: 32,
            color: '#ffffff',
            backgroundColor: '#444444',
            stroke: '#000000',
            strokeThickness: 6,
            padding: { x: 20, y: 12 },
            align: 'center'
        }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true }).setVisible(this.isSwapMode);

        this.skipButton.on('pointerdown', () => {
            this.skipSwap();
        });

        // Zeige neue Würfel zum Tauschen
        const optionScale = 0.55;
        const optionHoverScale = 0.6;

        diceOptions.forEach((dice, index) => {
            const x = baseX + (index - 1) * spacing;
            const sprite = this.add.image(x, baseY - 50, dice.getDisplayTexture())
                .setOrigin(0.5)
                .setScale(optionScale)
                .setDepth(50)
                .setInteractive({ useHandCursor: true });

            sprite.on('pointerover', () => {
                const values = dice.getFaceValues().join(', ');
                this.infoText.setText(`${t('reward.swapSelect')}: ${dice.getDisplayName()}: ${values}`).setVisible(true);
                sprite.setScale(optionHoverScale);
            });

            sprite.on('pointerout', () => {
                this.infoText.setVisible(false);
                sprite.setScale(optionScale);
            });

            sprite.on('pointerdown', () => {
                this.selectNewDiceForSwap(dice, sprite, index);
            });

            this.rewardDiceSprites.push(sprite);
        });

        // Zeige aktuelle Würfel des Spielers
        const playerDiceY = baseY + 150;
        this.add.text(768, playerDiceY - 80, t('reward.selectToSwap'), {
            fontFamily: 'funblob', fontSize: 24, color: '#aaaaaa',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const playerDiceCount = this.diceHandler.playersDice.length;
        const playerSpacing = 190;
        
        const playerItemScale = 0.55;
        const playerHoverScale = 0.6;

        this.diceHandler.playersDice.forEach((dice, index) => {
            // Zentriere die Würfel basierend auf ihrer Anzahl
            const x = baseX + (index - (playerDiceCount - 1) / 2) * playerSpacing;
            const sprite = this.add.image(x, playerDiceY, dice.getDisplayTexture())
                .setOrigin(0.5)
                .setScale(playerItemScale)
                .setDepth(50)
                .setInteractive({ useHandCursor: true });

            sprite.on('pointerover', () => {
                const values = dice.getFaceValues().join(', ');
                const enchantmentInfo = dice.getEnchantmentInfo();
                this.infoText.setText(`${dice.getDisplayName()}${enchantmentInfo}: ${values}`).setVisible(true);
                sprite.setScale(playerHoverScale);
            });

            sprite.on('pointerout', () => {
                this.infoText.setVisible(false);
                sprite.setScale(playerItemScale);
            });

            sprite.on('pointerdown', () => {
                this.selectPlayerDiceForSwap(index, sprite);
            });

            this.playerDiceSprites.push(sprite);

            if (dice.enchantment) {
                const badge = this.add.text(x + 36, playerDiceY - 36, dice.enchantment.shortCode, {
                    fontFamily: 'funblob', fontSize: '18px', color: '#ffffff', backgroundColor: '#00aa00', padding: { x: 6, y: 4 }
                }).setDepth(200).setOrigin(0.5);
                this.playerDiceBadgeTexts.push(badge);
            } else {
                this.playerDiceBadgeTexts.push(null as any);
            }
        });
    }

    private selectNewDiceForSwap(dice: Dice, sprite: GameObjects.Image, index: number) {
        this.selectedDice = dice;
        this.selectedDiceIndex = index;
        this.clearNewSelectionBorder();
        this.showSelectionBorder(sprite, 'new');
        this.infoText.setText(t('reward.swapSelectPlayerDice')).setVisible(true);
        this.continueButton.setVisible(this.selectedPlayerDiceIndex !== null);
        this.continueText.setVisible(this.selectedPlayerDiceIndex !== null);
    }

    private selectPlayerDiceForSwap(playerDiceIndex: number, sprite: GameObjects.Image) {
        if (!this.selectedDice || this.selectedDiceIndex === null) {
            this.infoText.setText(t('reward.mustSelectNewDice')).setVisible(true);
            return;
        }

        this.selectedPlayerDiceIndex = playerDiceIndex;
        this.clearPlayerSelectionBorder();
        this.showSelectionBorder(sprite, 'player');

        this.continueButton.setVisible(true);
        this.continueText.setVisible(true);
        this.infoText.setText(t('reward.swapPrepared')).setVisible(true);
    }

    selectDice(dice: Dice, sprite: GameObjects.Image) {
        // Normal-Modus: Einfach den Würfel hinzufügen
        this.selectedDice = dice;
        this.clearSelectionBorder();
        this.showSelectionBorder(sprite);
        this.continueButton.setVisible(true);
        this.continueText.setVisible(true);
    }

    continueToNextLevel() {
        if (this.isSwapMode) {
            if (!this.selectedDice || this.selectedPlayerDiceIndex === null) {
                this.infoText.setText(t('reward.mustSelectNewAndPlayerDice')).setVisible(true);
                return;
            }

            this.diceHandler.playersDice[this.selectedPlayerDiceIndex] = this.selectedDice;
            this.diceHandler.renderPlayerDice();
            this.cleanup();
            this.scene.stop();
            this.scene.start('Game');
        } else {
            // Normal-Modus: Würfel hinzufügen
            if (this.selectedDice) {
                this.diceHandler.addDice(this.selectedDice);
                this.cleanup();
                this.scene.stop();
                this.scene.start('Game');
            }
        }
    }

    private skipSwap() {
        this.cleanup();
        this.scene.stop();
        this.scene.start('Game');
    }

    private cleanup() {
        this.rewardDiceSprites.forEach(sprite => sprite.destroy());
        this.playerDiceSprites.forEach(sprite => sprite.destroy());
        this.playerDiceBadgeTexts.forEach(badge => { if (badge) badge.destroy(); });
        this.newDiceBadgeTexts.forEach(badge => { if (badge) badge.destroy(); });
        this.continueButton.destroy();
        this.continueText.destroy();
        if (this.skipButton) this.skipButton.destroy();
        if (this.selectionBorder) { this.selectionBorder.destroy(); this.selectionBorder = null; }
        if (this.selectedNewSelectionBorder) { this.selectedNewSelectionBorder.destroy(); this.selectedNewSelectionBorder = null; }
        if (this.selectedPlayerSelectionBorder) { this.selectedPlayerSelectionBorder.destroy(); this.selectedPlayerSelectionBorder = null; }
        this.titleText.destroy();
        this.infoText.destroy();
        this.background.destroy();
    }

    private clearSelectionBorder() {
        if (this.selectionBorder) {
            this.selectionBorder.destroy();
            this.selectionBorder = null;
        }
        this.clearNewSelectionBorder();
        this.clearPlayerSelectionBorder();
    }

    private clearNewSelectionBorder() {
        if (this.selectedNewSelectionBorder) {
            this.selectedNewSelectionBorder.destroy();
            this.selectedNewSelectionBorder = null;
        }
    }

    private clearPlayerSelectionBorder() {
        if (this.selectedPlayerSelectionBorder) {
            this.selectedPlayerSelectionBorder.destroy();
            this.selectedPlayerSelectionBorder = null;
        }
    }

    private showSelectionBorder(sprite: GameObjects.Image, type: 'single' | 'new' | 'player' = 'single') {
        if (type === 'single') {
            this.clearSelectionBorder();
        } else if (type === 'new') {
            this.clearNewSelectionBorder();
        } else {
            this.clearPlayerSelectionBorder();
        }

        const pad = 12;
        const shrink = /d8|d10/i.test(sprite.texture.key) ? 0.75 : 0.9;
        const w = sprite.displayWidth * shrink + pad;
        const h = sprite.displayHeight * shrink + pad;
        const x = sprite.x - w / 2;
        const y = sprite.y - h / 2;
        const g = this.add.graphics();
        g.lineStyle(6, 0xff9000, 1);
        g.strokeRoundedRect(x, y, w, h, 12);
        g.setDepth(sprite.depth + 1);

        if (type === 'single') {
            this.selectionBorder = g;
        } else if (type === 'new') {
            this.selectedNewSelectionBorder = g;
        } else {
            this.selectedPlayerSelectionBorder = g;
        }
    }
}