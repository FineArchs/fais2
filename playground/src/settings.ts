import { computed, ref } from 'vue';

export const irqRate = ref(300);
export const irqSleepTime = ref(5);
export const irqSleepMethod = ref<'time' | 'requestIdleCallback'>('time');

const idle = (): Promise<void> => new Promise(resolve => {
	requestIdleCallback(() => resolve());
});

export const settings = computed(() => ({
	irqRate: irqRate.value,
	irqSleep: irqSleepMethod.value === 'time' ? irqSleepTime.value : idle,
}));
