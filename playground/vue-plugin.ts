import {
	compileScript,
	compileStyle,
	compileTemplate,
	parse,
} from '@vue/compiler-sfc';
import type { BunPlugin } from 'bun';

const vuePlugin: BunPlugin = {
	name: 'vue-sfc',
	setup(build) {
		build.onLoad({ filter: /\.vue$/ }, async ({ path }) => {
			const source = await Bun.file(path).text();
			const { descriptor, errors } = parse(source, { filename: path });
			if (errors.length > 0) throw errors[0];

			const id = Bun.hash(source).toString(16);
			const scopeId = `data-v-${id}`;
			const script = compileScript(descriptor, {
				id,
				genDefaultAs: '__component__',
			});

			let template = 'const render = undefined;';
			if (descriptor.template != null) {
				const result = compileTemplate({
					filename: path,
					id,
					source: descriptor.template.content,
					scoped: descriptor.styles.some(style => style.scoped),
					compilerOptions: {
						bindingMetadata: script.bindings,
					},
				});
				if (result.errors.length > 0) throw result.errors[0];
				template = result.code.replace('export function render', 'function render');
			}

			const css = descriptor.styles.map(style => {
				const result = compileStyle({
					filename: path,
					id: scopeId,
					source: style.content,
					scoped: style.scoped,
				});
				if (result.errors.length > 0) throw result.errors[0];
				return result.code;
			}).join('\n');

			return {
				contents: `${script.content}\n${template}\n` +
					`__component__.render = render;\n` +
					(descriptor.styles.some(style => style.scoped)
						? `__component__.__scopeId = ${JSON.stringify(scopeId)};\n`
						: '') +
					`const style = document.createElement('style');\n` +
					`style.textContent = ${JSON.stringify(css)};\n` +
					`document.head.append(style);\n` +
					`export default __component__;`,
				loader: 'ts',
			};
		});
	},
};

export default vuePlugin;
