# IP Flash Arithmetic

[![CI/CD Pipeline](https://github.com/AkatukiSora/ip-flash-arithmetic/actions/workflows/ci.yml/badge.svg)](https://github.com/AkatukiSora/ip-flash-arithmetic/actions/workflows/ci.yml)

IPアドレス計算とサブネット操作をフラッシュ演算形式で素早く練習できるWebアプリケーション

## 🌟 概要

IP Flash Arithmeticは、ネットワークエンジニアや情報技術者のためのIPアドレス計算練習ツールです。フラッシュカードのような1問1答形式で、IPアドレスやサブネットマスクの各種変換・計算を効率的に学習できます。

### 主な機能

- **🚀 クイズモード**: 複数問題タイプから選択、リアルタイムスコア表示、解説付き学習
- **📚 練習モード**: 項目別解説付き学習、自分のペースで反復練習  
- **🔢 計算機モード**: IP変換・CIDR変換・サブネット計算ツール
- **🏆 ランキング**: ニックネーム付きスコア保存、上位30位表示

### 対応する問題タイプ

**現在実装済み:**
- IPアドレス → 2進数変換
- ネットワークプレフィックス（CIDR） → サブネットマスク変換
- サブネットマスク → ネットワークプレフィックス（CIDR）変換
- IPアドレス（CIDR付き）→ ネットワークアドレス計算
- ネットワークアドレス → ブロードキャストアドレス計算
- ネットワークアドレス → 利用可能ホスト数計算
- ホストアドレス選択問題
- ロンゲストマッチ選択問題

**実装予定:**
- 複数ネットワークアドレス → 集約後ネットワークアドレス + CIDR

## 🚀 クイックスタート

### 必要な環境
- Node.js 18以上
- pnpm

### インストールと起動

```bash
# リポジトリをクローン
git clone https://github.com/AkatukiSora/ip-flash-arithmetic.git
cd ip-flash-arithmetic

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてください。

## 🛠 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **テスト**: Jest + React Testing Library
- **パッケージマネージャー**: pnpm

## 📁 プロジェクト構成

```
src/
├── app/                    # Next.js App Router ページ
│   ├── calculator/        # 計算機モードページ
│   ├── practice/          # 練習モードページ
│   └── quiz/              # クイズモードページ
├── components/            # Reactコンポーネント
├── utils/                 # ユーティリティ関数
│   ├── ip-utils.ts        # IPアドレス関連ユーティリティ
│   ├── subnet-utils.ts    # サブネット計算ユーティリティ
│   └── quiz-generator.ts  # クイズ問題生成
└── __tests__/             # テストファイル
```

## 🧪 テスト

このプロジェクトでは包括的なテストスイートを実装しています：

```bash
# 全テスト実行
pnpm test

# カバレッジレポート付きテスト実行
pnpm run test:coverage

# ウォッチモードでテスト実行
pnpm run test:watch
```

## 🔧 開発

### 利用可能なスクリプト

```bash
pnpm dev          # 開発サーバー起動
pnpm build        # 本番ビルド
pnpm start        # 本番サーバー起動
pnpm lint         # ESLint実行
pnpm test         # テスト実行
```

### TDD（テスト駆動開発）アプローチ

このプロジェクトはTDDで開発されています。新機能追加時の手順：

1. `testlist.md` にテスト項目を追加
2. 先にテストを実装
3. テストを通すための実装を行う
4. テストが通ったら `testlist.md` の項目を完了にマーク

## 🤝 コントリビューション

プルリクエストや課題報告を歓迎します。大きな変更を行う前に、まずissueで議論してください。

### 開発の流れ

1. このリポジトリをフォーク
2. フィーチャーブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add some amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを開く

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下でライセンスされています。

## 🔗 関連リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jest Testing Framework](https://jestjs.io/)
