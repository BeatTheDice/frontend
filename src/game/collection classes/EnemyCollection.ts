export class EnemyCollection {
    private readonly allEnemyTemplates: { name: string, idleTexture: string, lowDamageTexture: string, highDamageTexture: string, winTexture: string, deadTexture: string }[];

    constructor() {
        this.allEnemyTemplates = [
            {
                name : 'enemy.name.slime',
                idleTexture: 'slime_green_idle',
                lowDamageTexture: 'slime_green_damage_low',
                highDamageTexture: 'slime_green_damage_high',
                winTexture: 'slime_green_win',
                deadTexture: 'slime_green_dead'
            },{
                name : 'enemy.name.skeleton',
                idleTexture: 'skeleton_idle',
                lowDamageTexture: 'skeleton_damage_low',
                highDamageTexture: 'skeleton_damage_high',
                winTexture: 'skeleton_win',
                deadTexture: 'skeleton_dead'
            },{
                name : 'enemy.name.goblin',
                idleTexture: 'goblin_green_idle',
                lowDamageTexture: 'goblin_green_damage_low',
                highDamageTexture: 'goblin_green_damage_high',
                winTexture: 'goblin_green_win',
                deadTexture: 'goblin_green_dead'
            },{
                name : 'enemy.name.dwarf',
                idleTexture: 'dwarf_idle',
                lowDamageTexture: 'dwarf_damage_low',
                highDamageTexture: 'dwarf_damage_high',
                winTexture: 'dwarf_win',
                deadTexture: 'dwarf_dead'
            },{
                name : 'enemy.name.vampire',
                idleTexture: 'vampire_idle',
                lowDamageTexture: 'vampire_damage_low',
                highDamageTexture: 'vampire_damage_high',
                winTexture: 'vampire_win',
                deadTexture: 'vampire_dead'
            },{
                name : 'enemy.name.slime_blue',
                idleTexture: 'slime_blue_idle',
                lowDamageTexture: 'slime_blue_damage_low',
                highDamageTexture: 'slime_blue_damage_high',
                winTexture: 'slime_blue_win',
                deadTexture: 'slime_blue_dead'
            },{
                name : 'enemy.name.skeleton_black',
                idleTexture: 'skeleton_black_idle',
                lowDamageTexture: 'skeleton_black_damage_low',
                highDamageTexture: 'skeleton_black_damage_high',
                winTexture: 'skeleton_black_win',
                deadTexture: 'skeleton_black_dead'
            },{
                name : 'enemy.name.goblin_grey',
                idleTexture: 'goblin_grey_idle',
                lowDamageTexture: 'goblin_grey_damage_low',
                highDamageTexture: 'goblin_grey_damage_high',
                winTexture: 'goblin_grey_win',
                deadTexture: 'goblin_grey_dead'
            },{
                name : 'enemy.name.dwarf_fire',
                idleTexture: 'dwarf_fire_idle',
                lowDamageTexture: 'dwarf_fire_damage_low',
                highDamageTexture: 'dwarf_fire_damage_high',
                winTexture: 'dwarf_fire_win',
                deadTexture: 'dwarf_fire_dead'
            },{
                name : 'enemy.name.vampire_ice',
                idleTexture: 'vampire_ice_idle',
                lowDamageTexture: 'vampire_ice_damage_low',
                highDamageTexture: 'vampire_ice_damage_high',
                winTexture: 'vampire_ice_win',
                deadTexture: 'vampire_ice_dead'
            },{
                name : 'enemy.name.slime_purple',
                idleTexture: 'slime_purple_idle',
                lowDamageTexture: 'slime_purple_damage_low',
                highDamageTexture: 'slime_purple_damage_high',
                winTexture: 'slime_purple_win',
                deadTexture: 'slime_purple_dead'
            },{
                name : 'enemy.name.skeleton_burning',
                idleTexture: 'skeleton_burning',
                lowDamageTexture: 'skeleton_burning_damage_low',
                highDamageTexture: 'skeleton_burning_damage_high',
                winTexture: 'skeleton_burning_win',
                deadTexture: 'skeleton_burning_dead'
            },{
                name : 'enemy.name.goblin_red',
                idleTexture: 'goblin_red_idle',
                lowDamageTexture: 'goblin_red_damage_low',
                highDamageTexture: 'goblin_red_damage_high',
                winTexture: 'goblin_red_win',
                deadTexture: 'goblin_red_dead'
            },{
                name : 'enemy.name.dwarf_lightning',
                idleTexture: 'dwarf_lightning_idle',
                lowDamageTexture: 'dwarf_lightning_damage_low',
                highDamageTexture: 'dwarf_lightning_damage_high',
                winTexture: 'dwarf_lightning_win',
                deadTexture: 'dwarf_lightning_dead'
            },{
                name : 'enemy.name.vampire_dark',
                idleTexture: 'vampire_dark_idle',
                lowDamageTexture: 'vampire_dark_damage_low',
                highDamageTexture: 'vampire_dark_damage_high',
                winTexture: 'vampire_dark_win',
                deadTexture: 'vampire_dark_dead'
            }
        ];
    }

    getEnemyTemplateByNumber(enemyNumber: number): { name: string, idleTexture: string, lowDamageTexture: string, highDamageTexture: string, winTexture: string, deadTexture: string } {
        if (this.allEnemyTemplates[enemyNumber]) {
            return this.allEnemyTemplates[enemyNumber];
        }
        else {
            return this.allEnemyTemplates[this.allEnemyTemplates.length - 1];
        }
    }
}