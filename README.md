
# Cross-Origin-Opener-Policy 脆弱性テスト用 ブラウザエクステンション

## 概要
このブラウザエクステンションは、Cross-Origin-Opener-Policy (COOP) ヘッダーの効果を検証するためのセキュリティテストツールです。
**Manifest V2** に対応し、Chrome、Edge、Safari（開発者モード）、Firefoxで動作します。

## ファイル構成
```
coop-test-extension-safari/
├── src/
│   ├── manifest.json       # エクステンション設定（Manifest V3）
│   ├── popup/
│   │   ├── index.html      # ポップアップUIテンプレート
│   │   └── popup.ts        # ポップアップロジック（TypeScript）
│   └── content-scripts/
│       ├── content.ts      # コンテンツスクリプト（メイン）
│       └── attack.ts       # COOP攻撃テスト + 結果表示（統合）
├── dist/                   # ビルド出力ディレクトリ
│   ├── manifest.json       # エクステンション設定
│   ├── popup/
│   │   ├── index.html      # ポップアップUI
│   │   └── popup.js        # ビルド済みポップアップスクリプト
│   └── content-scripts/
│       ├── content.js      # ビルド済みコンテンツスクリプト
│       └── attack.js       # ビルド済み攻撃テストスクリプト
├── package.json            # 依存関係とビルドスクリプト
├── tsconfig.json           # TypeScript設定
├── biome.json             # Biome（リント・フォーマット）設定
└── README.md              # 本ドキュメント
```

## 使用方法

### エクステンションでのテスト
1. エクステンションをインストール後、対象サイトに移動
2. `https://localhost:20181`　にアクセス
3. **ブラウザのポップアップブロックを解除**（重要）
4. ブラウザのツールバーにあるエクステンションアイコンをクリック
5. ポップアップが表示されたら「COOPテストを実行する」ボタンをクリック
6. 結果がバナーとコンソールに表示される

### テストの焦点
このテストは **`popup.opener` 参照の維持・切断** に焦点を当てており、実際のリダイレクト攻撃は実行せず、COOP による opener 参照の保護効果のみを検証します。

## 期待される結果

### COOP無効時（脆弱性あり）
- **赤いバナー表示**: 「攻撃成功: Cross-Origin-Opener-Policyが無効です (opener参照が維持)」
- `popup.opener` が null以外の値を保持
- コンソールに攻撃成功ログ: 「COOP攻撃成功！脆弱性あり！」

### COOP有効時（脆弱性なし）
- **緑のバナー表示**: 「攻撃ブロック: Cross-Origin-Opener-Policyが有効です (opener参照が切断)」または「攻撃ブロック: Cross-Origin-Opener-Policyが有効です (SecurityError)」
- `popup.opener` が null になる、または SecurityError 例外発生
- コンソールに保護ログ: 「COOP攻撃ブロック！保護されています！」

**重要な免責事項**
- このツールは**教育・研究目的専用**のセキュリティテストツールです
- 悪意のある攻撃や不正アクセスには**絶対に使用しないでください**
- テスト完了後は**必ずエクステンションを削除**してください
- 第三者のサイトでのテストは、事前許可を得た場合のみ実施してください

### 攻撃手法
COOP脆弱性を検証するための単純化された攻撃手法:

1. **ポップアップ作成**: `window.open()` でGoogleサイトを開く
2. **opener参照確認**: `popup.opener` が維持されているかチェック
3. **結果判定**: opener参照の可否でCOOP有効性を判定
4. **バナー表示**: 結果を視覚的に表示（リダイレクト攻撃は実行せず確認のみ）

## 開発・ビルド方法

### 1. 依存関係のインストール
```bash
npm install
```

### 2. ビルド実行
```bash
# 本番用ビルド
npm run build

# 開発用ウォッチモード
npm run dev
```

### 3. フォーマット・リント
```bash
# コードフォーマット
npm run format

# コードチェック
npm run lint

```

### 4. ビルド出力
ビルドが成功すると `dist/` ディレクトリに以下が生成されます：
- `manifest.json` - エクステンション設定
- `popup/` - ポップアップUI関連ファイル
- `content-scripts/` - コンテンツスクリプト関連ファイル
