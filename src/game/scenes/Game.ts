import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Dice } from '../classes/Dice';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    dice: Dice;
    diceText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;

        this.background = this.add.image(768, 512, 'mm_background');

        this.createTexts()

        this.createButtons()

        this.dice = new Dice();

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }

    createTexts ()
    {
        this.diceText = this.add.text(768, 512, '', {
            fontFamily: 'actionman', fontSize: 64, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
    }
    createButtons ()
    {
        const button = this.add.image(1100, 900, 'dice');

        // Interaktiv machen
        button.setInteractive();

        // Klick-Event
        button.on('pointerdown', () => {
            const result = this.dice.roll()            
            this.diceText.setText(result.toString());

            this.diceText.setScale(0);
            this.tweens.add({
                targets: this.diceText,
                scale: 1,
                duration: 200,
                ease: 'Back.Out'
            });
        });

        // Hover-Effekt
        button.on('pointerover', () => {
            button.setScale(1.1);
        });

        button.on('pointerout', () => {
            button.setScale(1);
        });

    }
}
