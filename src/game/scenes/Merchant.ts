import { Geom, Scene, type Cameras, type GameObjects } from 'phaser';
import { LevelEngine } from '../classes/LevelEngine';
import { Artifact } from '../classes/Artifact';
import { t } from '../labels';
import { EventBus } from '../EventBus';

export class Merchant extends Scene {
    camera: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    titleText: GameObjects.Text;
    levelEngine: LevelEngine;
    selectedArtifact: Artifact | null = null;
    artifactButtons: GameObjects.Container[] = [];
    continueButton: GameObjects.Image;
    continueText: GameObjects.Text;
    infoText: GameObjects.Text;

    constructor() {
        super('Merchant');
    }

    init() {
        this.levelEngine = window.levelEngine as LevelEngine;
        // if (this.levelEngine.currentLevel >= 5) {
        //     this.levelEngine.isEndlessMode = true;
        // }
    }

    create() {
        this.camera = this.cameras.main;
        this.background = this.add.image(768, 512, 'main_background');

        this.titleText = this.add.text(768, 80, t('merchant.title'), {
            fontFamily: 'funblob',
            fontSize: 56,
            color: '#ff9000',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const subtitleText = this.add.text(768, 160, t('merchant.subtitle'), {
            fontFamily: 'funblob',
            fontSize: 32,
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.infoText = this.add.text(768, 900, '', {
            fontFamily: 'funblob',
            fontSize: 28,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center',
            wordWrap: { width: 1000 }
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        // Nur ein Artefakt wird angeboten (BonusThrowsOnCrit)
        const artifact = new Artifact('BonusThrowsOnCrit');
        this.createArtifactButton(artifact, 768, 400);

        // Continue Button
        this.continueButton = this.add.image(768, 800, 'dice')
            .setOrigin(0.5)
            .setScale(0.3)
            .setDepth(50)
            .setVisible(false)
            .setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(768, 800, t('merchant.continue'), {
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

    private createArtifactButton(artifact: Artifact, x: number, y: number) {
        const container = this.add.container(x, y)
            .setDepth(50)
            .setInteractive(
                new Geom.Rectangle(-150, -60, 300, 120),
                Geom.Rectangle.Contains
            )
            .setVisible(true);

        // Background
        const bg = this.add.graphics()
            .fillStyle(0x2a2a2a, 1)
            .fillRoundedRect(-150, -60, 300, 120, 10);
        container.add(bg);

        // Border
        const border = this.add.graphics()
            .lineStyle(3, 0xffaa00, 1)
            .strokeRoundedRect(-150, -60, 300, 120, 10);
        container.add(border);

        // Title
        const titleText = this.add.text(0, 0, artifact.name, {
            fontFamily: 'funblob',
            fontSize: 36,
            color: '#ff9000',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        container.add(titleText);

        container.on('pointerover', () => {
            this.infoText.setText(artifact.description).setVisible(true);
            container.setScale(1.05);
            border.lineStyle(4, 0xffff00, 1);
            border.strokeRoundedRect(-150, -60, 300, 120, 10);
        });

        container.on('pointerout', () => {
            this.infoText.setVisible(false);
            container.setScale(1);

            const isSelected = this.selectedArtifact === artifact;
            border.clear();
            if (isSelected) {
                border.lineStyle(4, 0x00ff00, 1);
            } else {
                border.lineStyle(3, 0xffaa00, 1);
            }
            border.strokeRoundedRect(-150, -60, 300, 120, 10);
        });

        container.on('pointerdown', () => {
            this.selectArtifact(artifact, container);
        });

        this.artifactButtons.push(container);
    }

    private selectArtifact(artifact: Artifact, container: GameObjects.Container) {
        this.selectedArtifact = artifact;
        this.levelEngine.hasArtifact = true;
        this.levelEngine.currentArtifact = artifact;

        // Highlight selected
        const border = container.list[1] as GameObjects.Graphics;
        border.clear();
        border.lineStyle(4, 0x00ff00, 1);
        border.strokeRoundedRect(-150, -60, 300, 120, 10);

        // Show continue button
        this.continueButton.setVisible(true);
        this.continueText.setVisible(true);
    }

    private continueToGame() {
        this.artifactButtons.forEach(button => button.destroy());
        this.continueButton.destroy();
        this.continueText.destroy();
        this.titleText.destroy();
        this.infoText.destroy();
        this.background.destroy();
        this.scene.stop();
        this.scene.start('Reward');
    }
}
