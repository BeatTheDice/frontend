import { Scene } from 'phaser';
import { LevelEngine } from '../classes/LevelEngine';
import { DiceHandler } from '../classes/DiceHandler';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  Progress bar 
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);
        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        //  Load Images
        this.load.image('logo', './images/BeatTheDiceLogo.png');
        this.load.image('mm_background', './images/mainmenu_background.png')

        this.load.image('dice', './images/dice.png');
        this.load.image('bag', './images/bag.png');

        // Dice face images 
        this.load.image('regular-dice-1', './images/Dice 1.png');
        this.load.image('regular-dice-2', './images/Dice 2.png');
        this.load.image('regular-dice-3', './images/Dice 3.png');
        this.load.image('regular-dice-4', './images/Dice 4.png');
        this.load.image('regular-dice-5', './images/Dice 5.png');
        this.load.image('regular-dice-6', './images/Dice 6.png');

        // Enemy images
        this.load.image('slime_idle', './images/slime_idle.png');
        this.load.image('slime_damage_low', './images/slime_damage_low.png');
        this.load.image('slime_damage_high', './images/slime_damage_high.png');
        this.load.image('slime_win', './images/slime_win.png');
        this.load.image('slime_dead', './images/slime_dead.png');

        this.load.image('skeleton_idle', './images/skeleton_idle.png');
        this.load.image('skeleton_damage_low', './images/skeleton_damage_low.png');
        this.load.image('skeleton_damage_high', './images/skeleton_damage_high.png');
        this.load.image('skeleton_win', './images/skeleton_win.png');
        this.load.image('skeleton_dead', './images/skeleton_dead.png');

        this.load.image('goblin_idle', './images/goblin_idle.png');
        this.load.image('goblin_damage_low', './images/goblin_damage_low.png');
        this.load.image('goblin_damage_high', './images/goblin_damage_high.png');
        this.load.image('goblin_win', './images/goblin_win.png');
        this.load.image('goblin_dead', './images/goblin_dead.png');

        this.load.image('dwarf_idle', './images/dwarf_idle.png');
        this.load.image('dwarf_damage_low', './images/dwarf_damage_low.png');
        this.load.image('dwarf_damage_high', './images/dwarf_damage_high.png');
        this.load.image('dwarf_win', './images/dwarf_win.png');
        this.load.image('dwarf_dead', './images/dwarf_dead.png');

        //  Load Fonts
        this.load.font('actionman', './fonts/Action-Man/Action_Man.ttf', 'truetype')

    }

    create ()
    {
        // create global instances of LevelEngine and DiceHandler
        window.levelEngine = new LevelEngine(this);
        window.diceHandler = new DiceHandler(this);
        

        // Move to the MainMenu.
        this.scene.start('MainMenu');
    }
}
