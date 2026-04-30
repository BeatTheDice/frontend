import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { DiceHandler } from '../classes/DiceHandler';
import { Dice } from '../classes/Dice';

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

    constructor() {
        super('Reward');
    }

    init() {
        this.diceHandler = window.diceHandler as DiceHandler;
        this.diceHandler.scene = this;
    }

    create() {
        this.camera = this.cameras.main;

        this.background = this.add.image(768, 512, 'mm_background');

        this.titleText = this.add.text(768, 100, 'Wähle deinen Belohnungswürfel!', {
            fontFamily: 'actionman', fontSize: 48, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.infoText = this.add.text(768, 900, '', {
            fontFamily: 'actionman', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        // 3 zufällige Würfel aus dem verfügbaren Pool anzeigen
        const allDiceOptions: Dice[] = [
            new Dice([{ 1: 'regular-dice-1' }, { 2: 'regular-dice-2' }, { 3: 'regular-dice-3' }, { 4: 'regular-dice-4' }, { 5: 'regular-dice-5' }, { 6: 'regular-dice-6' }], 'Regular Dice'),
            new Dice([{ 2: 'evendice-2' }, { 4: 'evendice-4' }, { 6: 'evendice-6' }], 'Even Dice'),
            new Dice([{ 1: 'odddice-1' }, { 3: 'odddice-3' }, { 5: 'odddice-5' }, { 7: 'odddice-7' }], 'Odd Dice'),
            new Dice([{ 0: 'riskdice-0' }, { 0: 'riskdice-0' }, { 0: 'riskdice-0' }, { 0: 'riskdice-0' }, { 12: 'riskdice-12' }, { 16: 'riskdice-16' }], 'Risk Dice'),
            new Dice([{ 3: 'steeldice-3' }, { 4: 'steeldice-4' }, { 5: 'steeldice-5' }], 'Steel Dice')
        ];

        const diceOptions: Dice[] = this.getRandomDiceOptions(allDiceOptions, 3);

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
                this.infoText.setText(`${dice.name}: ${values}`).setVisible(true);
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

        this.continueText = this.add.text(768, 800, 'Weiter', {
            fontFamily: 'actionman', fontSize: 32, color: '#ff9000',
            stroke: '#893700', strokeThickness: 4,
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
        console.log('continueToNextLevel called');
        console.log('selectedDice:', this.selectedDice);
        console.log('diceHandler:', this.diceHandler);
        if (this.selectedDice) {
            console.log('Adding dice');
            this.diceHandler.addDice(this.selectedDice);
            this.rewardDiceSprites.forEach(sprite => sprite.destroy());
            this.continueButton.destroy();
            this.continueText.destroy();
            this.titleText.destroy();
            this.infoText.destroy();
            this.background.destroy();
            console.log('Stopping scene');
            this.scene.stop();
            console.log('Starting Game');
            this.scene.start('Game', { nextLevel: true });
        } else {
            console.log('No selectedDice');
        }
    }

    getRandomDiceOptions(diceOptions: Dice[], count: number): Dice[] {
        const options = [...diceOptions];
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        return options.slice(0, count);
    }
}