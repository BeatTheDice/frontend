import { Scene } from 'phaser';
import { AnimatedCloud } from './classes/AnimatedCloud';
import { FallingLeaf } from './classes/FallingLeaf';

export function setupBackgroundAmbience(scene: Scene) {
    const clouds: AnimatedCloud[] = [];
    const leaves: FallingLeaf[] = [];

    // Create cloud texture keys (you added: Cloud 1.png, Cloud 2.png, Cloud 3.png)
    const cloudKeys = ['cloud'].filter(key => scene.textures.exists(key));
    const leafKeys = ['leaf1', 'leaf2', 'leaf3'].filter(key => scene.textures.exists(key));

    // Max entities to render
    const MAX_CLOUDS = 3;
    const MAX_LEAVES = 12;

    // Spawn a cloud randomly
    function spawnCloud() {
        if (cloudKeys.length === 0) return;

        // Get or create cloud
        let cloud = clouds.find(c => !c.isActive);
        if (!cloud && clouds.length < MAX_CLOUDS) {
            cloud = new AnimatedCloud(scene);
            clouds.push(cloud);
        }

        if (!cloud) return;

        const texture = cloudKeys[Math.floor(Math.random() * cloudKeys.length)];
        const speed = 20 + Math.random() * 40;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const startX = direction > 0 ? -100 : scene.scale.width + 100;
        const startY = 80;

        cloud.spawn(startX, startY, texture, speed, direction);
    }

    // Spawn a leaf falling
    function spawnLeaf() {
        if (leafKeys.length === 0) return;

        // Get or create leaf
        let leaf = leaves.find(l => !l.isActive);
        if (!leaf && leaves.length < MAX_LEAVES) {
            leaf = new FallingLeaf(scene);
            leaves.push(leaf);
        }

        if (!leaf) return;

        const texture = leafKeys[Math.floor(Math.random() * leafKeys.length)];
        const speed = 80 + Math.random() * 120;
        const startX = Math.random() * scene.scale.width;

        leaf.spawn(startX, -50, texture, speed);
    }

    // Spawn clouds and leaves periodically
    let cloudTimer = 0;
    let leafTimer = 0;


    function onUpdate(_time: number, delta: number) {
        // Update all active clouds
        clouds.forEach(cloud => cloud.update(delta));

        // Update all active leaves
        leaves.forEach(leaf => leaf.update(delta));

        // Spawn new clouds every 2.5-4 seconds
        cloudTimer += delta;
        if (cloudTimer > 2500 + Math.random() * 1500) {
            spawnCloud();
            cloudTimer = 0;
        }

        // Spawn new leaves every 200-500ms
        leafTimer += delta;
        if (leafTimer > 200 + Math.random() * 300) {
            spawnLeaf();
            leafTimer = 0;
        }
    }

    // Attach update listener
    scene.events.on('update', onUpdate);

    // Cleanup on scene shutdown
    scene.events.once('shutdown', () => {
        scene.events.off('update', onUpdate);
        clouds.forEach(c => c.destroy());
        leaves.forEach(l => l.destroy());
    });
}
