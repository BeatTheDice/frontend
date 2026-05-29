import { Scene, type GameObjects, type Input, type Tweens } from 'phaser';

import { EventBus } from '../EventBus';
import { GAME_EVENTS } from '../backend-events';
import { t, toggleLanguage } from '../labels';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const cam = this.cameras.main;
        this.background = this.add.image(768,512, 'mm_background');
        this.background.setDepth(-100);
        this.logo = this.add.image(768,512, 'logo');

        this.title = this.add.text(768, 900, t('mainMenu.clickToStart'), {
            fontFamily: 'funblob', fontSize: 60, color: '#ff9000',
            stroke: '#000000', strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Draw rounded background + text for buttons so they match overlay styling
        const btnPaddingX = 18;
        const btnPaddingY = 14;
        const btnRadius = 12;

        const createRoundedButton = (label: string, fontSize: number) => {
            const txt = this.add.text(0, 0, label, {
                fontFamily: 'funblob', fontSize, color: '#ffffff',
                stroke: '#000000', strokeThickness: 8
            }).setOrigin(0, 0);

            const gfx = this.add.graphics();

            // invisible rectangle used for interaction & cursor
            const hit = this.add.rectangle(0, 0, 10, 10, 0x000000, 0).setOrigin(0, 0).setInteractive(new Phaser.Geom.Rectangle(0, 0, 10, 10), Phaser.Geom.Rectangle.Contains).setDepth(101);

            const container = this.add.container(0, 0, [gfx, hit, txt]);
            container.setDepth(100);

            const rebuild = () => {
                const rectW = Math.ceil(txt.width + btnPaddingX * 2);
                const rectH = Math.ceil(txt.height + btnPaddingY * 2);

                gfx.clear();
                gfx.fillStyle(0x1f2937, 1);
                gfx.fillRoundedRect(0, 0, rectW, rectH, btnRadius);

                txt.x = btnPaddingX;
                txt.y = btnPaddingY;

                // update hit area without destroying the object to avoid input glitches
                // @ts-ignore
                hit.setDisplaySize(rectW, rectH);
                hit.setInteractive(new Phaser.Geom.Rectangle(0, 0, rectW, rectH), Phaser.Geom.Rectangle.Contains);

                // update container size for positioning
                // @ts-ignore - Phaser container setSize exists at runtime
                container.setSize(rectW, rectH);

                return { w: rectW, h: rectH, hit };
            };

            const dims = rebuild();

            return { container, txt, gfx, rebuild, width: dims.w, height: dims.h, hit: dims.hit };
        };

        const allDice = createRoundedButton(t('mainMenu.allDice'), 40);
        const language = createRoundedButton(t('mainMenu.languageButton'), 30);

        // Position: 24px margin to match overlay/menu spacing
        const margin = 24;

        // Position both buttons bottom-left, language above allDice (mirrors overlay layout)
        allDice.container.x = margin;
        // place allDice at bottom with margin
        // @ts-ignore
        allDice.container.y = cam.height - margin - allDice.height;

        // rebuild language to get correct dims then place above allDice
        const langDims = language.rebuild();
        const allDims = allDice.rebuild();

        language.container.x = margin;
        // gap of 10px between the two
        const gap = 10;
        // @ts-ignore
        language.container.y = cam.height - margin - allDims.h - gap - langDims.h;

        // wire up interactions on the hit rectangles (returned directly)
        const allHit = allDice.hit;
        const langHit = language.hit;

        if (allHit) {
            allHit.on('pointerover', () => allDice.txt.setStyle({ color: '#ffdd75' }));
            allHit.on('pointerout', () => allDice.txt.setStyle({ color: '#ffffff' }));
            allHit.on('pointerdown', () => this.scene.start('DiceList'));
        }

        if (langHit) {
            langHit.on('pointerover', () => language.txt.setStyle({ color: '#ffdd75' }));
            langHit.on('pointerout', () => language.txt.setStyle({ color: '#ffffff' }));
            langHit.on('pointerdown', () => {
                toggleLanguage();
                this.title.setText(t('mainMenu.clickToStart'));

                // update texts and rebuild backgrounds so sizes adapt
                allDice.txt.setText(t('mainMenu.allDice'));
                const nd = allDice.rebuild();

                language.txt.setText(t('mainMenu.languageButton'));
                const ld = language.rebuild();

                // reposition after rebuild
                allDice.container.x = margin;
                // @ts-ignore
                allDice.container.y = cam.height - margin - nd.h;
                language.container.x = margin;
                // @ts-ignore
                language.container.y = cam.height - margin - nd.h - gap - ld.h;
            });
        }

        EventBus.emit('current-scene-ready', this);

        // Listener für Maus-Klick 
        this.input.on('pointerdown', (_pointer: Input.Pointer, currentlyOver: GameObjects.GameObject[]) => {
            if (currentlyOver && currentlyOver.length > 0) {
                return;
            }

            const gameWindow = globalThis as typeof globalThis & Window;
            const levelEngine = gameWindow.levelEngine;
            if (levelEngine) {
                levelEngine.reset();
            }

            EventBus.emit(GAME_EVENTS.runStartRequested);
            this.changeScene('Game');
        });
    }

    changeScene(newScene: string) {
        this.scene.start(newScene);
    }
}
