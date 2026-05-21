import { Scene } from 'phaser';
import { LevelEngine } from '../classes/LevelEngine';
import { DiceHandler } from '../classes/DiceHandler';
import { DiceCollection } from '../classes/DiceCollection';
import { EnemyCollection } from '../classes/EnemyCollection';

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
        this.load.image('main_background', './images/ingame_background.png');

        this.load.image('dice', './images/dice.png');
        this.load.image('bag', './images/bag.png');
        this.load.image('dicecupStanding', './images/dicecup standing.png');
        this.load.image('dicecupLying', './images/dicecup tilted 2.png');

        // Dice face images 
        this.load.image('regular-dice-1', './images/dice/dice1.png');
        this.load.image('regular-dice-2', './images/dice/dice2.png');
        this.load.image('regular-dice-3', './images/dice/dice3.png');
        this.load.image('regular-dice-4', './images/dice/dice4.png');
        this.load.image('regular-dice-5', './images/dice/dice5.png');
        this.load.image('regular-dice-6', './images/dice/dice6.png');

        this.load.image('evendice-2', './images/dice/evendice 2.png');
        this.load.image('evendice-4', './images/dice/evendice 4.png');
        this.load.image('evendice-6', './images/dice/evendice 6.png');

        this.load.image('odddice-1', './images/dice/odddice 1.png');
        this.load.image('odddice-3', './images/dice/odddice 3.png');
        this.load.image('odddice-5', './images/dice/odddice 5.png');
        this.load.image('odddice-7', './images/dice/odddice 7.png');

        this.load.image('riskdice-0', './images/dice/riskdice 0.png');
        this.load.image('riskdice-12', './images/dice/riskdice 12.png');
        this.load.image('riskdice-16', './images/dice/riskdice 16.png');

        this.load.image('steeldice-3', './images/dice/steeldice 3.png');
        this.load.image('steeldice-4', './images/dice/steeldice 4.png');
        this.load.image('steeldice-5', './images/dice/steeldice 5.png');

        this.load.image('d8-1', './images/dice/d8 1.png');
        this.load.image('d8-2', './images/dice/d8 2.png');
        this.load.image('d8-3', './images/dice/d8 3.png');
        this.load.image('d8-4', './images/dice/d8 4.png');
        this.load.image('d8-5', './images/dice/d8 5.png');
        this.load.image('d8-6', './images/dice/d8 6.png');
        this.load.image('d8-7', './images/dice/d8 7.png');
        this.load.image('d8-8', './images/dice/d8 8.png');

        this.load.image('d10-1', './images/dice/d10 1.png');
        this.load.image('d10-2', './images/dice/d10 2.png');
        this.load.image('d10-3', './images/dice/d10 3.png');
        this.load.image('d10-4', './images/dice/d10 4.png');
        this.load.image('d10-5', './images/dice/d10 5.png');
        this.load.image('d10-6', './images/dice/d10 6.png');
        this.load.image('d10-7', './images/dice/d10 7.png');
        this.load.image('d10-8', './images/dice/d10 8.png');
        this.load.image('d10-9', './images/dice/d10 9.png');
        this.load.image('d10-10', './images/dice/d10 10.png');

        // Enemy images
        // slime
        this.load.image('slime_green_idle', './images/enemy/slime_green/idle.png');
        this.load.image('slime_green_damage_low', './images/enemy/slime_green/damage_low.png');
        this.load.image('slime_green_damage_high', './images/enemy/slime_green/damage_high.png');
        this.load.image('slime_green_win', './images/enemy/slime_green/win.png');
        this.load.image('slime_green_dead', './images/enemy/slime_green/dead.png');

        this.load.image('slime_blue_idle', './images/enemy/slime_blue/idle.png');
        this.load.image('slime_blue_damage_low', './images/enemy/slime_blue/damage_low.png');
        this.load.image('slime_blue_damage_high', './images/enemy/slime_blue/damage_high.png');
        this.load.image('slime_blue_win', './images/enemy/slime_blue/win.png');
        this.load.image('slime_blue_dead', './images/enemy/slime_blue/dead.png');

        this.load.image('slime_purple_idle', './images/enemy/slime_purple/idle.png');
        this.load.image('slime_purple_damage_low', './images/enemy/slime_purple/damage_low.png');
        this.load.image('slime_purple_damage_high', './images/enemy/slime_purple/damage_high.png');
        this.load.image('slime_purple_win', './images/enemy/slime_purple/win.png');
        this.load.image('slime_purple_dead', './images/enemy/slime_purple/dead.png');

        // skeleton
        this.load.image('skeleton_idle', './images/enemy/skeleton/idle.png');
        this.load.image('skeleton_damage_low', './images/enemy/skeleton/damage_low.png');
        this.load.image('skeleton_damage_high', './images/enemy/skeleton/damage_high.png');
        this.load.image('skeleton_win', './images/enemy/skeleton/win.png');
        this.load.image('skeleton_dead', './images/enemy/skeleton/dead.png');

        // goblin
        this.load.image('goblin_green_idle', './images/enemy/goblin_green/idle.png');
        this.load.image('goblin_green_damage_low', './images/enemy/goblin_green/damage_low.png');
        this.load.image('goblin_green_damage_high', './images/enemy/goblin_green/damage_high.png');
        this.load.image('goblin_green_win', './images/enemy/goblin_green/win.png');
        this.load.image('goblin_green_dead', './images/enemy/goblin_green/dead.png');

        this.load.image('goblin_grey_idle', './images/enemy/goblin_grey/idle.png');
        this.load.image('goblin_grey_damage_low', './images/enemy/goblin_grey/damage_low.png');
        this.load.image('goblin_grey_damage_high', './images/enemy/goblin_grey/damage_high.png');
        this.load.image('goblin_grey_win', './images/enemy/goblin_grey/win.png');
        this.load.image('goblin_grey_dead', './images/enemy/goblin_grey/dead.png');

        this.load.image('goblin_red_idle', './images/enemy/goblin_red/idle.png');
        this.load.image('goblin_red_damage_low', './images/enemy/goblin_red/damage_low.png');
        this.load.image('goblin_red_damage_high', './images/enemy/goblin_red/damage_high.png');
        this.load.image('goblin_red_win', './images/enemy/goblin_red/win.png');
        this.load.image('goblin_red_dead', './images/enemy/goblin_red/dead.png');

        // dwarf
        this.load.image('dwarf_idle', './images/enemy/dwarf/idle.png');
        this.load.image('dwarf_damage_low', './images/enemy/dwarf/damage_low.png');
        this.load.image('dwarf_damage_high', './images/enemy/dwarf/damage_high.png');
        this.load.image('dwarf_win', './images/enemy/dwarf/win.png');
        this.load.image('dwarf_dead', './images/enemy/dwarf/dead.png');

        // vampire
        this.load.image('vampire_idle', './images/enemy/vampire/idle.png');        
        this.load.image('vampire_damage_low', './images/enemy/vampire/damage_low.png');
        this.load.image('vampire_damage_high', './images/enemy/vampire/damage_high.png');
        this.load.image('vampire_dead', './images/enemy/vampire/dead.png');
        this.load.image('vampire_victory', './images/enemy/vampire/win.png');

        this.load.image('vampire_ice_idle', './images/enemy/vampire_ice/idle.png');
        this.load.image('vampire_ice_damage_low', './images/enemy/vampire_ice/damage_low.png');
        this.load.image('vampire_ice_damage_high', './images/enemy/vampire_ice/damage_high.png');
        this.load.image('vampire_ice_dead', './images/enemy/vampire_ice/dead.png');
        this.load.image('vampire_ice_victory', './images/enemy/vampire_ice/win.png');

        //  Load Fonts
        this.load.font('funblob', 'fonts/fun-blob/FunBlob.ttf', 'truetype')
    }

    create ()
    {
        // create global instances 
        window.diceCollection = new DiceCollection();
        window.enemyCollection = new EnemyCollection();
        window.levelEngine = new LevelEngine(this);
        window.diceHandler = new DiceHandler(this);

        // Move to the MainMenu.
        this.scene.start('MainMenu');
    }
}
