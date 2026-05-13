import { Scene } from 'phaser';
import { t } from '../labels';

export class DiceList extends Scene {
    constructor() {
        super('DiceList');
    }

    create() {
        const cam = this.cameras.main;
        this.add.rectangle(cam.centerX, cam.centerY, cam.width * 0.92, cam.height * 0.92, 0x0f1726, 0.96);
        this.add.rectangle(cam.centerX, 76, cam.width * 0.96, 120, 0x111827, 0.95).setStrokeStyle(3, 0x4f46e5);

        this.add.text(cam.centerX, 80, t('diceList.header'), {
            fontFamily: 'funblob',
            fontSize: 64,
            color: '#ffda6f',
            stroke: '#000000',
            strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5, 0);

        const backButton = this.add.text(90, 60, t('diceList.back'), {
            fontFamily: 'funblob',
            fontSize: 34,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            backgroundColor: '#1a1a1a'
        }).setPadding(12).setInteractive({ useHandCursor: true });

        backButton.on('pointerover', () => backButton.setStyle({ color: '#ffdd75' }));
        backButton.on('pointerout', () => backButton.setStyle({ color: '#ffffff' }));
        backButton.on('pointerdown', () => this.scene.start('MainMenu'));

        const diceCollection = window.diceCollection;
        const diceList = diceCollection?.getAllDiceOptions() ?? [];

        if (diceList.length === 0) {
            this.add.text(cam.centerX, cam.centerY, t('diceList.noDiceFound'), {
                fontFamily: 'funblob',
                fontSize: 36,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            }).setOrigin(0.5);
            return;
        }

        const listStartY = 170;
        const rowHeight = 170;
        const rowWidth = cam.width - 220;

        diceList.forEach((dice, index) => {
            const y = listStartY + index * rowHeight;

            this.add.rectangle(cam.centerX, y + 70, rowWidth, 140, 0x1f2937, 0.92).setStrokeStyle(2, 0x374151);

            this.add.text(140, y + 22, dice.getDisplayName(), {
                fontFamily: 'funblob',
                fontSize: 42,
                color: '#fbbf24',
                stroke: '#000000',
                strokeThickness: 8
            }).setOrigin(0, 0);

            this.add.text(140, y + 72, `${t('diceList.faceValues')}: ${dice.getFaceValueLabel()}`, {
                fontFamily: 'funblob',
                fontSize: 28,
                color: '#e5e7eb',
                stroke: '#000000',
                strokeThickness: 6
            }).setOrigin(0, 0);

            const icon = this.add.image(cam.width - 140, y + 70, dice.getDisplayTexture())
                .setOrigin(0.5, 0.5)
                .setScale(0.6)
                .setDepth(10);

            icon.setInteractive({ useHandCursor: true });
            icon.on('pointerover', () => icon.setScale(0.7));
            icon.on('pointerout', () => icon.setScale(0.6));
        });
    }
}
