# FaiScript

FaiScriptは、軽量プログラミング言語[AiScript](https://github.com/aiscript-dev/aiscript)の個人用フォークです。
本家のcommit `171301cea6c97dd0834d581324a8a60b1bc052ea`から分岐しています。

開発にはJujutsuとBunを使用します。Bunのバージョンは`mise.toml`で管理しています。

## セットアップ

```sh
mise install
bun ci
```

## FaiScriptの実行

引数を指定しなければREPLを開始します。

```sh
bun run start
```

ファイル名を指定するか、標準入力からソースコードを渡すこともできます。

```sh
bun run start example.is
bun run start < example.is
```

`--parseOnly`を指定すると、プログラムを実行せずASTを出力します。

```sh
bun run start --parseOnly example.is
```

## 開発

```sh
bun run build
bun run typecheck
bun run lint
bun run test --pool=threads
```

`typecheck`はライブラリ、テスト、スクリプト、およびplaygroundを検査します。

## Playground

playgroundはVueとTypeScriptで実装されています。先にライブラリをビルドしてから起動してください。

```sh
bun run build
bun run --cwd playground dev
```

配布用のビルドと、その確認用サーバーは次のコマンドで実行できます。

```sh
bun run --cwd playground build
bun run --cwd playground serve
```

playgroundだけを型検査する場合は、次のコマンドを使用します。

```sh
bun run --cwd playground typecheck
```

## 開発方針

個人利用を目的としているため、本家に存在する機能、依存関係、CIの一部は必要に応じて削除または変更します。
