import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

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

        this.background = this.add.image(768, 512, 'mm_background');

        this.titleText = this.add.text(768, 452, 'Gewonnen!', {
            fontFamily: 'funblob', fontSize: 80, color: '#ff9000',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.subtitleText = this.add.text(768, 552, 'Klicke, um zum Hauptmenü zurückzukehren', {
            fontFamily: 'funblob', fontSize: 40, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5).setDepth(100);

        this.input.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        EventBus.emit('current-scene-ready', this);
    }
}
