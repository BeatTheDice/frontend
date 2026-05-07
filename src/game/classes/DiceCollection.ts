import { Dice } from './Dice';

export class DiceCollection {
    private readonly allDiceOptions: Dice[] = [ ];

    constructor() {
        this.allDiceOptions = [        
        new Dice([{ 1: 'regular-dice-1' }, { 2: 'regular-dice-2' }, { 3: 'regular-dice-3' }, { 4: 'regular-dice-4' }, { 5: 'regular-dice-5' }, { 6: 'regular-dice-6' }], 'Regular Dice'),
        new Dice([{ 2: 'evendice-2' }, { 4: 'evendice-4' }, { 6: 'evendice-6' }], 'Even Dice'),
        new Dice([{ 1: 'odddice-1' }, { 3: 'odddice-3' }, { 5: 'odddice-5' }, { 7: 'odddice-7' }], 'Odd Dice'),
        new Dice([{ 0: 'riskdice-0' }, { 0: 'riskdice-0' }, { 0: 'riskdice-0' }, { 0: 'riskdice-0' }, { 12: 'riskdice-12' }, { 16: 'riskdice-16' }], 'Risk Dice'),
        new Dice([{ 3: 'steeldice-3' }, { 4: 'steeldice-4' }, { 5: 'steeldice-5' }], 'Steel Dice')
        ];
    }

    getRandomDiceOptions(count: number): Dice[] {
        const options = [...this.allDiceOptions];
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        return options.slice(0, count);
    }

}