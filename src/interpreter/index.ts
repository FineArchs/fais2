/**
 * AiScript interpreter
 */

import { autobind } from '../utils/mini-autobind.js';
import { mustBeNever } from '../utils/mustbenever.js';
import { AiScriptError, NonAiScriptError, AiScriptNamespaceError, AiScriptHostsideError } from '../error.js';
import { nodeToJs } from '../utils/node-to-js.js';
import { Scope } from './scope.js';
import { std } from './lib/std.js';
import { assertValue } from './control.js';
import { expectAny, ValueTypeUtil as V } from './util.js';
import { NULL, FN_NATIVE, FN_NATIVE_ASYNC, STR, ERROR } from './value.js';
import { Variable } from './variable.js';
import { call, callSync, define, evalNode, evalNodeSync, log, run, runSync, setAttributes, setAttributesSync } from './eval/operations.js';
import type * as Ast from '../node.js';
import type { JsValue } from './util.js';
import type { Value, VFn } from './value.js';

export type LogObject = {
	scope?: string;
	var?: string;
	val?: Value | Variable;
};

export class Interpreter {
	public stepCount = 0;
	public stop = false;
	public pausing: { promise: Promise<void>, resolve: () => void } | null = null;
	public scope: Scope;
	private abortHandlers: (() => void)[] = [];
	private pauseHandlers: (() => void)[] = [];
	private unpauseHandlers: (() => void)[] = [];
	private vars: Record<string, Variable> = {};
	public irqRate: number;
	public irqSleep: () => Promise<void>;

	constructor(
		consts: Record<string, Value>,
		public opts: {
			in?(q: string): Promise<string>;
			out?(value: Value): void;
			err?(e: AiScriptError): void;
			log?(type: string, params: LogObject): void;
			maxStep?: number;
			abortOnError?: boolean;
			irqRate?: number;
			irqSleep?: number | (() => Promise<void>);
		} = {},
	) {
		const io = {
			print: FN_NATIVE(([v]) => {
				expectAny(v);
				if (this.opts.out) this.opts.out(v);
			}),
			readline: FN_NATIVE_ASYNC(async args => {
				const q = args[0];
				V.assert(q, 'str');
				if (this.opts.in == null) return NULL;
				const a = await this.opts.in(q.value);
				return STR(a);
			}),
		};

		this.vars = Object.fromEntries(Object.entries({
			...consts,
			...std,
			...io,
		}).map(([k, v]) => [k, Variable.const(v)]));

		this.scope = new Scope([new Map(Object.entries(this.vars))]);
		this.scope.opts.log = (type, params): void => {
			switch (type) {
				case 'add': log(this, 'var:add', params); break;
				case 'read': log(this, 'var:read', params); break;
				case 'write': log(this, 'var:write', params); break;
				default: break;
			}
		};

		if (!((this.opts.irqRate ?? 300) >= 0)) {
			throw new AiScriptHostsideError(`Invalid IRQ rate (${this.opts.irqRate}): must be non-negative number`);
		}
		this.irqRate = this.opts.irqRate ?? 300;

		const sleep = (time: number) => (
			(): Promise<void> => new Promise(resolve => setTimeout(resolve, time))
		);

		if (typeof this.opts.irqSleep === 'function') {
			this.irqSleep = this.opts.irqSleep;
		} else if (this.opts.irqSleep === undefined) {
			this.irqSleep = sleep(5);
		} else if (this.opts.irqSleep >= 0) {
			this.irqSleep = sleep(this.opts.irqSleep);
		} else {
			throw new AiScriptHostsideError('irqSleep must be a function or a positive number.');
		}
	}

	@autobind
	public async exec(script?: Ast.Node[]): Promise<void> {
		if (script == null || script.length === 0) return;
		try {
			await this.collectNs(script);
			const result = await run(this, script, this.scope, []);
			assertValue(result);
			log(this, 'end', { val: result });
		} catch (e) {
			this.handleError(e);
		}
	}

	@autobind
	public execSync(script?: Ast.Node[]): Value | undefined {
		if (script == null || script.length === 0) return;
		this.collectNsSync(script);
		const result = runSync(this, script, this.scope, []);
		assertValue(result);
		return result;
	}

	/**
	 * Executes AiScript Function.
	 * When it fails,
	 * (i)If error callback is registered via constructor, this.abort is called and the callback executed, then returns ERROR('func_failed').
	 * (ii)Otherwise, just throws a error.
	 *
	 * @remarks This is the same function as that passed to AiScript NATIVE functions as opts.topCall.
	 */
	@autobind
	public async execFn(fn: VFn, args: Value[]): Promise<Value> {
		return await call(this, fn, args, [])
			.catch(e => {
				this.handleError(e);
				return ERROR('func_failed');
			});
	}

	/**
	 * Executes AiScript Function.
	 * When it fails,
	 * (i)If error callback is registered via constructor, this.abort is called and the callback executed, then returns ERROR('func_failed').
	 * (ii)Otherwise, just throws a error.
	 *
	 * @remarks This is the same function as that passed to AiScript NATIVE functions as opts.topCall.
	 */
	@autobind
	public execFnSync(fn: VFn, args: Value[]): Value {
		return callSync(this, fn, args, []);
	}

	/**
	 * Executes AiScript Function.
	 * Almost same as execFn but when error occurs this always throws and never calls callback.
	 *
	 * @remarks This is the same function as that passed to AiScript NATIVE functions as opts.call.
	 */
	@autobind
	public execFnSimple(fn: VFn, args: Value[]): Promise<Value> {
		return call(this, fn, args, []);
	}

