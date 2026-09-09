import vuePlugin from './vue-plugin';

const result = await Bun.build({
	entrypoints: ['./index.html'],
	outdir: './dist',
	minify: true,
	plugins: [vuePlugin],
	publicPath: './',
	target: 'browser',
});

if (!result.success) {
	for (const log of result.logs) console.error(log);
	process.exit(1);
}
