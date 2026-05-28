import { Geom, Scene, type Cameras, type GameObjects } from 'phaser';
import { DiceHandler } from '../classes/DiceHandler';
import { Dice } from '../classes/Dice';
import { Enchantment, EnchantmentType } from '../classes/Enchantment';
import { t } from '../labels';
import { EventBus } from '../EventBus';
import { setupBackgroundAmbience } from '../BackgroundAmbience';

export class Magician extends Scene {
    camera: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    titleText: GameObjects.Text;
    diceHandler: DiceHandler;
    selectedDice: Dice | null = null;
    selectedDiceIndex: number | null = null;
    selectedEnchantment: Enchantment | null = null;
    diceSprites: GameObjects.Image[] = [];
    diceSelectionBadges: GameObjects.Text[] = [];
    enchantmentButtons: GameObjects.Container[] = [];
    enchantmentBadges: GameObjects.Text[] = [];
    previewBadge: GameObjects.Text | null = null;
    selectionBorder: GameObjects.Graphics | null = null;
    selectedEnchantmentContainer: GameObjects.Container | null = null;
    selectedEnchantmentBorder: GameObjects.Graphics | null = null;
    continueButton: GameObjects.Image;
    continueText: GameObjects.Text;
    infoText: GameObjects.Text;
    diceInfoText: GameObjects.Text;
    stepText: GameObjects.Text;
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
        this.add.image(768, 512, 'sky_background').setDepth(-4);
        this.background = this.add.image(768, 512, 'main_background');
        this.background.setDepth(-2);
        setupBackgroundAmbience(this);
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
        const baseY = 340;
        const playerDiceY = baseY + 120;
        const playerDiceCount = this.diceHandler.playersDice.length;
        const playerSpacing = 150;
        const baseScale = 0.55;
        const hoverScale = 0.65;

