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
    | 'game.bonusThrows'
    | 'game.crit'
    | 'artifact.name.BonusThrowsOnCrit'
    | 'artifact.description.BonusThrowsOnCrit'
    | 'game.exit'
    | 'game.confirmExit'
    | 'game.yes'
    | 'game.no'
    | 'gameOver.title'
    | 'gameOver.subtitle'
    | 'winner.title'
    | 'winner.mainmenu'
    | 'winner.endless'
    | 'reward.title'
    | 'reward.titleSwap'
    | 'reward.continue'
    | 'reward.skip'
    | 'reward.chooseDice'
    | 'reward.swapInstruction'
    | 'reward.swapSelect'
    | 'reward.swapSelectPlayerDice'
    | 'reward.selectToSwap'
    | 'game.rollTooltip'
    | 'diceBag.tooltip'
    | 'boss.vampireDrain'
    | 'merchant.title'
    | 'merchant.subtitle'
    | 'merchant.continue'
    | 'magician.title'
    | 'magician.selectDice'
    | 'magician.selectEnchantment'
    | 'magician.continue'
    | 'magician.enchantmentLabel'
    | 'reward.mustSelectNewDice'
    | 'reward.swapPrepared'
    | 'reward.mustSelectNewAndPlayerDice'
    | 'enchantment.name.CopyNPaste'
    | 'enchantment.name.ZweiSamkeit'
    | 'enchantment.description.CopyNPaste'
    | 'enchantment.description.ZweiSamkeit';

