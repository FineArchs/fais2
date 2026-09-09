import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['test/**'],
		exclude: ['test/testutils.ts'],
	},
});
