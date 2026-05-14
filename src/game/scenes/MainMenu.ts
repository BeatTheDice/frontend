import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(768,512, 'mm_background');
        this.background.setDepth(-100);
        this.logo = this.add.image(768,512, 'logo');

        this.title = this.add.text(768, 900, 'Klicke zum Starten', {
            fontFamily: 'funblob', fontSize: 60, color: '#ff9000',
            stroke: '#000000', strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const allDiceButton = this.add.text(180, 950, 'Alle Würfel', {
            fontFamily: 'funblob', fontSize: 40, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            backgroundColor: '#1f2937'
        }).setOrigin(0.5).setPadding(14).setInteractive({ useHandCursor: true }).setDepth(100);

        allDiceButton.on('pointerover', () => allDiceButton.setStyle({ color: '#ffdd75' }));
        allDiceButton.on('pointerout', () => allDiceButton.setStyle({ color: '#ffffff' }));
        allDiceButton.on('pointerdown', () => this.scene.start('DiceList'));

        EventBus.emit('current-scene-ready', this);

        // Listener für Maus-Klick 
        this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
            if (currentlyOver && currentlyOver.length > 0) {
                return;
            }

            const levelEngine = window.levelEngine;
            if (levelEngine) {
                levelEngine.reset();
            }
            this.scene.start('Game');
        });
    }
}
