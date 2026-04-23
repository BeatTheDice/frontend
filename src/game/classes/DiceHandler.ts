import { Scene, GameObjects } from 'phaser';
import { Dice } from '../classes/Dice';

export class DiceHandler {
    scene: Scene;
    diceScale = 0.3;
    playersDice: Dice[] = [];
    activeDiceSprites: GameObjects.Image[] = [];
    playerDiceSprites: GameObjects.Image[] = [];
    diceInfoText?: GameObjects.Text;
    bagSprite?: GameObjects.Image;
    diceBagOpen = false;
    playerDiceSprites: GameObjects.Image[] = [];
    diceInfoText?: GameObjects.Text;
    bagSprite?: GameObjects.Image;
    diceBagOpen = false;

    constructor(scene: Scene) {
        this.scene = scene;

        // Zwei Startwürfel generieren
        // Zwei Startwürfel generieren
        this.playersDice.push(
            new Dice([{ 1: 'regular-dice-1' }, { 2: 'regular-dice-2' }, { 3: 'regular-dice-3' }, { 4: 'regular-dice-4' }, { 5: 'regular-dice-5' }, { 6: 'regular-dice-6' }], 'Regular Dice')
        );
        this.playersDice.push(
            new Dice([{ 1: 'regular-dice-1' }, { 2: 'regular-dice-2' }, { 3: 'regular-dice-3' }, { 4: 'regular-dice-4' }, { 5: 'regular-dice-5' }, { 6: 'regular-dice-6' }], 'Regular Dice')
        );
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
        // Remove old sprites
        this.playerDiceSprites.forEach(sprite => sprite.destroy());
        this.playerDiceSprites = [];
        if (this.bagSprite) this.bagSprite.destroy();
        if (this.diceInfoText) this.diceInfoText.destroy();

        const cam = this.scene.cameras.main;
        const baseX = 210;
        const baseY = cam.height - 150;

        // Erstelle den Beutel-Sprite
        this.bagSprite = this.scene.add.image(baseX, baseY, 'bag')
            .setOrigin(0.5)
            .setDepth(100)
            .setScale(0.4)
            .setInteractive({ useHandCursor: true });

        this.bagSprite.on('pointerdown', () => {
            this.toggleDiceBag();
        });

        // Erstelle den Info-Text für Hover
        this.diceInfoText = this.scene.add.text(baseX, baseY - 90, '', {
            fontFamily: 'actionman',
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
            const x = baseX + index * 120;
            const sprite = this.createPlayerDiceSprite(dice.getDisplayTexture(), x, baseY, 100);
            sprite.setVisible(false);

            sprite.on('pointerover', () => {
                if (this.diceBagOpen) {
                    this.diceInfoText?.setText(dice.getHoverLabel()).setX(x - 40).setY(baseY - 90).setVisible(true);
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
        });
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
        // Remove old sprites
        this.playerDiceSprites.forEach(sprite => sprite.destroy());
        this.playerDiceSprites = [];
        if (this.bagSprite) this.bagSprite.destroy();
        if (this.diceInfoText) this.diceInfoText.destroy();

        const cam = this.scene.cameras.main;
        const baseX = 210;
        const baseY = cam.height - 150;

        // Erstelle den Beutel-Sprite
        this.bagSprite = this.scene.add.image(baseX, baseY, 'bag')
            .setOrigin(0.5)
            .setDepth(100)
            .setScale(0.4)
            .setInteractive({ useHandCursor: true });

        this.bagSprite.on('pointerdown', () => {
            this.toggleDiceBag();
        });

        // Erstelle den Info-Text für Hover
        this.diceInfoText = this.scene.add.text(baseX, baseY - 90, '', {
            fontFamily: 'actionman',
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
            const x = baseX + index * 120;
            const sprite = this.createPlayerDiceSprite(dice.getDisplayTexture(), x, baseY, 100);
            sprite.setVisible(false);

            sprite.on('pointerover', () => {
                if (this.diceBagOpen) {
                    this.diceInfoText?.setText(dice.getHoverLabel()).setX(x - 40).setY(baseY - 90).setVisible(true);
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
        });
    }

    private animateDice(sprite: GameObjects.Image, dice: Dice, finalTexture: string, delayOffset = 0): number {
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
        });

        return totalDuration + 120; // include final settle tween time
    }

    throwDice(): Promise<number[]> {
        this.clearDice();

        const cam = this.scene.cameras.main;
        const startX = 200;
        const startY = cam.height + 100;
        const baseX = 300;
        const targetY = cam.centerY;

        const results: number[] = [];
        let maxDuration = 0;

        this.playersDice.forEach((dice, index) => {
            const result = dice.roll();
            results.push(Number(Object.keys(result)[0]));

            let sprite: GameObjects.Image;

            try {
                sprite = this.createDiceSprite(Object.values(result)[0], startX, startY, 200 + index);
            } catch (error) {
                console.error(error);
                return;
            }

            this.activeDiceSprites.push(sprite);

            const rollDuration = this.animateDice(sprite, dice, Object.values(result)[0], index * 10);
            maxDuration = Math.max(maxDuration, rollDuration);

            const moveDuration = 700 + index * 80;
            maxDuration = Math.max(maxDuration, moveDuration);

            this.scene.tweens.add({
                targets: sprite,
                x: baseX + index * 90,
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
                const cam = this.scene.cameras.main;
                const baseX = 210;
                const baseY = cam.height - 150;
                const targetX = baseX + index * 120;

                sprite.setVisible(true);
                this.scene.tweens.add({
                    targets: sprite,
                    x: targetX,
                    y: baseY,
                    scale: this.diceScale,
                    duration: 300,
                    ease: 'Back.Out',
                    delay: index * 50
                });
            });

            // Beutel leicht nach hinten verschieben
            this.scene.tweens.add({
                targets: this.bagSprite,
                x: 140,
                duration: 300,
                ease: 'Back.Out'
            });
        } else {
            // Würfel wieder einfalten
            this.playerDiceSprites.forEach((sprite, index) => {
                const cam = this.scene.cameras.main;
                const baseX = 210;
                const baseY = cam.height - 150;

                this.scene.tweens.add({
                    targets: sprite,
                    x: baseX,
                    y: baseY,
                    scale: 0,
                    duration: 200,
                    ease: 'Back.In',
                    delay: index * 30,
                    onComplete: () => {
                        sprite.setVisible(false);
                    }
                });
            });

            // Beutel zurück an ursprüngliche Position
            this.scene.tweens.add({
                targets: this.bagSprite,
                x: 210,
                duration: 300,
                ease: 'Back.Out'
            });
        }
    }
}
