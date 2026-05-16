import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { DiceHandler } from '../classes/DiceHandler';
import { Dice } from '../classes/Dice';
import { DiceCollection } from '../classes/DiceCollection';
import { LevelEngine } from '../classes/LevelEngine';
import { t } from '../labels';

export class Reward extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    titleText: Phaser.GameObjects.Text;
    rewardDiceSprites: Phaser.GameObjects.Image[] = [];
    continueButton: Phaser.GameObjects.Image;
    continueText: Phaser.GameObjects.Text;
    diceHandler: DiceHandler;
    levelEngine: LevelEngine;
    selectedDice: Dice | null = null;
    selectedDiceIndex: number | null = null;
    infoText: Phaser.GameObjects.Text;
    diceCollection: DiceCollection;
    isSwapMode: boolean = false;
    playerDiceSprites: Phaser.GameObjects.Image[] = [];
    swapCompleted: boolean = false;

    constructor() {
        super('Reward');
    }

    init() {
        this.diceHandler = window.diceHandler as DiceHandler;
        this.diceHandler.scene = this;
        this.diceCollection = window.diceCollection as DiceCollection;
        this.levelEngine = window.levelEngine as LevelEngine;
    }

    create() {
        this.camera = this.cameras.main;

        this.background = this.add.image(768, 512, 'main_background');

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
        diceOptions.forEach((dice, index) => {
            const x = baseX + (index - 1) * spacing;
            const sprite = this.add.image(x, baseY, dice.getDisplayTexture())
                .setOrigin(0.5)
                .setScale(0.55)
                .setDepth(50)
                .setInteractive({ useHandCursor: true });

            sprite.on('pointerover', () => {
                const values = dice.getFaceValues().join(', ');
                this.infoText.setText(`${dice.getDisplayName()}: ${values}`).setVisible(true);
                sprite.setScale(0.6);
            });

            sprite.on('pointerout', () => {
                this.infoText.setVisible(false);
                sprite.setScale(0.55);
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

        // Zeige neue Würfel zum Tauschen
        diceOptions.forEach((dice, index) => {
            const x = baseX + (index - 1) * spacing;
            const sprite = this.add.image(x, baseY - 50, dice.getDisplayTexture())
                .setOrigin(0.5)
                .setScale(0.55)
                .setDepth(50)
                .setInteractive({ useHandCursor: true });

            sprite.on('pointerover', () => {
                const values = dice.getFaceValues().join(', ');
                this.infoText.setText(`${t('reward.swapSelect')}: ${dice.getDisplayName()}: ${values}`).setVisible(true);
                sprite.setScale(0.6);
            });

            sprite.on('pointerout', () => {
                this.infoText.setVisible(false);
                sprite.setScale(0.55);
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
        const playerSpacing = 150;
        
        this.diceHandler.playersDice.forEach((dice, index) => {
            // Zentriere die Würfel basierend auf ihrer Anzahl
            const x = baseX + (index - (playerDiceCount - 1) / 2) * playerSpacing;
            const sprite = this.add.image(x, playerDiceY, dice.getDisplayTexture())
                .setOrigin(0.5)
                .setScale(0.45)
                .setDepth(50)
                .setInteractive({ useHandCursor: true });

            sprite.on('pointerover', () => {
                const values = dice.getFaceValues().join(', ');
                const enchantmentInfo = dice.getEnchantmentInfo();
                this.infoText.setText(`${dice.getDisplayName()}${enchantmentInfo}: ${values}`).setVisible(true);
                sprite.setScale(0.5);
            });

            sprite.on('pointerout', () => {
                this.infoText.setVisible(false);
                sprite.setScale(0.45);
            });

            sprite.on('pointerdown', () => {
                this.selectPlayerDiceForSwap(index, sprite);
            });

            this.playerDiceSprites.push(sprite);
        });
    }

    private selectNewDiceForSwap(dice: Dice, sprite: Phaser.GameObjects.Image, index: number) {
        this.selectedDice = dice;
        this.selectedDiceIndex = index;
        this.rewardDiceSprites.forEach(s => s.setTint(0xffffff));
        sprite.setTint(0x00ff00);
        this.infoText.setText(t('reward.swapSelectPlayerDice')).setVisible(true);
        // allow swap until completed
        this.swapCompleted = false;
    }

    private selectPlayerDiceForSwap(playerDiceIndex: number, sprite: Phaser.GameObjects.Image) {
        if (this.swapCompleted) {
            // Swap already done, ignore further clicks
            return;
        }

        if (!this.selectedDice || this.selectedDiceIndex === null) {
            this.infoText.setText('Bitte wähle zuerst einen neuen Würfel!').setVisible(true);
            return;
        }

        // Tausch durchführen nur für den angeklickten Spieler-Würfel
        this.diceHandler.playersDice[playerDiceIndex] = this.selectedDice;

        // Markiere den getauschten Spieler-Würfel
        this.playerDiceSprites.forEach(s => s.setTint(0xffffff));
        sprite.setTint(0x00ff00);

        // Deaktiviere weitere Interaktionen an den Spieler-Würfeln
        this.playerDiceSprites.forEach((s) => {
            if (s.input) s.disableInteractive();
        });

        // Setze Swap-Flag, zeige Continue
        this.swapCompleted = true;
        this.continueButton.setVisible(true);
        this.continueText.setVisible(true);

        this.infoText.setText('Würfel getauscht! Klicke zum Fortfahren.').setVisible(true);
    }

    selectDice(dice: Dice, sprite: Phaser.GameObjects.Image) {
        // Normal-Modus: Einfach den Würfel hinzufügen
        this.selectedDice = dice;
        this.rewardDiceSprites.forEach(s => s.setTint(0xffffff));
        sprite.setTint(0x00ff00);
        this.continueButton.setVisible(true);
        this.continueText.setVisible(true);
    }

    continueToNextLevel() {
        if (this.isSwapMode) {
            // Swap-Modus: Nur Renderer aktualisieren
            this.diceHandler.renderPlayerDice();
            this.cleanup();
            this.scene.stop();
            this.scene.start('Game', { nextLevel: true });
        } else {
            // Normal-Modus: Würfel hinzufügen
            if (this.selectedDice) {
                this.diceHandler.addDice(this.selectedDice);
                this.cleanup();
                this.scene.stop();
                this.scene.start('Game', { nextLevel: true });
            }
        }
    }

    private cleanup() {
        this.rewardDiceSprites.forEach(sprite => sprite.destroy());
        this.playerDiceSprites.forEach(sprite => sprite.destroy());
        this.continueButton.destroy();
        this.continueText.destroy();
        this.titleText.destroy();
        this.infoText.destroy();
        this.background.destroy();
    }
}