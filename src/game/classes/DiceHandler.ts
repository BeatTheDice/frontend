import type { GameObjects, Scene, Time } from 'phaser';
import { Dice } from '../base classes/Dice';
import { t } from '../labels';
import { DiceCollection } from '../collection classes/DiceCollection';

export class DiceHandler {
    scene: Scene;
    diceScale = 0.3;
    playersDice: Dice[] = [];
    diceCollection: DiceCollection;
    activeDiceSprites: GameObjects.Image[] = [];
    playerDiceSprites: GameObjects.Image[] = [];
    playerBadgeSprites: GameObjects.Text[] = [];
    diceInfoText?: GameObjects.Text;
    bagSprite: GameObjects.Image;
    diceBagOpen = false;
    baseX = 600;
    baseY = 880;
    bagTooltip: GameObjects.Text;
    toolTipTimer?: Time.TimerEvent;

    constructor(scene: Scene) {
        this.scene = scene;
        const gameWindow = globalThis as typeof globalThis & Window;
        this.diceCollection = gameWindow.diceCollection as DiceCollection;

        this.playersDice = [this.diceCollection.getDefaultDice(), this.diceCollection.getDefaultDice()];
    }

    clearDice() {
        for (const sprite of this.activeDiceSprites) {
            this.scene.tweens.killTweensOf(sprite);
            if (sprite.active) sprite.destroy();
        }
        this.activeDiceSprites = [];
    }

    private createDiceSprite(texture: string, x: number, y: number, depth: number) {
        if (!this.scene.textures.exists(texture)) {
            throw new Error(`Texture "${texture}" is not loaded`);
        }

        return this.scene.add
            .image(x, y, texture)
            .setOrigin(0.5)
            .setDepth(depth)
            .setScale(0)
            .setAlpha(1)
            .setVisible(true);
    }

    private createPlayerDiceSprite(texture: string, x: number, y: number, depth: number) {
        if (!this.scene.textures.exists(texture)) {
            console.warn(`Texture "${texture}" is not loaded for player dice display`);
            texture = 'regular-dice-6';
        }

        const sprite = this.scene.add.image(x, y, texture)
            .setOrigin(0.5)
            .setDepth(depth)
            .setScale(this.diceScale)
            .setAlpha(1)
            .setVisible(true)
            .setInteractive({ useHandCursor: true });

        return sprite;
    }

    renderPlayerDice() {
        // Remove old sprites and badges
        this.playerDiceSprites.forEach(sprite => sprite.destroy());
        this.playerDiceSprites = [];
        this.playerBadgeSprites.forEach(b => { if (b) b.destroy(); });
        this.playerBadgeSprites = [];
        if (this.bagSprite) this.bagSprite.destroy();
        if (this.diceInfoText) this.diceInfoText.destroy();

        // Erstelle den Beutel-Sprite
        this.bagSprite = this.scene.add.image(this.baseX, this.baseY, 'bag')
            .setOrigin(0.5)
            .setDepth(100)
            .setScale(0.4)
            .setInteractive({ useHandCursor: true });

        this.bagSprite.on('pointerdown', () => {
            this.toggleDiceBag();
        });

        this.bagTooltip = this.scene.add.text(0, 0, t('diceBag.tooltip'), {
        fontSize: '24px',
        fontFamily: 'funblob',
        backgroundColor: '#000000aa',
        color: '#ffffff',
        padding: { x: 6, y: 4 }
        })
        .setDepth(1000)
        .setVisible(false)
        .setOrigin(0.5);

        // Hover-Effekt
        this.bagSprite.on('pointerover', () => {
            this.bagSprite.setScale(0.43);

            if (this.toolTipTimer) {
                this.toolTipTimer.remove(false);
            }
            this.toolTipTimer = this.scene.time.delayedCall(500, () => {
                this.bagTooltip.setVisible(true);
                this.bagTooltip.setPosition(this.bagSprite.x, this.bagSprite.y - 150);
            });
        });

        this.bagSprite.on('pointerout', () => {
            this.bagSprite.setScale(0.4);

            if (this.toolTipTimer) {
                this.toolTipTimer.remove(false);
                this.toolTipTimer = undefined;
            }
            this.bagTooltip.setVisible(false);
        });

        // Erstelle den Info-Text für Hover
        this.diceInfoText = this.scene.add.text(this.baseX, this.baseY - 90, '', {
            fontFamily: 'funblob',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'left',
            wordWrap: { width: 240 }
        })
            .setDepth(300)
            .setAlpha(0.95)
            .setVisible(false);

        // Erstelle die Würfel-Sprites (initial versteckt)
        this.playersDice.forEach((dice, index) => {
            const x = this.baseX + index * 120;
            const sprite = this.createPlayerDiceSprite(dice.getDisplayTexture(), x, this.baseY, 100);
            sprite.setVisible(false);

            sprite.on('pointerover', () => {
                if (this.diceBagOpen) {
                    this.diceInfoText?.setText(dice.getHoverLabel()).setX(x - 40).setY(this.baseY - 90).setVisible(true);
                    this.scene.tweens.add({
                        targets: sprite,
                        scale: { from: this.diceScale, to: this.diceScale * 1.1 },
                        duration: 120,
                        ease: 'Quad.Out'
                    });
                }
            });

            sprite.on('pointerout', () => {
                this.diceInfoText?.setVisible(false);
                if (this.diceBagOpen) {
                    sprite.setScale(this.diceScale);
                }
            });

            this.playerDiceSprites.push(sprite);

            // Wenn der Würfel verzaubert ist, zeige ein kleines Badge (initial versteckt)
            if (dice.enchantment) {
                const badge = this.scene.add.text(x + 36, this.baseY - 36, dice.enchantment.shortCode, {
                    fontFamily: 'funblob',
                    fontSize: '18px',
                    color: '#ffffff',
                    backgroundColor: '#00aa00',
                    padding: { x: 6, y: 4 }
                }).setDepth(200).setOrigin(0.5).setVisible(false);
                this.playerBadgeSprites.push(badge);
            } else {
                this.playerBadgeSprites.push(null as any);
            }
        });
    }

