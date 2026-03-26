import { Dice } from '../classes/Dice';

export class CombatHandler {
    playersDice: Dice[];

    constructor() {
        this.playersDice = [];
        //Hier zwei Startwürfel erstellen
        this.playersDice.push(new Dice([1, 2, 3, 4, 5, 6], 'Regular Dice')); 
        this.playersDice.push(new Dice([1, 2, 3, 4, 5, 6], 'Regular Dice'));
    }

    rollAllDice(): number {
        var total = 0; 
        for (const dice of this.playersDice) {
            total += dice.roll();
        }
        return total;
    }
}