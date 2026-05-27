import { Scene, type GameObjects } from 'phaser';

export class AnimatedCloud {
    scene: Scene;
    sprite: GameObjects.Image | null = null;
    isActive = false;
    speed: number = 0;
    baseY: number = 0;
    bobOffset: number = 0;
    needsRecycle = false;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    spawn(x: number, y: number, textureKey: string, speed: number) {
        if (!this.sprite) {
            this.sprite = this.scene.add.image(x, y, textureKey);
            this.sprite.setOrigin(0.5);
            this.sprite.setDepth(-50);
            this.sprite.setScale(0.35);
        } else {
            this.sprite.setPosition(x, y);
            this.sprite.setVisible(true);
        }

        this.speed = speed;
        this.baseY = y;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.isActive = true;
        this.needsRecycle = false;
    }

    getX(): number {
        return this.sprite?.x ?? 0;
    }

    update(delta: number) {
        if (!this.isActive || !this.sprite) return;

        const dt = delta / 1000;

        // Move left to right
        this.sprite.x += this.speed * dt;

        // Gentle bobbing
        this.bobOffset += dt * 0.8;
        this.sprite.y = this.baseY + Math.sin(this.bobOffset) * 6;

        // Flag for recycle when fully off the right edge
        if (this.sprite.x > this.scene.scale.width + 200) {
            this.needsRecycle = true;
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
