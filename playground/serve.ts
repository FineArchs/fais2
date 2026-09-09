const server = Bun.serve({
	async fetch(request) {
		const pathname = new URL(request.url).pathname;
		const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
		if (relativePath.split('/').includes('..')) {
			return new Response('Not Found', { status: 404 });
		}

		const file = Bun.file(`${import.meta.dir}/dist/${relativePath}`);
		if (!await file.exists()) return new Response('Not Found', { status: 404 });
		return new Response(file);
	},
});

console.log(`Listening on ${server.url}`);
