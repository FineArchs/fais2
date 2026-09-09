import { defineConfig, globalIgnores } from 'eslint/config';
import importX from "eslint-plugin-import-x";
import unusedImports from "eslint-plugin-unused-imports";
import js from "@eslint/js";
import ts from 'typescript-eslint';

const rawJsRules = {
	plugins: {
		"unused-imports": unusedImports,
	},
	rules: {
		indent: ["warn", "tab", {
			SwitchCase: 1,
			MemberExpression: 1,
			flatTernaryExpressions: true,
			ArrayExpression: "first",
			ObjectExpression: "first",
		}],

		"eol-last": ["error", "always"],
		semi: ["error", "always"],

		"semi-spacing": ["error", {
			before: false,
			after: true,
		}],

		quotes: ["warn", "single"],
		"comma-dangle": ["warn", "always-multiline"],

		"keyword-spacing": ["error", {
			before: true,
			after: true,
		}],

		"key-spacing": ["error", {
			beforeColon: false,
			afterColon: true,
		}],

		"arrow-spacing": ["error", {
			before: true,
			after: true,
		}],

		"padded-blocks": ["error", "never"],

		eqeqeq: ["error", "always", {
			null: "ignore",
		}],

		"no-multi-spaces": ["error"],
		"no-var": ["error"],
		"prefer-arrow-callback": ["error"],
		"no-throw-literal": ["warn"],
		"no-param-reassign": ["warn"],
		"no-constant-condition": ["off"],
		"no-empty-pattern": ["warn"],
		"no-async-promise-executor": ["off"],
		"no-useless-escape": ["off"],

		"no-multiple-empty-lines": ["error", {
			max: 1,
		}],

		"no-control-regex": ["warn"],
		"no-empty": ["warn"],
		"no-inner-declarations": ["off"],
		"no-sparse-arrays": ["off"],
		"nonblock-statement-body-position": ["error", "beside"],
		"object-curly-spacing": ["error", "always"],
		"space-infix-ops": ["error"],
		"space-before-blocks": ["error", "always"],

		"import-x/no-unresolved": ["off"],
		"import-x/no-default-export": ["warn"],
		"import-x/order": ["warn", {
			groups: [
				"builtin",
				"external",
				"internal",
				"parent",
				"sibling",
				"index",
				"object",
				"type",
			],
		}],

		"unused-imports/no-unused-imports": "warn",
		"unused-imports/no-unused-vars": ["warn", {
			vars: "all",
			varsIgnorePattern: "^_",
			args: "none",
			// argsIgnorePattern: "^_",
			caughtErrors: "none",
			// caughtErrorsIgnorePattern: "^_",
			destructuredArrayIgnorePattern: "^_",
		}],
	},
};

const rawTsRules = {
	rules: {
		"@typescript-eslint/no-unnecessary-condition": ["off"],
		"@typescript-eslint/no-unused-expressions": ["off"],
		"@typescript-eslint/no-empty-function": ["off"],
		"@typescript-eslint/no-non-null-assertion": ["off"],
		"@typescript-eslint/explicit-function-return-type": ["off"],
		// unused-imports/no-unused-varsとの重複のため
		"@typescript-eslint/no-unused-vars": "off",

		"@typescript-eslint/no-explicit-any": ["warn"],
		"@typescript-eslint/no-var-requires": ["warn"],
		"@typescript-eslint/no-inferrable-types": ["warn"],

		"@typescript-eslint/no-misused-promises": ["error", {
			checksVoidReturn: false,
		}],
		"@typescript-eslint/consistent-type-imports": "error",
	},
};

const jsRules = [
	js.configs.recommended,
	importX.flatConfigs.recommended,
	rawJsRules,
];

const tsRules = [
	js.configs.recommended,
	ts.configs.recommended,
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
	rawJsRules,
	rawTsRules,
];

export default defineConfig([
	// https://stackoverflow.com/a/79115209/22200513
	globalIgnores([
		"built",
		"playground",
	]),

	{
		extends: tsRules,
		files: ["src/**/*.ts"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				project: ["./tsconfig.json"],
			},
		},
	},

	{
		extends: tsRules,
		files: ["test/**/*.ts"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				project: ["./tsconfig.test.json"],
			},
		},
	},

	{
		extends: tsRules,
		files: ["scripts/**/*.ts"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				project: ["./tsconfig.scripts.json"],
			},
		},
	},

	{
		extends: tsRules,
		basePath: "playground",
		// TODO: Add Vue file support
		files: ["*.ts", "src/**/*.ts"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				project: ["./playground/tsconfig.json"],
			},
		},
	},
]);
