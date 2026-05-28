import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { t } from '../labels';

export class DiceList extends Scene {
    constructor() {
        super('DiceList');
    }

    create() {
        EventBus.emit('current-scene-ready', this);

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
        const visibleHeight = cam.height - listStartY - 40;

        const listContainer = this.add.container(0, listStartY);

        // Geometry mask so content is clipped to the visible area
        const maskShape = this.add.graphics({ x: 0, y: 0 });
        maskShape.fillStyle(0xffffff, 1);
        maskShape.fillRect(cam.centerX - rowWidth / 2, listStartY, rowWidth, visibleHeight);
        const mask = maskShape.createGeometryMask();
        listContainer.setMask(mask);
        // Hide the graphics used for the mask so it doesn't draw a white rectangle
        maskShape.setVisible(false);

        const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

        // Scrolling bounds
        const totalHeight = diceList.length * rowHeight;
        const minY = totalHeight > visibleHeight ? listStartY - (totalHeight - visibleHeight) : listStartY;
        const maxY = listStartY;

        let isDragging = false;
        let dragStartY = 0;
        let containerStartY = listContainer.y;

        // Add items into container (y positions are relative to container's origin)
        diceList.forEach((dice, index) => {
            const itemY = index * rowHeight;

            const rect = this.add.rectangle(cam.centerX, itemY + 70, rowWidth, 140, 0x1f2937, 0.92).setStrokeStyle(2, 0x374151);

            const nameText = this.add.text(140, itemY + 22, dice.getDisplayName(), {
                fontFamily: 'funblob',
                fontSize: 42,
                color: '#fbbf24',
                stroke: '#000000',
                strokeThickness: 8
            }).setOrigin(0, 0);

            const faceText = this.add.text(140, itemY + 72, `${t('diceList.faceValues')}: ${dice.getFaceValueLabel()}`, {
                fontFamily: 'funblob',
                fontSize: 28,
                color: '#e5e7eb',
                stroke: '#000000',
                strokeThickness: 6
            }).setOrigin(0, 0);

            const iconX = cam.centerX + rowWidth / 2 - 100;
            const icon = this.add.image(iconX, itemY + 70, dice.getDisplayTexture())
                .setOrigin(0.5, 0.5)
                .setScale(0.6)
                .setDepth(10);

            icon.setInteractive({ useHandCursor: true });
            icon.on('pointerover', () => icon.setScale(0.7));
            icon.on('pointerout', () => icon.setScale(0.6));

            listContainer.add([rect, nameText, faceText, icon]);
        });

        this.input.on('pointerdown', (pointer: any) => {
            if (pointer.y >= listStartY && pointer.y <= listStartY + visibleHeight) {
                isDragging = true;
                dragStartY = pointer.y;
                containerStartY = listContainer.y;
            }
        });

        this.input.on('pointerup', () => {
            isDragging = false;
        });

        this.input.on('pointermove', (pointer: any) => {
            if (!isDragging) return;
            const dy = pointer.y - dragStartY;
            listContainer.y = clamp(containerStartY + dy, minY, maxY);
        });

        this.input.on('wheel', (_pointer: any, _gameObjects: any, deltaX: number, deltaY: number) => {
            listContainer.y = clamp(listContainer.y - deltaY, minY, maxY);
        });
    }
}
