import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { t } from '../labels';
import { setupBackgroundAmbience } from '../BackgroundAmbience';

export class Winner extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    titleText: Phaser.GameObjects.Text;
    subtitleText: Phaser.GameObjects.Text;

    constructor() {
        super('Winner');
    }

    create() {
        this.camera = this.cameras.main;

        this.add.image(768, 512, 'sky_background').setDepth(-4);
        this.background = this.add.image(768, 512, 'main_background');
        this.background.setDepth(-2);
        setupBackgroundAmbience(this);

        this.titleText = this.add.text(768, 452, t('winner.title'), {
            fontFamily: 'funblob',
            fontSize: 80,
            color: '#ff9000',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const mainMenuButton = this.add.text(768, 700, t('winner.mainmenu'), {
            fontFamily: 'funblob',
            fontSize: 42,
            color: '#ffffff',
            backgroundColor: '#222222',
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        mainMenuButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        const endlessButton = this.add.text(768, 800, t('winner.endless'), {
            fontFamily: 'funblob',
            fontSize: 42,
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        endlessButton.on('pointerdown', () => {
            if ((window as any).levelEngine) {
                (window as any).levelEngine.isEndlessMode = true;
            }
            this.scene.start('Merchant');
        });

        EventBus.emit('current-scene-ready', this);
    }
}