import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

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

        this.background = this.add.image(768, 512, 'mm_background');

        this.gameOverText = this.add.text(768, 512, 'Game Over', {
            fontFamily: 'actionman', fontSize: 64, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.gameOverText = this.add.text(768, 582, 'Klicke, um zum Hauptmenü zurückzukehren', {
            fontFamily: 'actionman', fontSize: 64, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Listener für Maus-Klick 
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.scene.start('MainMenu');
        });
        
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
