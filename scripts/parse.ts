import fs from 'node:fs';
import { inspect } from 'node:util';
import { Parser } from '@finearchs/faiscript';

const script = fs.readFileSync('./main.ais', 'utf8');
const ast = Parser.parse(script);
console.log(inspect(ast, { depth: 10 }));
