import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { t } from '../labels';

interface GuideSection {
    title: string;
    description: string;
}

export class GameGuide extends Scene {
    constructor() {
        super('GameGuide');
    }

    create() {
        EventBus.emit('current-scene-ready', this);

        const cam = this.cameras.main;
        this.add.rectangle(cam.centerX, cam.centerY, cam.width * 0.92, cam.height * 0.92, 0x0f1726, 0.96);
        this.add.rectangle(cam.centerX, 76, cam.width * 0.96, 120, 0x111827, 0.95).setStrokeStyle(3, 0x4f46e5);

        this.add.text(cam.centerX, 80, t('gameGuide.title'), {
            fontFamily: 'funblob',
            fontSize: 64,
            color: '#ffda6f',
            stroke: '#000000',
            strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5, 0);

        const sections: GuideSection[] = [
            {
                title: t('gameGuide.gameplay'),
                description: t('gameGuide.gameplayDesc')
            },
            {
                title: t('gameGuide.levelProgression'),
                description: t('gameGuide.levelProgressionDesc')
            },
            {
                title: t('gameGuide.vampire'),
                description: t('gameGuide.vampireDesc')
            },
            {
                title: t('gameGuide.endlessMode'),
                description: t('gameGuide.endlessModeDesc')
            },
            {
                title: t('gameGuide.merchant'),
                description: t('gameGuide.merchantDesc')
            },
            {
                title: t('gameGuide.magician'),
                description: t('gameGuide.magicianDesc')
            },
            {
                title: t('gameGuide.leaderboardInfo'),
                description: t('gameGuide.leaderboardInfoDesc')
            }
        ];

        const listStartY = 170;
        const sectionPaddingX = 30;
        const sectionPaddingY = 20;
        const contentWidth = cam.width - 220;
        const visibleHeight = cam.height - listStartY - 40;

        // Create large interactive zone to capture input
        const inputZone = this.add.rectangle(cam.centerX, cam.centerY, cam.width, cam.height, 0x000000, 0);
        inputZone.setInteractive();

        const listContainer = this.add.container(0, listStartY);

        // Create mask using world coordinates (not relative to container)
        const maskGraphics = this.add.graphics({ x: 0, y: 0 });
        maskGraphics.fillStyle(0xffffff, 1);
        maskGraphics.fillRect(cam.centerX - contentWidth / 2, listStartY, contentWidth, visibleHeight);
        const mask = maskGraphics.createGeometryMask();
        listContainer.setMask(mask);
        maskGraphics.setVisible(false);

        const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

        // Pre-calculate section heights
        let totalHeight = 0;
        const sectionHeights: number[] = [];

        sections.forEach((section) => {
            const titleText = this.add.text(0, 0, section.title, {
                fontFamily: 'funblob',
                fontSize: 36,
                color: '#fbbf24',
                stroke: '#000000',
                strokeThickness: 6
            });
            titleText.setWordWrapWidth(contentWidth - sectionPaddingX * 2, true);
            const titleHeight = titleText.height;

            const descText = this.add.text(0, 0, section.description, {
                fontFamily: 'funblob',
                fontSize: 24,
                color: '#e5e7eb',
                stroke: '#000000',
                strokeThickness: 4
            });
            descText.setWordWrapWidth(contentWidth - sectionPaddingX * 2, true);
            const descHeight = descText.height;

            const sectionHeight = titleHeight + descHeight + sectionPaddingY * 3;
            sectionHeights.push(sectionHeight);
            totalHeight += sectionHeight;

            titleText.destroy();
            descText.destroy();
        });

        const minY = totalHeight > visibleHeight ? listStartY - (totalHeight - visibleHeight) : listStartY;
        const maxY = listStartY;

        let isDragging = false;
        let dragStartY = 0;
        let containerStartY = listContainer.y;

        // Add sections to container (positions are relative to container at y=listStartY)
        let currentY = 0;
        sections.forEach((section, index) => {
            const sectionHeight = sectionHeights[index];

            // Background rectangle
            const rect = this.add.rectangle(
                cam.centerX,
                currentY + sectionHeight / 2,
                contentWidth - 20,
                sectionHeight - 5,
                0x1f2937,
                0.92
            );
            rect.setStrokeStyle(2, 0x374151);
            listContainer.add(rect);

            // Title
            const titleText = this.add.text(
                cam.centerX - contentWidth / 2 + sectionPaddingX,
                currentY + sectionPaddingY,
                section.title,
                {
                    fontFamily: 'funblob',
                    fontSize: 36,
                    color: '#fbbf24',
                    stroke: '#000000',
                    strokeThickness: 6
                }
            );
            titleText.setWordWrapWidth(contentWidth - sectionPaddingX * 2, true);
            titleText.setOrigin(0, 0);
            listContainer.add(titleText);

            // Description
            const descY = currentY + sectionPaddingY + titleText.height + sectionPaddingY;
            const descText = this.add.text(
                cam.centerX - contentWidth / 2 + sectionPaddingX,
                descY,
                section.description,
                {
                    fontFamily: 'funblob',
                    fontSize: 24,
                    color: '#e5e7eb',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            );
            descText.setWordWrapWidth(contentWidth - sectionPaddingX * 2, true);
            descText.setOrigin(0, 0);
            listContainer.add(descText);

            currentY += sectionHeight;
        });

        // Mouse wheel scrolling on the interactive zone
        inputZone.on('wheel', (_pointer: any, _gameObjects: any, deltaY: number) => {
            let newY = listContainer.y - deltaY * 0.5;
            newY = clamp(newY, minY, maxY);
            listContainer.setY(newY);
        });

        // Drag scrolling on the interactive zone
        inputZone.on('pointerdown', () => {
            isDragging = true;
            dragStartY = this.input.activePointer.y;
            containerStartY = listContainer.y;
        });

        inputZone.on('pointermove', () => {
            if (!isDragging) return;
            const deltaY = this.input.activePointer.y - dragStartY;
            let newY = containerStartY + deltaY;
            newY = clamp(newY, minY, maxY);
            listContainer.setY(newY);
        });

        inputZone.on('pointerup', () => {
            isDragging = false;
        });

        // Create back button AFTER inputZone so it appears on top
        const backButton = this.add.text(90, 60, t('gameGuide.back'), {
            fontFamily: 'funblob',
            fontSize: 34,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            backgroundColor: '#1a1a1a'
        }).setPadding(12).setInteractive({ useHandCursor: true });
        backButton.setDepth(1000); // Ensure it's on top

        backButton.on('pointerover', () => backButton.setStyle({ color: '#ffdd75' }));
        backButton.on('pointerout', () => backButton.setStyle({ color: '#ffffff' }));
        backButton.on('pointerdown', () => this.scene.start('MainMenu'));
    }
}
