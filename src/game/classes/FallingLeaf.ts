import { Scene } from 'phaser';

export class FallingLeaf {
    scene: Scene;
    sprite: Phaser.GameObjects.Image | null = null;
    isActive = false;
    speed: number;
    baseX: number;
    rotation: number;
    driftX: number;
    driftAmount: number;

    constructor(scene: Scene) {
        this.scene = scene;
        this.speed = 0;
        this.baseX = 0;
        this.rotation = 0;
        this.driftX = 0;
        this.driftAmount = 0;
    }

    spawn(x: number, y: number, textureKey: string, speed: number) {
        if (!this.sprite) {
            this.sprite = this.scene.add.image(x, y, textureKey);
            this.sprite.setOrigin(0.5);
            this.sprite.setDepth(-50);
            this.sprite.setScale(0.4);
        } else {
            this.sprite.setTexture(textureKey);
            this.sprite.setPosition(x, y);
            this.sprite.setVisible(true);
        }

        this.speed = speed;
        this.baseX = x;
        this.rotation = 0;
        this.driftX = 0;
        this.driftAmount = 30 + Math.random() * 30;
        this.isActive = true;
    }

    update(delta: number) {
        if (!this.isActive || !this.sprite) return;

        const deltaMs = delta / 1000;

        // Fall downward
        this.sprite.y += this.speed * deltaMs;

        // Sway side to side
        this.driftX += deltaMs * 2;
        this.sprite.x = this.baseX + Math.sin(this.driftX) * this.driftAmount;

        // Spin as it falls
        this.sprite.angle += 200 * deltaMs;

        // Deactivate when offscreen
        if (this.sprite.y > this.scene.scale.height + 100) {
            this.isActive = false;
            this.sprite.setVisible(false);
        }
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
        this.sprite = null;
        this.isActive = false;
    }
}
