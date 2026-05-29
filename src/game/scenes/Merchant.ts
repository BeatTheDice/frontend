import { Geom, Scene, Utils, type Cameras, type GameObjects } from 'phaser';
import { LevelEngine } from '../classes/LevelEngine';
import { t } from '../labels';
import { EventBus } from '../EventBus';
import { setupBackgroundAmbience } from '../BackgroundAmbience';
import { Artifact } from '../base classes/Artifact';
import { ALL_ARTIFACT_TYPES } from '../collection classes/ArtifactCollection';

export class Merchant extends Scene {
    camera: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    titleText: GameObjects.Text;
    levelEngine: LevelEngine;
    artifactButtons: GameObjects.Container[] = [];
    continueButton: GameObjects.Image;
    continueText: GameObjects.Text;
    infoText: GameObjects.Text;
    selectedArtifact?: Artifact;
    skipButton: GameObjects.Text;

    constructor() {
        super('Merchant');
    }

    init() {
        this.levelEngine = window.levelEngine as LevelEngine;
        if (this.levelEngine) this.levelEngine.scene = this;
    }

    create() {
        this.artifactButtons = [];
        this.selectedArtifact = undefined;

        this.camera = this.cameras.main;
        this.add.image(768, 512, 'sky_background').setDepth(-4);
        this.background = this.add.image(768, 512, 'main_background');
        this.background.setDepth(-2);
        setupBackgroundAmbience(this);

        this.titleText = this.add.text(768, 80, t('merchant.title'), {
            fontFamily: 'funblob',
            fontSize: 56,
            color: '#ff9000',
            stroke: '#000000',
            strokeThickness: 8,
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

        this.createContinueButton();
        
        this.skipButton = this.add.text(this.camera.width - 200, this.camera.height - 100, t('reward.skip'), {
            fontFamily: 'funblob',
            fontSize: 32,
            color: '#ffffff',
            backgroundColor: '#444444',
            stroke: '#000000',
            strokeThickness: 6,
            padding: { x: 20, y: 12 },
            align: 'center'
        }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true }).setVisible(true);

        this.skipButton.on('pointerdown', () => {
            this.continueToGame();
        });

        const offeredArtifacts = this.getAvailableArtifacts();

        const positions = [
            { x: 384, y: 450 },
            { x: 768, y: 450 },
            { x: 1152, y: 450 }
        ];

        offeredArtifacts.forEach((artifact, index) => {

            this.createArtifactButton(
                artifact,
                positions[index].x,
                positions[index].y
            );
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

        this.artifactButtons.forEach(button => {
            const border = button.list[1] as GameObjects.Graphics;

            border.clear();
            border.lineStyle(3, 0xffaa00, 1);
            border.strokeRoundedRect(-150,-60,300,120,10);
        });

        const border = container.list[1] as GameObjects.Graphics;

        border.clear();
        border.lineStyle(4, 0x00ff00, 1);
        border.strokeRoundedRect(-150,-60,300,120,10);

        this.continueButton.setVisible(true);
        this.continueText.setVisible(true);
    }

    private getAvailableArtifacts(): Artifact[] {

        const availableTypes = ALL_ARTIFACT_TYPES.filter(
            type => !this.levelEngine.artifactHandler.hasArtifact(type)
        );

        Utils.Array.Shuffle(availableTypes);

        const amount = Math.min(3, availableTypes.length);

        return availableTypes
            .slice(0, amount)
            .map(type => new Artifact(type));
    }

    private createContinueButton() {

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
    }

    private continueToGame() {
        if (this.selectedArtifact) {
            this.levelEngine.artifactHandler.addArtifact(
                this.selectedArtifact
            );
        }
        this.artifactButtons.forEach(button => button.destroy());
        this.skipButton.destroy();
        this.continueButton.destroy();
        this.continueText.destroy();
        this.titleText.destroy();
        this.infoText.destroy();
        this.background.destroy();
        this.scene.stop();
        this.scene.start('Reward');
    }
}
