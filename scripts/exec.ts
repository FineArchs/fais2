import { readFile } from 'node:fs/promises';
import * as readline from 'node:readline/promises';
import { inspect } from 'node:util';
import chalk from 'chalk';
import { errors, Interpreter, Parser, utils, type Ast } from '@finearchs/faiscript';

const { valToString } = utils;

type Options = {
	file?: string;
	parseOnly: boolean;
};

function parseArgs(args: string[]): Options {
	const options: Options = { parseOnly: false };
	for (const arg of args) {
		if (arg === '--parseOnly') {
			options.parseOnly = true;
		} else if (arg.startsWith('-')) {
			throw new Error(`Unknown option: ${arg}`);
		} else if (options.file == null) {
			options.file = arg;
		} else {
			throw new Error('Only one input file can be specified.');
		}
	}
	return options;
}

function printAst(ast: Ast.Node[]): void {
	console.log(inspect(ast, { colors: process.stdout.isTTY, depth: 10 }));
}

function createInterpreter(input: readline.Interface, showResult: boolean): Interpreter {
	return new Interpreter({}, {
		in(question) {
			return input.question(`${question}: `);
		},
		out(value) {
			const output = value.type === 'str' ? value.value : valToString(value, true);
			console.log(chalk.magenta(output));
		},
		err(error) {
			console.error(chalk.red(`${error}`));
		},
		log(type, params) {
			if (showResult && type === 'end' && params.val != null && 'type' in params.val) {
				console.log(chalk.gray(`< ${valToString(params.val, true)}`));
			}
		},
	});
}

async function run(source: string, input: readline.Interface, options: Options): Promise<void> {
	const ast = Parser.parse(source);
	if (options.parseOnly) {
		printAst(ast);
		return;
	}
	await createInterpreter(input, false).exec(ast);
}

async function startRepl(input: readline.Interface, options: Options): Promise<void> {
	console.log(
		`Welcome to FaiScript!
Type '.exit' to end this session.`,
	);
	const interpreter = createInterpreter(input, true);
	let prompt = '>>> ';
	let source = '';

	while (true) {
		const line = await input.question(prompt);
		if (line === '.exit' && source === '') break;
		source += line;

		try {
			const ast = Parser.parse(source);
			if (options.parseOnly) printAst(ast);
			else await interpreter.exec(ast);
			source = '';
			prompt = '>>> ';
		} catch (error) {
			if (error instanceof errors.AiScriptUnexpectedEOFError) {
				source += '\n';
				prompt = '... ';
			} else {
				console.error(chalk.red(`${error}`));
				source = '';
				prompt = '>>> ';
			}
		}
	}
}

const input = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

try {
	const options = parseArgs(process.argv.slice(2));
	if (options.file != null) {
		await run(await readFile(options.file, 'utf8'), input, options);
	} else if (!process.stdin.isTTY) {
		await run(await Bun.stdin.text(), input, options);
	} else {
		await startRepl(input, options);
	}
} catch (error) {
	if (error instanceof errors.AiScriptError || error instanceof Error) {
		console.error(chalk.red(`${error}`));
		process.exitCode = 1;
	} else {
		throw error;
	}
} finally {
	input.close();
}
