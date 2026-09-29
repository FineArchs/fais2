/* eslint-disable no-empty-pattern */
import { v4 as uuid } from 'uuid';
import { NUM, STR, FN_NATIVE, FN_NATIVE_ASYNC, FALSE, TRUE, ARR, NULL, BOOL, OBJ, ERROR } from '../value.js';
import { valToJs, jsToVal, eq, expectAny, reprValue, ValueTypeUtil as V } from '../util.js';
import { AiScriptRuntimeError, AiScriptUserError } from '../../error.js';
import { VERSION } from '../../constants.js';
import { textDecoder } from '../../const.js';
import { stdMath } from './math.js';
import type { Value } from '../value.js';

export const std: Record<string, Value> = {
	...stdMath,

	'help': STR([
		'FaiScript documentation is not currently available.',
		'The original AiScript documentation may be helpful:',
		'https://aiscript-dev.github.io/guides/get-started.html',
	].join('\n')),

	//#region Core
	'Core:v': STR(VERSION),

	'Core:ai': STR('kawaii'),

	'Core:not': FN_NATIVE(([a]) => {
		V.assert(a, 'bool');
		return a.value ? FALSE : TRUE;
	}),

	'Core:eq': FN_NATIVE(([a, b]) => {
		expectAny(a);
		expectAny(b);
		return eq(a, b) ? TRUE : FALSE;
	}),

	'Core:neq': FN_NATIVE(([a, b]) => {
		expectAny(a);
		expectAny(b);
		return eq(a, b) ? FALSE : TRUE;
	}),

	'Core:and': FN_NATIVE(([a, b]) => {
		V.assert(a, 'bool');
		if (!a.value) return FALSE;
		V.assert(b, 'bool');
		return b.value ? TRUE : FALSE;
	}),

	'Core:or': FN_NATIVE(([a, b]) => {
		V.assert(a, 'bool');
		if (a.value) return TRUE;
		V.assert(b, 'bool');
		return b.value ? TRUE : FALSE;
	}),

	'Core:add': FN_NATIVE(([a, b]) => {
		V.assert(a, 'num');
		V.assert(b, 'num');
		return NUM(a.value + b.value);
	}),

	'Core:sub': FN_NATIVE(([a, b]) => {
		V.assert(a, 'num');
		V.assert(b, 'num');
		return NUM(a.value - b.value);
	}),

	'Core:mul': FN_NATIVE(([a, b]) => {
		V.assert(a, 'num');
		V.assert(b, 'num');
		return NUM(a.value * b.value);
	}),

	'Core:pow': FN_NATIVE(([a, b]) => {
		V.assert(a, 'num');
		V.assert(b, 'num');
		const res = a.value ** b.value;
		return NUM(res);
	}),

	'Core:div': FN_NATIVE(([a, b]) => {
		V.assert(a, 'num');
		V.assert(b, 'num');
		const res = a.value / b.value;
		return NUM(res);
	}),

	'Core:mod': FN_NATIVE(([a, b]) => {
		V.assert(a, 'num');
		V.assert(b, 'num');
		return NUM(a.value % b.value);
	}),

	'Core:gt': FN_NATIVE(([a, b]) => {
		V.assert(a, 'num');
		V.assert(b, 'num');
		return a.value > b.value ? TRUE : FALSE;
	}),

	'Core:lt': FN_NATIVE(([a, b]) => {
		V.assert(a, 'num');
		V.assert(b, 'num');
		return a.value < b.value ? TRUE : FALSE;
	}),

	'Core:gteq': FN_NATIVE(([a, b]) => {
		V.assert(a, 'num');
		V.assert(b, 'num');
		return a.value >= b.value ? TRUE : FALSE;
	}),

	'Core:lteq': FN_NATIVE(([a, b]) => {
		V.assert(a, 'num');
		V.assert(b, 'num');
		return a.value <= b.value ? TRUE : FALSE;
	}),

	'Core:type': FN_NATIVE(([v]) => {
		expectAny(v);
		return STR(v.type);
	}),

	'Core:to_str': FN_NATIVE(([v]) => {
		expectAny(v);

		return STR(reprValue(v));
	}),

	'Core:range': FN_NATIVE(([a, b]) => {
		V.assert(a, 'num');
		V.assert(b, 'num');
		if (a.value < b.value) {
			return ARR(Array.from({ length: (b.value - a.value) + 1 }, (_, i) => NUM(i + a.value)));
		} else if (a.value > b.value) {
			return ARR(Array.from({ length: (a.value - b.value) + 1 }, (_, i) => NUM(a.value - i)));
		} else {
			return ARR([a]);
		}
	}),
	'Core:sleep': FN_NATIVE_ASYNC(async ([delay]) => {
		V.assert(delay, 'num');
		await new Promise((r) => setTimeout(r, delay.value));
		return NULL;
	}),
	'Core:abort': FN_NATIVE(([message]) => {
		V.assert(message, 'str');
		throw new AiScriptUserError(message.value);
	}),
	//#endregion

	//#region Util
	'Util:uuid': FN_NATIVE(() => {
		return STR(uuid());
	}),
	//#endregion

	//#region Json
	'Json:stringify': FN_NATIVE(([v]) => {
		expectAny(v);
		return STR(JSON.stringify(valToJs(v)));
	}),

	'Json:parse': FN_NATIVE(([json]) => {
		V.assert(json, 'str');
		try {
			return jsToVal(JSON.parse(json.value));
		} catch (e) {
			return ERROR('not_json');
		}
	}),

	'Json:parsable': FN_NATIVE(([str]) => {
		V.assert(str, 'str');
		try {
			JSON.parse(str.value);
		} catch (e) {
			return BOOL(false);
		}
		return BOOL(true);
	}),
	//#endregion

	//#region Date
	'Date:now': FN_NATIVE(() => {
		return NUM(Date.now());
	}),

	'Date:year': FN_NATIVE(([v]) => {
		if (v) { V.assert(v, 'num'); }
		return NUM(new Date(v?.value ?? Date.now()).getFullYear());
	}),

	'Date:month': FN_NATIVE(([v]) => {
		if (v) { V.assert(v, 'num'); }
		return NUM(new Date(v?.value ?? Date.now()).getMonth() + 1);
	}),

	'Date:day': FN_NATIVE(([v]) => {
		if (v) { V.assert(v, 'num'); }
		return NUM(new Date(v?.value ?? Date.now()).getDate());
	}),

	'Date:hour': FN_NATIVE(([v]) => {
		if (v) { V.assert(v, 'num'); }
		return NUM(new Date(v?.value ?? Date.now()).getHours());
	}),

	'Date:minute': FN_NATIVE(([v]) => {
		if (v) { V.assert(v, 'num'); }
		return NUM(new Date(v?.value ?? Date.now()).getMinutes());
	}),

	'Date:second': FN_NATIVE(([v]) => {
		if (v) { V.assert(v, 'num'); }
		return NUM(new Date(v?.value ?? Date.now()).getSeconds());
	}),

	'Date:millisecond': FN_NATIVE(([v]) => {
		if (v) { V.assert(v, 'num'); }
		return NUM(new Date(v?.value ?? Date.now()).getMilliseconds());
	}),

	'Date:parse': FN_NATIVE(([v]) => {
		V.assert(v, 'str');
		const res = new Date(v.value).getTime();
		// NaN doesn't equal to itself
		return (res === res) ? NUM(res) : ERROR('not_date');
	}),

	'Date:to_iso_str': FN_NATIVE(([v, ofs]) => {
		if (v) { V.assert(v, 'num'); }
		const date = new Date(v?.value ?? Date.now());

		if (ofs) { V.assert(ofs, 'num'); }
		const offset = ofs?.value ?? -date.getTimezoneOffset();
		let offset_s: string;
		if (offset === 0) {
			offset_s = 'Z';
		} else {
			const sign = Math.sign(offset);
			const offset_hours = Math.floor(Math.abs(offset) / 60);
			const offset_minutes = Math.abs(offset) % 60;
			date.setUTCHours(date.getUTCHours() + sign * offset_hours);
			date.setUTCMinutes(date.getUTCMinutes() + sign * offset_minutes);

			const sign_s = (offset > 0) ? '+' : '-';
			const offset_hours_s = offset_hours.toString().padStart(2, '0');
			const offset_minutes_s = offset_minutes.toString().padStart(2, '0');
			offset_s = `${sign_s}${offset_hours_s}:${offset_minutes_s}`;
		}

		const y = date.getUTCFullYear().toString().padStart(4, '0');
		const mo = (date.getUTCMonth() + 1).toString().padStart(2, '0');
		const d = date.getUTCDate().toString().padStart(2, '0');
		const h = date.getUTCHours().toString().padStart(2, '0');
		const mi = date.getUTCMinutes().toString().padStart(2, '0');
		const s = date.getUTCSeconds().toString().padStart(2, '0');
		const ms = date.getUTCMilliseconds().toString().padStart(3, '0');

		return STR(`${y}-${mo}-${d}T${h}:${mi}:${s}.${ms}${offset_s}`);
	}),
	//#endregion

	//#region Num
	'Num:from_hex': FN_NATIVE(([v]) => {
		V.assert(v, 'str');
		return NUM(parseInt(v.value, 16));
	}),
	//#endregion

	//#region Str
	'Str:lf': STR('\n'),

	'Str:lt': FN_NATIVE(([a, b]) => {
		V.assert(a, 'str');
		V.assert(b, 'str');
		if (a.value < b.value) {
			return NUM(-1);
		} else if (a.value === b.value) {
			return NUM(0);
		} else {
			return NUM(1);
		}
	}),

	'Str:gt': FN_NATIVE(([a, b]) => {
		V.assert(a, 'str');
		V.assert(b, 'str');
		if (a.value > b.value) {
			return NUM(-1);
		} else if (a.value === b.value) {
			return NUM(0);
		} else {
			return NUM(1);
		}
	}),

	'Str:from_codepoint': FN_NATIVE(([codePoint]) => {
		V.assert(codePoint, 'num');

		return STR(String.fromCodePoint(codePoint.value));
	}),

	'Str:from_unicode_codepoints': FN_NATIVE(([codePoints]) => {
		V.assert(codePoints, 'arr');
		return STR(Array.from(codePoints.value.map((a) => {
			V.assert(a, 'num');
			return String.fromCodePoint(a.value);
		})).join(''));
	}),
	
	'Str:from_utf8_bytes': FN_NATIVE(([bytes]) => {
		V.assert(bytes, 'arr');
		return STR(textDecoder.decode(Uint8Array.from(bytes.value.map((a) => {
			V.assert(a, 'num');
			return a.value;
		}))));
	}),
	//#endregion

	//#region Uri
	'Uri:encode_full': FN_NATIVE(([v]) => {
		V.assert(v, 'str');
		return STR(encodeURI(v.value));
	}),	

	'Uri:encode_component': FN_NATIVE(([v]) => {
		V.assert(v, 'str');
		return STR(encodeURIComponent(v.value));
	}),	

	'Uri:decode_full': FN_NATIVE(([v]) => {
		V.assert(v, 'str');
		return STR(decodeURI(v.value));
	}),
	
	'Uri:decode_component': FN_NATIVE(([v]) => {
		V.assert(v, 'str');
		return STR(decodeURIComponent(v.value));
	}),
	//#endregion

	//#region Arr
	'Arr:create': FN_NATIVE(([length, initial]) => {
		V.assert(length, 'num');
		try {
			return ARR(Array<Value>(length.value).fill(initial ?? NULL));
		} catch (e) {
			if (length.value < 0) throw new AiScriptRuntimeError('Arr:create expected non-negative number, got negative');
			if (!Number.isInteger(length.value)) throw new AiScriptRuntimeError('Arr:create expected integer, got non-integer');
			throw e;
		}
	}),
	//#endregion

	//#region Obj
	'Obj:keys': FN_NATIVE(([obj]) => {
		V.assert(obj, 'obj');
		return ARR(Array.from(obj.value.keys()).map(k => STR(k)));
	}),

	'Obj:vals': FN_NATIVE(([obj]) => {
		V.assert(obj, 'obj');
		return ARR(Array.from(obj.value.values()));
	}),

	'Obj:kvs': FN_NATIVE(([obj]) => {
		V.assert(obj, 'obj');
		return ARR(Array.from(obj.value.entries()).map(([k, v]) => ARR([STR(k), v])));
	}),

	'Obj:get': FN_NATIVE(([obj, key]) => {
		V.assert(obj, 'obj');
		V.assert(key, 'str');
		return obj.value.get(key.value) ?? NULL;
	}),

	'Obj:set': FN_NATIVE(([obj, key, value]) => {
		V.assert(obj, 'obj');
		V.assert(key, 'str');
		expectAny(value);
		obj.value.set(key.value, value);
		return NULL;
	}),

	'Obj:has': FN_NATIVE(([obj, key]) => {
		V.assert(obj, 'obj');
		V.assert(key, 'str');
		return BOOL(obj.value.has(key.value));
	}),

	'Obj:copy': FN_NATIVE(([obj]) => {
		V.assert(obj, 'obj');
		return OBJ(new Map(obj.value));
	}),

	'Obj:merge': FN_NATIVE(([a, b]) => {
		V.assert(a, 'obj');
		V.assert(b, 'obj');
		return OBJ(new Map([...a.value, ...b.value]));
	}),

	'Obj:pick': FN_NATIVE(([obj, keys]) => {
		V.assert(obj, 'obj');
		V.assert(keys, 'arr');
		return OBJ(new Map(
			keys.value.map(key => {
				V.assert(key, 'str');
				return [key.value, obj.value.get(key.value) ?? NULL];
			}),
		));
	}),

	'Obj:from_kvs': FN_NATIVE(([kvs]) => {
		V.assert(kvs, 'arr');
		return OBJ(new Map(
			kvs.value.map((kv) => {
				V.assert(kv, 'arr');
				const [key, value] = kv.value;
				V.assert(key, 'str');
				expectAny(value);
				return [key.value, value];
			}),
		));
	}),
	//#endregion

	//#region Error
	'Error:create': FN_NATIVE(([name, info]) => {
		V.assert(name, 'str');
		return ERROR(name.value, info);
	}),
	//#endregion

	//#region Async
	'Async:interval': FN_NATIVE_ASYNC(async ([interval, callback, immediate], opts) => {
		V.assert(interval, 'num');
		V.assert(callback, 'fn');
		if (immediate) {
			V.assert(immediate, 'bool');
			if (immediate.value) void opts.call(callback, []);
		}

		let id: ReturnType<typeof setInterval>;

		const start = (): void => {
			id = setInterval(() => {
				void opts.topCall(callback, []);
			}, interval.value);
			opts.registerAbortHandler(stop);
			opts.registerPauseHandler(stop);
			opts.unregisterUnpauseHandler(start);
		};
		const stop = (): void => {
			clearInterval(id);
			opts.unregisterAbortHandler(stop);
			opts.unregisterPauseHandler(stop);
			opts.registerUnpauseHandler(start);
		};

		start();

		// stopper
		return FN_NATIVE(([], opts) => {
			stop();
			opts.unregisterUnpauseHandler(start);
		});
	}),

	'Async:timeout': FN_NATIVE_ASYNC(async ([delay, callback], opts) => {
		V.assert(delay, 'num');
		V.assert(callback, 'fn');

		let id: ReturnType<typeof setInterval>;

		const start = (): void => {
			id = setTimeout(() => {
				void opts.topCall(callback, []);
				opts.unregisterAbortHandler(stop);
				opts.unregisterPauseHandler(stop);
			}, delay.value);
			opts.registerAbortHandler(stop);
			opts.registerPauseHandler(stop);
			opts.unregisterUnpauseHandler(start);
		};
		const stop = (): void => {
			clearTimeout(id);
			opts.unregisterAbortHandler(stop);
			opts.unregisterPauseHandler(stop);
			opts.registerUnpauseHandler(start);
		};

		start();

		// stopper
		return FN_NATIVE(([], opts) => {
			stop();
			opts.unregisterUnpauseHandler(start);
		});
	}),
	//#endregion
};
