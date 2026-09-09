import * as readline from 'node:readline/promises';
import chalk from 'chalk';
import { errors, Parser, Interpreter, utils } from '@finearchs/faiscript';
const { valToString } = utils;

const i = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

console.log(
	`Welcome to FaiScript!
Type '.exit' to end this session.`);

const interpreter = new Interpreter({}, {
	in(q) {
		return i.question(q + ': ');
	},
	out(value) {
		if (value.type === 'str') {
			console.log(chalk.magenta(value.value));
		} else {
			console.log(chalk.magenta(valToString(value)));
		}
	},
	err(e) {
		console.log(chalk.red(`${e}`));
	},
	log(type, params) {
		switch (type) {
			case 'end':
				if (params.val != null && 'type' in params.val) {
					console.log(chalk.gray(`< ${valToString(params.val, true)}`));
				}
				break;
			default: break;
		}
	},
});

async function getAst() {
	let script = '';
	let a = await i.question('>>> ');
	while (true) {
		try {
			if (a === '.exit') return null;
			script += a;
			const ast = Parser.parse(script);
			script = '';
			return ast;
		} catch (e) {
			if (e instanceof errors.AiScriptUnexpectedEOFError) {
				script += '\n';
				a = await i.question('... ');
			} else {
				script = '';
				throw e;
			}
		}
	}
}

async function main() {
	try {
		const ast = await getAst();
		if (ast == null) {
			return false;
		}
		await interpreter.exec(ast);
	} catch (e) {
		console.log(chalk.red(`${e}`));
	}
	return true;
}

while (await main());
i.close();
