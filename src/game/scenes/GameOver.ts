import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { t } from '../labels';
import { setupBackgroundAmbience } from '../BackgroundAmbience';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText : Phaser.GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main

        this.add.image(768, 512, 'sky_background').setDepth(-4);
        this.background = this.add.image(768, 512, 'main_background');
        this.background.setDepth(-2);
        setupBackgroundAmbience(this);

        this.gameOverText = this.add.text(768, 512, t('gameOver.title'), {
            fontFamily: 'funblob', fontSize: 64, color: '#ff9000',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.gameOverText = this.add.text(768, 582, t('gameOver.subtitle'), {
            fontFamily: 'funblob', fontSize: 64, color: '#ff9000',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Listener für Maus-Klick 
        this.input.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
        
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
