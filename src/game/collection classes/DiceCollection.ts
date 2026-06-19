import { Dice } from '../base classes/Dice';

export class DiceCollection {

    private readonly allDiceOptions: Dice[] = [ ];

    constructor() {
        this.allDiceOptions = [        
        new Dice([{ 1: 'regular-dice-1' }, { 2: 'regular-dice-2' }, { 3: 'regular-dice-3' }, { 4: 'regular-dice-4' }, { 5: 'regular-dice-5' }, { 6: 'regular-dice-6' }], 'dice.name.regular', 1),
        new Dice([{ 2: 'evendice-2' }, { 4: 'evendice-4' }, { 6: 'evendice-6' }], 'dice.name.even', 1),
        new Dice([{ 1: 'odddice-1' }, { 3: 'odddice-3' }, { 5: 'odddice-5' }, { 7: 'odddice-7' }], 'dice.name.odd', 1),
        new Dice([{ 0: 'riskdice-0' }, { 0: 'riskdice-0' }, { 0: 'riskdice-0' }, { 0: 'riskdice-0' }, { 12: 'riskdice-12' }, { 16: 'riskdice-16' }], 'dice.name.risk', 1),
        new Dice([{ 3: 'irondice-3' }, { 4: 'irondice-4' }, { 5: 'irondice-5' }], 'dice.name.iron', 1),
        new Dice([{ 4: 'steeldice-4' }, { 5: 'steeldice-5' }, { 6: 'steeldice-6' }, { 7: 'steeldice-7' }], 'dice.name.steel', 3),
        new Dice([{ 1: 'd8-1' }, { 2: 'd8-2' }, { 3: 'd8-3' }, { 4: 'd8-4' }, { 5: 'd8-5' }, { 6: 'd8-6' }, { 7: 'd8-7' }, { 8: 'd8-8' }], 'dice.name.d8', 3),
        new Dice([{ 1: 'd10-1' }, { 2: 'd10-2' }, { 3: 'd10-3' }, { 4: 'd10-4' }, { 5: 'd10-5' }, { 6: 'd10-6' }, { 7: 'd10-7' }, { 8: 'd10-8' }, { 9: 'd10-9' }, { 10: 'd10-10' }], 'dice.name.d10', 5)
        ];
    }

    getDefaultDice(): Dice {
        return this.allDiceOptions[0];
    }

    getAllDiceOptions(): Dice[] {
        return [...this.allDiceOptions];
    }

    getRandomDiceOptions(count: number, appearanceLevel: number): Dice[] {
        const options = [...this.allDiceOptions].filter(dice => dice.appearanceLevel <= appearanceLevel);
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        return options.slice(0, count);
    }

}