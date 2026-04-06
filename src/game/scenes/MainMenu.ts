import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { GameData } from '../GameData';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    selectDiceButton: GameObjects.Image;
    logoTween: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(768,512, 'mm_background');
        this.logo = this.add.image(768,512, 'logo');

        this.title = this.add.text(768, 980, 'Klicke zum Starten', {
            fontFamily: 'actionman', fontSize: 60, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.selectDiceButton = this.add.image(1400, 900, 'bag').setOrigin(0.5).setDepth(100).setScale(0.3).setInteractive();

        EventBus.emit('current-scene-ready', this);

        // Globaler Klick-Listener für Spielstart (außer auf Beutel)
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.selectDiceButton.getBounds().contains(pointer.x, pointer.y)) {
                if (GameData.selectedDiceType === '') {
                    // Fehlermeldung anzeigen
                    const errorText = this.add.text(768, 600, 'Wähle zuerst einen Würfel aus!', {
                        fontFamily: 'actionman', fontSize: 40, color: '#ff0000',
                        stroke: '#000000', strokeThickness: 4,
                        align: 'center'
                    }).setOrigin(0.5).setDepth(200);
                    // Nach 3 Sekunden entfernen
                    this.time.delayedCall(3000, () => {
                        errorText.destroy();
                    });
                } else {
                    this.scene.start('Game');
                }
            }
        });

        // Listener für Select Dice Button
        this.selectDiceButton.on('pointerdown', () => {
            this.scene.start('DiceSelection');
        });
    }
    
    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo (vueCallback: ({ x, y }: { x: number, y: number }) => void)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        } 
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (vueCallback)
                    {
                        vueCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}
