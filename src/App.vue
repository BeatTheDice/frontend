<script setup lang="ts">
import Phaser from 'phaser';
import { ref, toRaw } from 'vue';
import type { MainMenu } from './game/scenes/MainMenu';
import PhaserGame from './PhaserGame.vue';

// The sprite can only be moved in the MainMenu Scene
const canMoveSprite = ref();

//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();
const spritePosition = ref({ x: 0, y: 0 });

const changeScene = () => {

    const scene = toRaw(phaserRef.value.scene) as MainMenu;

    if (scene)
    {
        //  Call the changeScene method defined in the `MainMenu`, `Game` and `GameOver` Scenes
        scene.changeScene();
    }

}

const moveSprite = () => {

    if (phaserRef.value !== undefined)
    {

        const scene = toRaw(phaserRef.value.scene) as MainMenu;

        if (scene)
        {
            // Get the update logo position
            (scene as MainMenu).moveLogo(({ x, y }) => {

                spritePosition.value = { x, y };

            });
        }
    }

}



// Event emitted from the PhaserGame component
const currentScene = (scene: MainMenu) => {

    canMoveSprite.value = (scene.scene.key !== "MainMenu");

}

</script>

<template>
    <PhaserGame ref="phaserRef" @current-active-scene="currentScene" />
    <div>
        <div>
            <button class="button" @click="changeScene">Change Scene</button>
        </div>
        <div>
            <button :disabled="canMoveSprite" class="button" @click="moveSprite">Toggle Movement</button>
        </div>
    </div>
</template>
