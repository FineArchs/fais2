<template>
<div ref="bg" id="settings-bg" @click="(e) => e.target === bg && $emit('exit')">
	<div id="settings-body">
		<div class="settings-item">
			<header>IRQ Rate</header>
			<input type="number" v-model="irqRate" />
		</div>
		<div class="settings-item">
			<header>IRQ Sleep Time</header>
			<div>
				<input type="radio" value="time" v-model="irqSleepMethod" />
				time(milliseconds)
				<input type="number" v-model="irqSleepTime" :disabled="irqSleepMethod !== 'time'" />
			</div>
			<div>
				<input type="radio" value="requestIdleCallback" v-model="irqSleepMethod" />
				requestIdleCallback
			</div>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { irqRate, irqSleepMethod, irqSleepTime } from './settings';

defineEmits<{ exit: [] }>();
const bg = ref<HTMLDivElement>();
</script>

<style>
#settings-bg {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 10;
	width: 100vw;
	height: 100vh;
	background: #0008;
	display: flex;
	justify-content: center;
	align-items: center;
}
#settings-body {
	display: grid;
	gap: 1em;
}
</style>
