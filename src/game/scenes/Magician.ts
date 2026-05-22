import { Scene } from 'phaser';
import { DiceHandler } from '../classes/DiceHandler';
import { Dice } from '../classes/Dice';
import { Enchantment, EnchantmentType } from '../classes/Enchantment';
import { t } from '../labels';
import { EventBus } from '../EventBus';

export class Magician extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    titleText: Phaser.GameObjects.Text;
    diceHandler: DiceHandler;
    selectedDice: Dice | null = null;
    selectedDiceIndex: number | null = null;
    selectedEnchantment: Enchantment | null = null;
    diceSprites: Phaser.GameObjects.Image[] = [];
    enchantmentButtons: Phaser.GameObjects.Container[] = [];
    enchantmentBadges: Phaser.GameObjects.Text[] = [];
    previewBadge: Phaser.GameObjects.Text | null = null;
    continueButton: Phaser.GameObjects.Image;
    continueText: Phaser.GameObjects.Text;
    infoText: Phaser.GameObjects.Text;
    diceInfoText: Phaser.GameObjects.Text;
    stepText: Phaser.GameObjects.Text;
    currentStep: 'selectDice' | 'selectEnchantment' = 'selectDice';

    constructor() {
        super('Magician');
    }

    init() {
        this.diceHandler = window.diceHandler as DiceHandler;
        this.diceHandler.scene = this;
    }

    create() {
        this.camera = this.cameras.main;
        this.background = this.add.image(768, 512, 'main_background');

        this.titleText = this.add.text(768, 60, t('magician.title'), {
            fontFamily: 'funblob',
            fontSize: 56,
            color: '#ff9000',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.stepText = this.add.text(768, 140, t('magician.selectDice'), {
            fontFamily: 'funblob',
            fontSize: 28,
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.infoText = this.add.text(768, 950, '', {
            fontFamily: 'funblob',
            fontSize: 24,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center',
            wordWrap: { width: 1000 }
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        this.diceInfoText = this.add.text(100, 200, '', {
            fontFamily: 'funblob',
            fontSize: 22,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'left'
        }).setOrigin(0, 0).setDepth(100).setVisible(false);

        this.createDiceSelection();

        // Continue Button (versteckt bis Enchantment ausgewählt)
        this.continueButton = this.add.image(768, 900, 'dice')
            .setOrigin(0.5)
            .setScale(0.3)
            .setDepth(50)
            .setVisible(false)
            .setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(768, 900, t('magician.continue'), {
            fontFamily: 'funblob',
            fontSize: 32,
            color: '#ff9000',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(60).setVisible(false);

        this.continueButton.on('pointerdown', () => {
            this.continueToGame();
        });

        EventBus.emit('current-scene-ready', this);
    }

    private createDiceSelection() {
        const baseX = 768;
        const baseY = 400;
        const playerDiceY = baseY + 150;
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
                this.diceInfoText.setText(
                    `${dice.getDisplayName()}${enchantmentInfo}\n${values}`
                ).setVisible(true);
                sprite.setScale(0.7);
            });

            sprite.on('pointerout', () => {
                this.diceInfoText.setVisible(false);
                sprite.setScale(0.6);
            });

            sprite.on('pointerdown', () => {
                this.selectDiceForEnchantment(dice, sprite, index);
            });

            this.diceSprites.push(sprite);
        });
    }

    private selectDiceForEnchantment(dice: Dice, sprite: Phaser.GameObjects.Image, index: number) {
        this.selectedDice = dice;
        this.selectedDiceIndex = index;
        this.currentStep = 'selectEnchantment';

        // Highlight selected dice
        // reset previous highlights/tints and remove any preview badge
        this.diceSprites.forEach(s => { s.setScale(0.6); s.setTint(0xffffff); });
        if (this.previewBadge) { this.previewBadge.destroy(); this.previewBadge = null; }
        this.selectedEnchantment = null;

        sprite.setScale(0.75);
        sprite.setTint(0x00ff00);

        // Update step text
        this.stepText.setText(t('magician.selectEnchantment'));

        // Create enchantment selection
        this.createEnchantmentSelection();
    }

    private createEnchantmentSelection() {
        // Remove old buttons if any
        this.enchantmentButtons.forEach(btn => btn.destroy());
        this.enchantmentButtons = [];

        const enchantmentTypes: EnchantmentType[] = ['CopyNPaste', 'ZweiSamkeit'];
        // Place enchantments lower so they don't overlap the player's dice
        const baseY = this.cameras.main.centerY + 180;
        const spacing = 360;

        enchantmentTypes.forEach((type, index) => {
            const enchantment = new Enchantment(type);
            const x = 768 + (index - 0.5) * spacing;
            this.createEnchantmentButton(enchantment, x, baseY);
        });
    }

    private createEnchantmentButton(enchantment: Enchantment, x: number, y: number) {
        const container = this.add.container(x, y)
            .setDepth(50)
            .setInteractive(
                new (window as any).Phaser.Geom.Rectangle(-140, -70, 280, 140),
                (window as any).Phaser.Geom.Rectangle.Contains
            )
            .setVisible(true);

        // Background
        const bg = this.add.graphics()
            .fillStyle(0x1a1a2e, 1)
            .fillRoundedRect(-140, -70, 280, 140, 10);
        container.add(bg);

        // Border
        const border = this.add.graphics()
            .lineStyle(3, 0x00ddff, 1)
            .strokeRoundedRect(-140, -70, 280, 140, 10);
        container.add(border);

        // Title
        const titleText = this.add.text(0, -40, enchantment.name, {
            fontFamily: 'funblob',
            fontSize: 26,
            color: '#00ddff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        container.add(titleText);

        // Description (abbreviated)
        const desc = enchantment.description.substring(0, 40);
        const descText = this.add.text(0, 15, desc + '...', {
            fontFamily: 'funblob',
            fontSize: 16,
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
            wordWrap: { width: 260 }
        }).setOrigin(0.5);
        container.add(descText);

        container.on('pointerover', () => {
            this.infoText.setText(enchantment.description).setVisible(true);
            container.setScale(1.08);
            border.clear();
            border.lineStyle(4, 0xffff00, 1);
            border.strokeRoundedRect(-140, -70, 280, 140, 10);
        });

        container.on('pointerout', () => {
            this.infoText.setVisible(false);
            container.setScale(1);
            border.clear();
            border.lineStyle(3, 0x00ddff, 1);
            border.strokeRoundedRect(-140, -70, 280, 140, 10);
        });

        container.on('pointerdown', () => {
            this.applyEnchantment(enchantment, container);
        });

        this.enchantmentButtons.push(container);
    }

    private applyEnchantment(enchantment: Enchantment, container: Phaser.GameObjects.Container) {
        if (this.selectedDice && this.selectedDiceIndex !== null) {
            // Do NOT apply yet. Store chosen enchantment as preview and show preview badge on selected sprite.
            this.selectedEnchantment = enchantment;

            // Remove existing preview badge
            if (this.previewBadge) { this.previewBadge.destroy(); this.previewBadge = null; }

            const sprite = this.diceSprites[this.selectedDiceIndex];
            if (sprite) {
                this.previewBadge = this.add.text(sprite.x + 36, sprite.y - 36, enchantment.shortCode, {
                    fontFamily: 'funblob', fontSize: '18px', color: '#ffffff', backgroundColor: '#00aa00', padding: { x: 6, y: 4 }
                }).setDepth(200).setOrigin(0.5);
            }

            // Highlight selected enchantment
            const border = container.list[1] as Phaser.GameObjects.Graphics;
            border.clear();
            border.lineStyle(4, 0x00ff00, 1);
            border.strokeRoundedRect(-140, -70, 280, 140, 10);

            // Show continue button
            this.continueButton.setVisible(true);
            this.continueText.setVisible(true);

            // Update dice info
            const values = this.selectedDice.getFaceValues().join(', ');
            this.diceInfoText.setText(
                `${this.selectedDice.getDisplayName()}\n` +
                `Verzauberung: ${enchantment.name}\n` +
                `${values}`
            ).setVisible(true);

            // preview badge already created above
        }
    }

    private continueToGame() {
        // If the player chose an enchantment preview, apply it now to only the selected dice
        if (this.selectedEnchantment && this.selectedDiceIndex !== null) {
            // Clone selected dice instance, apply enchantment and replace in player's dice array
            const original = this.diceHandler.playersDice[this.selectedDiceIndex];
            const cloned = original.clone();
            cloned.addEnchantment(this.selectedEnchantment);
            this.diceHandler.playersDice[this.selectedDiceIndex] = cloned;

            // Create a persistent badge in the scene (will be destroyed along with other scene objects)
            const sprite = this.diceSprites[this.selectedDiceIndex];
            if (sprite) {
                const badge = this.add.text(sprite.x + 36, sprite.y - 36, this.selectedEnchantment.shortCode, {
                    fontFamily: 'funblob', fontSize: '18px', color: '#ffffff', backgroundColor: '#00aa00', padding: { x: 6, y: 4 }
                }).setDepth(200).setOrigin(0.5);
                this.enchantmentBadges.push(badge);
            }
        }

        // Cleanup UI and go back to Game
        this.diceSprites.forEach(sprite => sprite.destroy());
        this.enchantmentButtons.forEach(button => button.destroy());
        this.enchantmentBadges.forEach(b => b.destroy());
        if (this.previewBadge) { this.previewBadge.destroy(); this.previewBadge = null; }
        this.continueButton.destroy();
        this.continueText.destroy();
        this.titleText.destroy();
        this.stepText.destroy();
        this.infoText.destroy();
        this.diceInfoText.destroy();
        this.background.destroy();
        this.scene.stop();
        this.scene.start('Reward');
    }
}