        this.diceHandler.playersDice.forEach((dice, index) => {
            // Zentriere die Würfel basierend auf ihrer Anzahl
            const x = baseX + (index - (playerDiceCount - 1) / 2) * playerSpacing;
            const sprite = this.add.image(x, playerDiceY, dice.getDisplayTexture())
                .setOrigin(0.5)
                .setScale(baseScale)
                .setDepth(50)
                .setInteractive({ useHandCursor: true });

            sprite.on('pointerover', () => {
                const values = dice.getFaceValues().join(', ');
                const enchantmentInfo = dice.getEnchantmentInfo();
                this.diceInfoText.setText(
                    `${dice.getDisplayName()}${enchantmentInfo}\n${values}`
                ).setVisible(true);
                sprite.setScale(hoverScale);
            });

            sprite.on('pointerout', () => {
                this.diceInfoText.setVisible(false);
                sprite.setScale(baseScale);
            });

            sprite.on('pointerdown', () => {
                this.selectDiceForEnchantment(dice, sprite, index);
            });

            this.diceSprites.push(sprite);

            if (dice.enchantment) {
                const badge = this.add.text(x + 36, playerDiceY - 36, dice.enchantment.shortCode, {
                    fontFamily: 'funblob', fontSize: '18px', color: '#ffffff', backgroundColor: '#00aa00', padding: { x: 6, y: 4 }
                }).setDepth(200).setOrigin(0.5);
                this.diceSelectionBadges.push(badge);
            } else {
                this.diceSelectionBadges.push(null as any);
            }
        });
    }

    private selectDiceForEnchantment(dice: Dice, sprite: GameObjects.Image, index: number) {
        this.selectedDice = dice;
        this.selectedDiceIndex = index;
        this.currentStep = 'selectEnchantment';

        // Highlight selected dice and reset previous dice
        const baseScale = 0.55;
        this.diceSprites.forEach(s => {
            s.setScale(baseScale);
            s.clearTint();
        });
        if (this.previewBadge) { this.previewBadge.destroy(); this.previewBadge = null; }
        this.selectedEnchantment = null;
        this.clearEnchantmentSelectionBorder();

        sprite.setScale(0.7);
        sprite.setTint(0x00ff00);
        this.showSelectionBorderOnSprite(sprite);

        // Update step text
        this.stepText.setText(t('magician.selectEnchantment'));

        // Create enchantment selection
        this.createEnchantmentSelection();
    }

    private createEnchantmentSelection() {
        // Remove old buttons if any
        this.enchantmentButtons.forEach(btn => btn.destroy());
        this.enchantmentButtons = [];
        this.selectedEnchantmentContainer = null;
        this.clearEnchantmentSelectionBorder();

        const enchantmentTypes: EnchantmentType[] = ['CopyNPaste', 'ZweiSamkeit'];
        const baseY = this.cameras.main.centerY + 260;
        const spacing = 400;
        const startX = 768 - ((enchantmentTypes.length - 1) * spacing) / 2;

        enchantmentTypes.forEach((type, index) => {
            const enchantment = new Enchantment(type);
            const x = startX + index * spacing;
            this.createEnchantmentButton(enchantment, x, baseY);
        });
    }

    private createEnchantmentButton(enchantment: Enchantment, x: number, y: number) {
        const width = 320;
        const height = 150;
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const container = this.add.container(x, y)
            .setDepth(50)
            .setInteractive(
                new Geom.Rectangle(-halfWidth, -halfHeight, width, height),
                Geom.Rectangle.Contains
            )
            .setVisible(true);

        // Background
        const bg = this.add.graphics()
            .fillStyle(0x1a1a2e, 1)
            .fillRoundedRect(-halfWidth, -halfHeight, width, height, 12);
        container.add(bg);

        // Border
        const border = this.add.graphics()
            .lineStyle(3, 0x00ddff, 1)
            .strokeRoundedRect(-halfWidth, -halfHeight, width, height, 12);
        container.add(border);

        // Title
        const titleText = this.add.text(0, 0, enchantment.name, {
            fontFamily: 'funblob',
            fontSize: 34,
            color: '#00ddff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        container.add(titleText);

        container.on('pointerover', () => {
            this.infoText.setText(enchantment.description).setVisible(true);
            container.setScale(1.04);
            border.clear();
            border.lineStyle(4, 0xffff00, 1);
            border.strokeRoundedRect(-halfWidth, -halfHeight, width, height, 12);
        });

        container.on('pointerout', () => {
            this.infoText.setVisible(false);
            container.setScale(1);

            const isSelected = this.selectedEnchantment?.type === enchantment.type;
            border.clear();
            if (isSelected) {
                border.lineStyle(4, 0x00ff00, 1);
            } else {
                border.lineStyle(3, 0x00ddff, 1);
            }
            border.strokeRoundedRect(-halfWidth, -halfHeight, width, height, 12);
        });

        container.on('pointerdown', () => {
            this.applyEnchantment(enchantment, container);
        });

        this.enchantmentButtons.push(container);
    }

    private applyEnchantment(enchantment: Enchantment, container: GameObjects.Container) {
        if (this.selectedDice && this.selectedDiceIndex !== null) {
            this.selectedEnchantment = enchantment;

            if (this.previewBadge) { this.previewBadge.destroy(); this.previewBadge = null; }

            const sprite = this.diceSprites[this.selectedDiceIndex];
            if (sprite) {
                this.previewBadge = this.add.text(sprite.x + 36, sprite.y - 36, enchantment.shortCode, {
                    fontFamily: 'funblob', fontSize: '18px', color: '#ffffff', backgroundColor: '#00aa00', padding: { x: 6, y: 4 }
                }).setDepth(200).setOrigin(0.5);
            }

            this.clearEnchantmentSelectionBorder();
            this.showSelectionBorderOnContainer(container);
            this.selectedEnchantmentContainer = container;

            this.continueButton.setVisible(true);
            this.continueText.setVisible(true);

            const values = this.selectedDice.getFaceValues().join(', ');
            this.diceInfoText.setText(
                `${this.selectedDice.getDisplayName()}\n` +
                `${t('magician.enchantmentLabel')}: ${enchantment.name}\n` +
                `${values}`
            ).setVisible(true);
        }
    }

    private clearEnchantmentSelectionBorder() {
        if (this.selectedEnchantmentBorder) {
            this.selectedEnchantmentBorder.destroy();
            this.selectedEnchantmentBorder = null;
        }
    }

    private clearDiceSelectionBorder() {
        if (this.selectionBorder) {
            this.selectionBorder.destroy();
            this.selectionBorder = null;
        }
    }

    private showSelectionBorderOnSprite(sprite: GameObjects.Image) {
        this.clearDiceSelectionBorder();
        const pad = 16;
        const w = sprite.displayWidth + pad;
        const h = sprite.displayHeight + pad;
        const x = sprite.x - w / 2;
        const y = sprite.y - h / 2;
        const g = this.add.graphics();
        g.lineStyle(6, 0xff9000, 1);
        g.strokeRoundedRect(x, y, w, h, 12);
        g.setDepth(sprite.depth + 1);
        this.selectionBorder = g;
    }

    private showSelectionBorderOnContainer(container: GameObjects.Container) {
        this.clearEnchantmentSelectionBorder();
        const width = 320;
        const height = 150;
        const pad = 12;
        const x = container.x - width / 2 - pad / 2;
        const y = container.y - height / 2 - pad / 2;
        const g = this.add.graphics();
        g.lineStyle(6, 0xff9000, 1);
        g.strokeRoundedRect(x, y, width + pad, height + pad, 14);
        g.setDepth(200);
        this.selectedEnchantmentBorder = g;
    }

    private continueToGame() {
        // If the player chose an enchantment preview, apply it now to only the selected dice
        if (this.selectedEnchantment && this.selectedDiceIndex !== null) {
            const original = this.diceHandler.playersDice[this.selectedDiceIndex];
            const cloned = original.clone();
            cloned.addEnchantment(this.selectedEnchantment);
            this.diceHandler.playersDice[this.selectedDiceIndex] = cloned;

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
        this.diceSelectionBadges.forEach(badge => { if (badge) badge.destroy(); });
        this.enchantmentButtons.forEach(button => button.destroy());
        this.enchantmentBadges.forEach(b => b.destroy());
        if (this.previewBadge) { this.previewBadge.destroy(); this.previewBadge = null; }
        if (this.selectionBorder) { this.selectionBorder.destroy(); this.selectionBorder = null; }
        if (this.selectedEnchantmentBorder) { this.selectedEnchantmentBorder.destroy(); this.selectedEnchantmentBorder = null; }
        this.continueButton.destroy();
        this.continueText.destroy();
        this.titleText.destroy();
        this.stepText.destroy();
        this.infoText.destroy();
        this.diceInfoText.destroy();
        this.background.destroy();
        this.scene.stop();
        this.scene.start('Game', { nextLevel: true });
    }
}
