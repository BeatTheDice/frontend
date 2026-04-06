import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { GameData } from '../GameData';

export class DiceSelection extends Scene
{
    background: GameObjects.Image;
    title: GameObjects.Text;
    diceImage: GameObjects.Image;
    selectedDice: string = '';

    constructor ()
    {
        super('DiceSelection');
    }

    create ()
    {
        this.background = this.add.image(768, 512, 'mm_background');

        this.title = this.add.text(768, 200, 'Wähle deine Würfel', {
            fontFamily: 'actionman', fontSize: 60, color: '#ff9000',
            stroke: '#893700', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Ein Bild mit zwei Würfeln anzeigen
        this.diceImage = this.add.image(768, 400, 'dice').setScale(0.5).setDepth(100).setInteractive();

        // Wenn bereits ausgewählt, anzeigen
        if (GameData.selectedDiceType === 'regular') {
            this.diceImage.setScale(0.6).setTint(0x00ff00);
            this.selectedDice = 'regular';
        }

        // Coming Soon Text (jetzt interaktiv)
        const comingSoonText = this.add.text(768, 500, 'Coming Soon...', {
            fontFamily: 'actionman', fontSize: 30, color: '#888888',
            align: 'center'
        }).setOrigin(0.5).setDepth(100).setInteractive();

        // Zurück Button
        const backButton = this.add.text(768, 800, 'Zurück', {
            fontFamily: 'actionman', fontSize: 50, color: '#ff9000',
            stroke: '#893700', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100).setInteractive();

        EventBus.emit('current-scene-ready', this);

        // Event Listener für Würfel-Auswahl
        this.diceImage.on('pointerdown', () => {
            this.selectedDice = 'regular';
            GameData.selectedDiceType = 'regular';
            // Größer machen und grün tönen
            this.diceImage.setScale(0.6).setTint(0x00ff00);
        });

        // Event Listener für Coming Soon
        comingSoonText.on('pointerdown', () => {
            comingSoonText.setText('Bald verfügbar!');
            comingSoonText.setColor('#ff0000');
            // Würfel zurücksetzen, da keine gültige Auswahl
            this.diceImage.setScale(0.5).setTint(0xffffff);
            this.selectedDice = '';
            GameData.selectedDiceType = '';
            // Nach 2 Sekunden zurücksetzen
            this.time.delayedCall(2000, () => {
                comingSoonText.setText('Coming Soon...');
                comingSoonText.setColor('#888888');
            });
        });

        backButton.on('pointerdown', () => {
            // Zurück ins Hauptmenü
            this.scene.start('MainMenu');
        });
    }
}