import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { CombatHandler } from '../classes/CombatHandler';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    combatHandler: CombatHandler;
    diceText: Phaser.GameObjects.Text;

    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;

        this.background = this.add.image(768, 512, 'mm_background');

        this.createTexts()

        this.createButtons()

        this.combatHandler = new CombatHandler(this);

        EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        this.scene.start('GameOver');
    }

    createTexts() {
        this.diceText = this.add.text(768, 512, '', {
            fontFamily: 'actionman', fontSize: 64, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
    }
    createButtons() {
        const button = this.add.image(1100, 900, 'dice');

        // Interaktiv machen
        button.setInteractive();

        // Klick-Event
        button.on('pointerdown', () => {

            const result = this.combatHandler.throwDice([
                this.combatHandler.playersDice[0],
                this.combatHandler.playersDice[0],
                this.combatHandler.playersDice[0],
                this.combatHandler.playersDice[0],
                this.combatHandler.playersDice[0]
            ]);
            const total = result.reduce((s, v) => s + v, 0);

            this.diceText.setText(total.toString());

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