    private animateDice(
        sprite: GameObjects.Image,
        dice: Dice,
        finalTexture: string,
        delayOffset = 0,
        rekursionRerolls?: { faceValue: number; texture: string }[],
        smallestBonusAmount?: number
    ): number {
        let totalDuration = 0;

        for (let i = 0; i < 12; i++) {
            totalDuration += 100 + i * 18 + delayOffset;
            const delay = totalDuration;

            this.scene.time.delayedCall(delay, () => {
                if (!sprite.active) return;

                const face = dice.roll();
                const textureKey = Object.values(face)[0];

                if (this.scene.textures.exists(textureKey)) {
                    sprite.setTexture(textureKey);
                }
            });
        }

        this.scene.tweens.add({
            targets: sprite,
            angle: 720,
            duration: totalDuration,
            ease: 'Cubic.Out'
        });

        this.scene.time.delayedCall(totalDuration, () => {
            if (!sprite.active) return;

            if (this.scene.textures.exists(finalTexture)) {
                sprite.setTexture(finalTexture);
            }

            sprite.setAngle(0);

            this.scene.tweens.add({
                targets: sprite,
                scale: { from: this.diceScale * 1.1, to: this.diceScale },
                duration: 120,
                ease: 'Quad.Out'
            });

            const enchant = dice.enchantment;
            if (enchant) {
                if (enchant.type === 'CopyNPaste') {
                    const dup = this.scene.add.image(sprite.x, sprite.y - 44, finalTexture)
                        .setOrigin(0.5)
                        .setDepth(sprite.depth + 1)
                        .setScale(this.diceScale * 0.7)
                        .setAlpha(0);

                    this.scene.tweens.add({ targets: dup, alpha: 1, duration: 200 });
                    this.scene.time.delayedCall(2300, () => { dup.destroy(); });
                } else if (enchant.type === 'Rekursion') {
                    if (rekursionRerolls && rekursionRerolls.length > 0) {
                        const startY = sprite.y - 44;
                        rekursionRerolls.forEach((reroll, rerollIndex) => {
                            const offsetY = startY - rerollIndex * 46;
                            const rerollDice = this.scene.add.image(sprite.x, offsetY, reroll.texture)
                                .setOrigin(0.5)
                                .setDepth(sprite.depth + 1)
                                .setScale(this.diceScale * 0.7)
                                .setAlpha(0);

                            const plusText = this.scene.add.text(sprite.x, offsetY + 28, `+${reroll.faceValue}`, {
                                fontFamily: 'funblob',
                                fontSize: '18px',
                                color: '#ffffff',
                                stroke: '#000000',
                                strokeThickness: 4,
                            }).setDepth(sprite.depth + 1).setOrigin(0.5).setAlpha(0);

                            this.scene.tweens.add({ targets: [rerollDice, plusText], alpha: 1, duration: 200, delay: rerollIndex * 120 });
                            this.scene.time.delayedCall(2300 + rerollIndex * 120, () => { rerollDice.destroy(); plusText.destroy(); });
                        });
                    } else {
                        const zBadge = this.scene.add.text(sprite.x, sprite.y - 44, 'RK', {
                            fontFamily: 'funblob', fontSize: '20px', color: '#ffffff', backgroundColor: '#aa00aa', padding: { x: 6, y: 4 }
                        }).setDepth(sprite.depth + 1).setOrigin(0.5).setAlpha(0);
                        this.scene.tweens.add({ targets: zBadge, alpha: 1, duration: 200 });
                        this.scene.time.delayedCall(2300, () => { zBadge.destroy(); });
                    }
                } else if (enchant.type === 'SmallestBonus') {
                    if (smallestBonusAmount && smallestBonusAmount > 0) {
                        const plusText = this.scene.add.text(sprite.x, sprite.y - 44, `+${smallestBonusAmount}`, {
                            fontFamily: 'funblob',
                            fontSize: '24px',
                            color: '#ffffff',
                            stroke: '#000000',
                            strokeThickness: 5,
                        }).setDepth(sprite.depth + 1).setOrigin(0.5).setAlpha(0);

                        this.scene.tweens.add({ targets: plusText, alpha: 1, duration: 200 });
                        this.scene.time.delayedCall(2300, () => { plusText.destroy(); });
                    }
                }
            }
        });

        return totalDuration + 120; // include final settle tween time
    }

