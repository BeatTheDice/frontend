export type Language = 'de' | 'en';

type LabelKey =
    | 'mainMenu.clickToStart'
    | 'mainMenu.allDice'
    | 'mainMenu.languageButton'
    | 'diceList.header'
    | 'diceList.back'
    | 'diceList.noDiceFound'
    | 'diceList.faceValues'
    | 'game.level'
    | 'game.hp'
    | 'game.throwsLeft'
    | 'game.crit'
    | 'gameOver.title'
    | 'gameOver.subtitle'
    | 'winner.title'
    | 'winner.mainmenu'
    | 'winner.endless'
    | 'reward.title'
    | 'reward.continue'
    | 'reward.chooseDice'
    | 'game.rollTooltip'
    | 'diceBag.tooltip'
    | 'boss.vampireDrain';

export type DiceLabelKey =
    | 'dice.name.regular'
    | 'dice.name.even'
    | 'dice.name.odd'
    | 'dice.name.risk'
    | 'dice.name.steel';

export type EnemyLabelKey =
    | 'enemy.name.slime'
    | 'enemy.name.slime_blue'
    | 'enemy.name.slime_purple'
    | 'enemy.name.skeleton'
    | 'enemy.name.goblin'
    | 'enemy.name.goblin_grey'
    | 'enemy.name.goblin_red'
    | 'enemy.name.dwarf'
    | 'enemy.name.vampire'
    | 'enemy.name.vampire_ice';

type TranslationKey = LabelKey | DiceLabelKey | EnemyLabelKey;

const labels: Record<Language, Record<TranslationKey, string>> = {
    de: {
        'mainMenu.clickToStart': 'Klicke zum Starten',
        'mainMenu.allDice': 'Alle Würfel',
        'mainMenu.languageButton': 'DE',
        'diceList.header': 'Würfel-Beutel',
        'diceList.back': 'Zurück',
        'diceList.noDiceFound': 'Keine Würfel gefunden.',
        'diceList.faceValues': 'Augen',
        'game.level': 'Level',
        'game.hp': 'HP',
        'game.throwsLeft': 'Würfe übrig',
        'game.crit': 'Kritisch!',
        'gameOver.title': 'Spiel vorbei',
        'gameOver.subtitle': 'Klicke, um zum Hauptmenü zurückzukehren',
        'winner.title': 'Gewonnen!',
        'winner.mainmenu': 'Hauptmenü',
        'winner.endless': 'Endlosmodus',
        'reward.title': 'Wähle deinen Belohnungswürfel!',
        'reward.continue': 'Weiter',
        'reward.chooseDice': 'Wähle deinen Belohnungswürfel!',
        'game.rollTooltip': 'Würfeln',
        'diceBag.tooltip': 'Würfel anschauen',
        'boss.vampireDrain': 'Der Vampir saugt dich aus und heilt sich um {value} HP',
        'dice.name.regular': 'Regulärer Würfel',
        'dice.name.even': 'Gerader Würfel',
        'dice.name.odd': 'Ungerader Würfel',
        'dice.name.risk': 'Risiko Würfel',
        'dice.name.steel': 'Stahl Würfel',
        'enemy.name.slime': 'Schleim',
        'enemy.name.slime_blue': 'Blauer Schleim',
        'enemy.name.slime_purple': 'Lila Schleim',
        'enemy.name.skeleton': 'Skelett',
        'enemy.name.goblin': 'Kobold',
        'enemy.name.goblin_grey': 'Grauer Kobold',
        'enemy.name.goblin_red': 'Roter Kobold',
        'enemy.name.dwarf': 'Zwerg',
        'enemy.name.vampire': 'Vampir',
        'enemy.name.vampire_ice': 'Eisiger Vampir'
    },
    en: {
        'mainMenu.clickToStart': 'Click to start',
        'mainMenu.allDice': 'All dice',
        'mainMenu.languageButton': 'EN',
        'diceList.header': 'Dice Bag',
        'diceList.back': 'Back',
        'diceList.noDiceFound': 'No dice found.',
        'diceList.faceValues': 'Faces',
        'game.level': 'Level',
        'game.hp': 'HP',
        'game.throwsLeft': 'Throws left',
        'game.crit': 'Critical!',
        'gameOver.title': 'Game Over',
        'gameOver.subtitle': 'Click to return to the main menu',
        'winner.title': 'You won!',
        'winner.mainmenu': 'Main Menu',
        'winner.endless': 'Endless Mode',
        'reward.title': 'Choose your reward dice!',
        'reward.continue': 'Continue',
        'reward.chooseDice': 'Choose your reward dice!',
        'game.rollTooltip': 'Roll',
        'diceBag.tooltip': 'View dice',
        'boss.vampireDrain': 'The vampire drains you and heals for {value} HP',
        'dice.name.regular': 'Regular Dice',
        'dice.name.even': 'Even Dice',
        'dice.name.odd': 'Odd Dice',
        'dice.name.risk': 'Risk Dice',
        'dice.name.steel': 'Steel Dice',
        'enemy.name.slime': 'Slime',
        'enemy.name.slime_blue': 'Blue Slime',
        'enemy.name.slime_purple': 'Purple Slime',
        'enemy.name.skeleton': 'Skeleton',
        'enemy.name.goblin': 'Goblin',
        'enemy.name.goblin_grey': 'Grey Kobold',
        'enemy.name.goblin_red': 'Red Kobold',
        'enemy.name.dwarf': 'Dwarf',
        'enemy.name.vampire': 'Vampire',
        'enemy.name.vampire_ice': 'Ice Vampire'
    }
};

let currentLanguage: Language = 'de';

export const setLanguage = (language: Language) => {
    currentLanguage = language;
};

export const getLanguage = (): Language => currentLanguage;

export const t = (key: TranslationKey, variables?: Record<string, string | number>): string => {
    let text = labels[currentLanguage][key] ?? key;
    if (variables) {
        for (const [variable, value] of Object.entries(variables)) {
            text = text.replace(new RegExp(`\\{${variable}\\}`, 'g'), String(value));
        }
    }
    return text;
};

export const toggleLanguage = (): Language => {
    currentLanguage = currentLanguage === 'de' ? 'en' : 'de';
    return currentLanguage;
};
