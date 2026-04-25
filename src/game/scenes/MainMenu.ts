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
        this.logo = this.add.image(768,512, 'logo');

        this.title = this.add.text(768, 980, 'Klicke zum Starten', {
            fontFamily: 'actionman', fontSize: 60, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);

        // Listener für Maus-Klick 
        this.input.on('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
