import { Scene, type GameObjects, type Input, type Tweens } from 'phaser';

import { EventBus } from '../EventBus';
import { t, toggleLanguage } from '../labels';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const cam = this.cameras.main;
        this.background = this.add.image(768,512, 'mm_background');
        this.background.setDepth(-100);
        this.logo = this.add.image(768,512, 'logo');

        this.title = this.add.text(768, 900, t('mainMenu.clickToStart'), {
            fontFamily: 'funblob', fontSize: 60, color: '#ff9000',
            stroke: '#000000', strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const allDiceButton = this.add.text(180, 950, t('mainMenu.allDice'), {
            fontFamily: 'funblob', fontSize: 40, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            backgroundColor: '#1f2937'
        }).setOrigin(0.5).setPadding(14).setInteractive({ useHandCursor: true }).setDepth(100);

        const languageButton = this.add.text(cam.width - 120, 70, t('mainMenu.languageButton'), {
            fontFamily: 'funblob', fontSize: 30, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            backgroundColor: '#1f2937'
        }).setOrigin(0.5).setPadding(10).setInteractive({ useHandCursor: true }).setDepth(100);

        allDiceButton.on('pointerover', () => allDiceButton.setStyle({ color: '#ffdd75' }));
        allDiceButton.on('pointerout', () => allDiceButton.setStyle({ color: '#ffffff' }));
        allDiceButton.on('pointerdown', () => this.scene.start('DiceList'));

        languageButton.on('pointerover', () => languageButton.setStyle({ color: '#ffdd75' }));
        languageButton.on('pointerout', () => languageButton.setStyle({ color: '#ffffff' }));
        languageButton.on('pointerdown', () => {
            toggleLanguage();
            this.title.setText(t('mainMenu.clickToStart'));
            allDiceButton.setText(t('mainMenu.allDice'));
            languageButton.setText(t('mainMenu.languageButton'));
        });

        EventBus.emit('current-scene-ready', this);

        // Listener für Maus-Klick 
        this.input.on('pointerdown', (_pointer: Input.Pointer, currentlyOver: GameObjects.GameObject[]) => {
            if (currentlyOver && currentlyOver.length > 0) {
                return;
            }

            const levelEngine = window.levelEngine;
            if (levelEngine) {
                levelEngine.reset();
            }
            this.changeScene('Game');
        });
    }

    changeScene(newScene: string) {
        this.scene.start(newScene);
    }
}