export type DiceLabelKey =
    | 'dice.name.regular'
    | 'dice.name.even'
    | 'dice.name.odd'
    | 'dice.name.risk'
    | 'dice.name.iron'
    | 'dice.name.steel'
    | 'dice.name.d8'
    | 'dice.name.d10';

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
        'game.bonusThrows': 'Bonusrundwürfe',
        'game.crit': 'Kritisch!',
        'artifact.name.BonusThrowsOnCrit': 'Glücksstein',
        'artifact.description.BonusThrowsOnCrit': 'Bei jedem kritischen Treffer sammelt der Spieler einen Bonus-Wurf (max. 3)',
        'game.exit': 'Beenden',
        'game.confirmExit': 'Der Run wird abgebrochen. Sicher?',
        'game.yes': 'Ja',
        'game.no': 'Nein',
        'gameOver.title': 'Spiel vorbei',
        'gameOver.subtitle': 'Klicke, um zum Hauptmenü zurückzukehren',
        'winner.title': 'Gewonnen!',
        'winner.mainmenu': 'Hauptmenü',
        'winner.endless': 'Endlosmodus',
        'reward.title': 'Wähle deinen Belohnungswürfel!',
        'reward.titleSwap': 'Wähle einen Würfel zum Tauschen!',
        'reward.continue': 'Weiter',
        'reward.skip': 'Überspringen',
        'reward.chooseDice': 'Wähle deinen Belohnungswürfel!',
        'reward.swapInstruction': 'Wähle einen neuen Würfel und dann einen deiner aktuellen Würfel zum Tauschen',
        'reward.swapSelect': 'Neuer Würfel',
        'reward.swapSelectPlayerDice': 'Klicke auf einen deiner Würfel, um ihn zu tauschen',
        'reward.selectToSwap': 'Deine aktuellen Würfel:',
        'game.rollTooltip': 'Würfeln',
        'diceBag.tooltip': 'Würfel anschauen',
        'boss.vampireDrain': 'Der Vampir saugt dich aus und heilt sich um {value} HP',
        'merchant.title': 'Der Händler',
        'merchant.subtitle': 'Kaufe ein Artefakt mit passiven Effekten',
        'merchant.continue': 'Kaufen',
        'magician.title': 'Der Zauberer',
        'magician.selectDice': 'Wähle einen Würfel zum Verzaubern',
        'magician.selectEnchantment': 'Wähle eine Verzauberung für deinen Würfel',
        'magician.continue': 'Verzaubern',
        'magician.enchantmentLabel': 'Verzauberung',
        'reward.mustSelectNewDice': 'Bitte wähle zuerst einen neuen Würfel!',
        'reward.swapPrepared': 'Deine Wahl ist vorbereitet. Klicke auf Weiter, um den Tausch abzuschließen.',
        'reward.mustSelectNewAndPlayerDice': 'Bitte wähle zuerst einen neuen Würfel und deinen eigenen Würfel zum Tauschen.',
        'enchantment.name.CopyNPaste': 'Copy & Paste',
        'enchantment.name.ZweiSamkeit': 'Zweisamkeit',
        'enchantment.description.CopyNPaste': 'Jede gewürfelte Augenzahl wird doppelt zum Gesamt-Ergebnis addiert',
        'enchantment.description.ZweiSamkeit': 'Für jede gewürfelte Zwei +5 zur Augenzahl',
        'dice.name.regular': 'Regulärer Würfel',
        'dice.name.even': 'Gerader Würfel',
        'dice.name.odd': 'Ungerader Würfel',
        'dice.name.risk': 'Risiko Würfel',
        'dice.name.iron': 'Eiserner Würfel',
        'dice.name.steel': 'Stahl Würfel',
        'dice.name.d8': 'W8',
        'dice.name.d10': 'W10',
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
        'game.bonusThrows': 'Bonus throws',
        'game.crit': 'Critical!',
        'artifact.name.BonusThrowsOnCrit': 'Lucky Stone',
        'artifact.description.BonusThrowsOnCrit': 'On every critical hit the player gains one bonus throw (max 3)',
        'game.exit': 'Exit',
        'game.confirmExit': 'This run will be aborted. Are you sure?',
        'game.yes': 'Yes',
        'game.no': 'No',
        'gameOver.title': 'Game Over',
        'gameOver.subtitle': 'Click to return to the main menu',
        'winner.title': 'You won!',
        'winner.mainmenu': 'Main Menu',
        'winner.endless': 'Endless Mode',
        'reward.title': 'Choose your reward dice!',
        'reward.titleSwap': 'Choose a dice to swap!',
        'reward.continue': 'Continue',
        'reward.skip': 'Skip',
        'reward.chooseDice': 'Choose your reward dice!',
        'reward.swapInstruction': 'Choose a new dice and then one of your current dice to swap',
        'reward.swapSelect': 'New dice',
        'reward.swapSelectPlayerDice': 'Click one of your dice to swap it',
        'reward.selectToSwap': 'Your current dice:',
        'game.rollTooltip': 'Roll',
        'diceBag.tooltip': 'View dice',
        'boss.vampireDrain': 'The vampire drains you and heals for {value} HP',
        'merchant.title': 'The Merchant',
        'merchant.subtitle': 'Buy an artifact with passive effects',
        'merchant.continue': 'Buy',
        'magician.title': 'The Magician',
        'magician.selectDice': 'Choose a dice to enchant',
        'magician.selectEnchantment': 'Choose an enchantment for your dice',
        'magician.continue': 'Enchant',
        'magician.enchantmentLabel': 'Enchantment',
        'reward.mustSelectNewDice': 'Please choose a new dice first!',
        'reward.swapPrepared': 'Your swap is ready. Click Continue to complete the swap.',
        'reward.mustSelectNewAndPlayerDice': 'Please choose a new dice and one of your own dice to swap first.',
        'enchantment.name.CopyNPaste': 'Copy & Paste',
        'enchantment.name.ZweiSamkeit': 'Togetherness',
        'enchantment.description.CopyNPaste': 'Each rolled face value is added twice to the total result',
        'enchantment.description.ZweiSamkeit': 'For every rolled two, add +5 to the face value',
        'dice.name.regular': 'Regular Dice',
        'dice.name.even': 'Even Dice',
        'dice.name.odd': 'Odd Dice',
        'dice.name.risk': 'Risk Dice',
        'dice.name.iron': 'Iron Dice',
        'dice.name.steel': 'Steel Dice',
        'dice.name.d8': 'D8',
        'dice.name.d10': 'D10',
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