    throwDice(): Promise<number[]> {
        this.clearDice();

        const cam = this.scene.cameras.main;
        const startX = 200;
        const startY = cam.height + 100;
        const targetX = 300;
        const targetY = cam.centerY;

        const results: number[] = [];
        let maxDuration = 0;

        this.playersDice.forEach((dice, index) => {
            const result = dice.roll();
            const initialValue = Number(Object.keys(result)[0]);
            const initialTexture = Object.values(result)[0];
            let finalValue = initialValue;
            let rekursionRerolls: { faceValue: number; texture: string }[] | undefined;
            let smallestBonusAmount = 0;

            if (dice.enchantment) {
                if (dice.enchantment.type === 'CopyNPaste') {
                    finalValue = dice.applyEnchantmentToValue(initialValue);
                } else if (dice.enchantment.type === 'Rekursion') {
                    if (initialValue === 1 || initialValue === 2) {
                        rekursionRerolls = [];
                        let rerollValue = initialValue;

                        while (rerollValue === 1 || rerollValue === 2) {
                            const reroll = dice.roll();
                            rerollValue = Number(Object.keys(reroll)[0]);
                            const rerollTexture = Object.values(reroll)[0];

                            finalValue += rerollValue;
                            rekursionRerolls.push({ faceValue: rerollValue, texture: rerollTexture });
                        }
                    }
                } else if (dice.enchantment.type === 'SmallestBonus') {
                    finalValue = dice.applyEnchantmentToValue(initialValue);
                    smallestBonusAmount = finalValue - initialValue;
                }
            }

            results.push(finalValue);

            let sprite: GameObjects.Image;

            try {
                sprite = this.createDiceSprite(initialTexture, startX, startY, 200 + index);
            } catch (error) {
                console.error(error);
                return;
            }

            this.activeDiceSprites.push(sprite);

            const rollDuration = this.animateDice(sprite, dice, initialTexture, index * 10, rekursionRerolls, smallestBonusAmount);
            maxDuration = Math.max(maxDuration, rollDuration);

            const moveDuration = 700 + index * 80;
            maxDuration = Math.max(maxDuration, moveDuration);

            this.scene.tweens.add({
                targets: sprite,
                x: targetX + index * 90,
                y: targetY + (index % 2 === 0 ? -8 : 8),
                scale: { from: 0, to: this.diceScale },
                duration: moveDuration,
                ease: 'Cubic.Out'
            });
        });

        return new Promise((resolve) => {
            this.scene.time.delayedCall(maxDuration, () => {
                resolve(results);
            });
        });
    }

    addDice(dice: Dice) {
        this.playersDice.push(dice);
    }

    private toggleDiceBag() {
        this.diceBagOpen = !this.diceBagOpen;

        if (this.diceBagOpen) {
            // Würfel aufgefächert anzeigen
            this.playerDiceSprites.forEach((sprite, index) => {
                const targetX = this.baseX + index * 120;

                sprite.setVisible(true);
                this.scene.tweens.add({
                    targets: sprite,
                    x: targetX,
                    y: this.baseY,
                    scale: this.diceScale,
                    duration: 300,
                    ease: 'Back.Out',
                    delay: index * 50
                });
                // badge mit animieren
                const badge = this.playerBadgeSprites[index];
                if (badge) {
                    badge.setVisible(true);
                    this.scene.tweens.add({ targets: badge, x: targetX + 36, y: this.baseY - 36, alpha: 1, duration: 300, delay: index * 50 });
                }
            });

            // Beutel leicht nach hinten verschieben
            this.scene.tweens.add({
                targets: this.bagSprite,
                x: this.baseX - 120,
                duration: 300,
                ease: 'Back.Out'
            });
        } else {
            // Würfel wieder einfalten
            this.playerDiceSprites.forEach((sprite, index) => {
                this.scene.tweens.add({
                    targets: sprite,
                    x: this.baseX,
                    y: this.baseY,
                    scale: 0,
                    duration: 200,
                    ease: 'Back.In',
                    delay: index * 30,
                    onComplete: () => {
                        sprite.setVisible(false);
                    }
                });
                const badge = this.playerBadgeSprites[index];
                if (badge) {
                    this.scene.tweens.add({ targets: badge, x: this.baseX + 36, y: this.baseY - 36, alpha: 0, duration: 200, delay: index * 30, onComplete: () => { badge.setVisible(false); } });
                }
            });

            // Beutel zurück an ursprüngliche Position
            this.scene.tweens.add({
                targets: this.bagSprite,
                x: this.baseX,
                duration: 300,
                ease: 'Back.Out'
            });
        }
    }
}