	@autobind
	public static collectMetadata(script?: Ast.Node[]): Map<string | null, JsValue> | undefined {
		if (script == null || script.length === 0) return;

		const meta = new Map<string | null, JsValue>();

		for (const node of script) {
			switch (node.type) {
				case 'meta': {
					meta.set(node.name, nodeToJs(node.value));
					break;
				}

				default: {
					// nop
				}
			}
		}

		return meta;
	}

	@autobind
	private handleError(e: unknown): void {
		if (!this.opts.err) throw e;
		if (this.opts.abortOnError) {
			// when abortOnError is true, error handler should be called only once
			if (this.stop) return;
			this.abort();
		}
		if (e instanceof AiScriptError) {
			this.opts.err(e);
		} else {
			this.opts.err(new NonAiScriptError(e));
		}
	}

	@autobind
	private async collectNs(script: Ast.Node[], scope = this.scope): Promise<void> {
		for (const node of script) {
			switch (node.type) {
				case 'ns': {
					await this.collectNsMember(node, scope);
					break;
				}

				default: {
					// nop
				}
			}
		}
	}

	@autobind
	private collectNsSync(script: Ast.Node[], scope = this.scope): void {
		for (const node of script) {
			switch (node.type) {
				case 'ns': {
					this.collectNsMemberSync(node, scope);
					break;
				}

				default: {
					// nop
				}
			}
		}
	}

	@autobind
	private async collectNsMember(ns: Ast.Namespace, scope = this.scope): Promise<void> {
		const nsScope = scope.createChildNamespaceScope(ns.name);

		await this.collectNs(ns.members, nsScope);

		for (const node of ns.members) {
			switch (node.type) {
				case 'def': {
					if (node.dest.type !== 'identifier') {
						throw new AiScriptNamespaceError('Destructuring assignment is invalid in namespace declarations.', node.loc.start);
					}
					if (node.mut) {
						throw new AiScriptNamespaceError('No "var" in namespace declaration: ' + node.dest.name, node.loc.start);
					}

					const value = await evalNode(this, node.expr, nsScope, []);
					assertValue(value);

					await setAttributes(this, node.attr, value, scope, []);

					if (
						node.expr.type === 'fn'
						&& V.is(value, 'fn')
						&& !value.native
					) {
						value.name = nsScope.getNsPrefix() + node.dest.name;
					}
					define(this, nsScope, node.dest, value, node.mut);

					break;
				}

				case 'ns': {
					break; // nop
				}

				default: {
					return mustBeNever(node, (n: Ast.Node) => new AiScriptNamespaceError('invalid ns member type: ' + n.type, n.loc.start));
				}
			}
		}
	}

	@autobind
	private collectNsMemberSync(ns: Ast.Namespace, scope = this.scope): void {
		const nsScope = scope.createChildNamespaceScope(ns.name);

		this.collectNsSync(ns.members, nsScope);

		for (const node of ns.members) {
			switch (node.type) {
				case 'def': {
					if (node.dest.type !== 'identifier') {
						throw new AiScriptNamespaceError('Destructuring assignment is invalid in namespace declarations.', node.loc.start);
					}
					if (node.mut) {
						throw new AiScriptNamespaceError('No "var" in namespace declaration: ' + node.dest.name, node.loc.start);
					}

					const value = evalNodeSync(this, node.expr, nsScope, []);
					assertValue(value);

					setAttributesSync(this, node.attr, value, scope, []);

					if (
						node.expr.type === 'fn'
						&& V.is(value, 'fn')
						&& !value.native
					) {
						value.name = nsScope.getNsPrefix() + node.dest.name;
					}
					define(this, nsScope, node.dest, value, node.mut);

					break;
				}

				case 'ns': {
					break; // nop
				}

				default: {
					return mustBeNever(node, (n: Ast.Node) => new AiScriptNamespaceError('invalid ns member type: ' + n.type, n.loc.start));
				}
			}
		}
	}

	@autobind
	public registerAbortHandler(handler: () => void): void {
		this.abortHandlers.push(handler);
	}
	@autobind
	public registerPauseHandler(handler: () => void): void {
		this.pauseHandlers.push(handler);
	}
	@autobind
	public registerUnpauseHandler(handler: () => void): void {
		this.unpauseHandlers.push(handler);
	}

	@autobind
	public unregisterAbortHandler(handler: () => void): void {
		this.abortHandlers = this.abortHandlers.filter(h => h !== handler);
	}
	@autobind
	public unregisterPauseHandler(handler: () => void): void {
		this.pauseHandlers = this.pauseHandlers.filter(h => h !== handler);
	}
	@autobind
	public unregisterUnpauseHandler(handler: () => void): void {
		this.unpauseHandlers = this.unpauseHandlers.filter(h => h !== handler);
	}

	@autobind
	public abort(): void {
		this.stop = true;
		for (const handler of this.abortHandlers) {
			handler();
		}
		this.abortHandlers = [];
	}

	@autobind
	public pause(): void {
		if (this.pausing) return;
		let resolve: () => void;
		const promise = new Promise<void>(r => { resolve = () => r(); });
		this.pausing = { promise, resolve: resolve! };
		for (const handler of this.pauseHandlers) {
			handler();
		}
		this.pauseHandlers = [];
	}

	@autobind
	public unpause(): void {
		if (!this.pausing) return;
		this.pausing.resolve();
		this.pausing = null;
		for (const handler of this.unpauseHandlers) {
			handler();
		}
		this.unpauseHandlers = [];
	}
}
