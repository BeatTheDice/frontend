import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { DiceHandler } from '../classes/DiceHandler';
import { Dice } from '../classes/Dice';
import { DiceCollection } from '../classes/DiceCollection';
import { t } from '../labels';
import { LevelEngine } from '../classes/LevelEngine';

export class Reward extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    titleText: Phaser.GameObjects.Text;
    rewardDiceSprites: Phaser.GameObjects.Image[] = [];
    continueButton: Phaser.GameObjects.Image;
    continueText: Phaser.GameObjects.Text;
    diceHandler: DiceHandler;
    selectedDice: Dice | null = null;
    infoText: Phaser.GameObjects.Text;
    diceCollection: DiceCollection;
    levelEngine: LevelEngine;

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

        this.titleText = this.add.text(768, 100, t('reward.title'), {
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
                sprite.setScale(0.5);
            });

            sprite.on('pointerdown', () => {
                this.selectDice(dice, sprite);
            });

            this.rewardDiceSprites.push(sprite);
        });

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

    selectDice(dice: Dice, sprite: Phaser.GameObjects.Image) {
        this.selectedDice = dice;
        // Highlight selected
        this.rewardDiceSprites.forEach(s => s.setTint(0xffffff));
        sprite.setTint(0x00ff00);

        // Show continue button
        this.continueButton.setVisible(true);
        this.continueText.setVisible(true);
    }

    continueToNextLevel() {
        if (this.selectedDice) {
            this.diceHandler.addDice(this.selectedDice);
            this.rewardDiceSprites.forEach(sprite => sprite.destroy());
            this.continueButton.destroy();
            this.continueText.destroy();
            this.titleText.destroy();
            this.infoText.destroy();
            this.background.destroy();
            this.scene.stop();
            this.scene.start('Game', { nextLevel: true });
        }
    }
}