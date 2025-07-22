This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## What this app

IPアドレス関連の各種変換、集約などの練習をフラッシュ演算のように1問1答形式で素早く回せるようにするものです  
具体的には以下のものの変換、集約、4択問題を含みます
ライトテーマ、ダークテーマに対応していてほしいです

> `<->` `->`は出題の方向を示します
> `<->`は左右どちらも出題、答えになるものです
> `->`は左から出題しから答えを右がわにするものです
> `<-`は使用しません。一方通行の変換は`->`のみによって示します
> また行が出題するカテゴリ分けを示します

- IPアドレス <-> 2進数変換
- ネットワークプレフィックス（CIDR） <-> サブネットマスク変換
- IPアドレス(CIDR or サブネット付き) -> ネットワークアドレス計算
- ネットワークアドレス(CIDR or サブネット付き) -> ブロードキャストアドレス計算
- ネットワークアドレス(CIDR or サブネット付き) -> 最小・最大ホストアドレス計算
- ネットワークアドレス(CIDR or サブネット付き) -> 利用可能ホスト数計算
- (IPアドレス + CIDR) * 2~4 -> 集約後ネットワークアドレス + CIDR
- IPアドレス(ネットワークアドレス下位4bit差まで許容、プレフィックスが異なるものも可) -> 四択問題 ネットワークアドレス + CIDR

## Features

### 🚀 クイズモード
- 複数の問題タイプから選択可能
- リアルタイムでスコア・正答率を表示
- 解説付きで学習効果を向上
- 5問以上でランキング登録可能

### 📚 練習モード  
- 項目別に解説付きで学習
- 自分のペースで反復練習
- 基礎知識の定着に最適

### 🔢 計算機モード
- IP ↔ 2進数変換ツール
- CIDR ↔ サブネットマスク変換ツール
- サブネット計算（ネットワーク、ブロードキャスト、ホスト範囲）

### 🏆 ランキング
- ニックネーム付きでスコア保存
- 上位30位まで表示
- スコア・正答率・問題数で順位決定

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Prisma
- **Testing**: Jest + React Testing Library
- **Package Manager**: pnpm

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── scores/        # Score management
│   │   └── ranking/       # Ranking data
│   ├── calculator/        # Calculator page
│   ├── practice/          # Practice mode page
│   ├── quiz/              # Quiz mode page
│   └── ranking/           # Ranking page
├── utils/                 # Utility functions
│   ├── ip-utils.ts        # IP address utilities
│   ├── subnet-utils.ts    # Subnet calculation utilities
│   ├── quiz-generator.ts  # Quiz question generation
│   └── score-utils.ts     # Score management utilities
├── lib/                   # Library configurations
│   └── db.ts              # Database client
└── __tests__/             # Test files
```

## Development

### Prerequisites
- Node.js 18+
- pnpm

### Setup
```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:migrate

# Run development server
pnpm dev
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Database Commands
```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema changes
pnpm db:push
```

## Deployment

### Environment Variables
For production, set the following environment variable:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/ip_flush_arithmetic"
```

### Database Migration
```bash
# For production deployment
npx prisma migrate deploy
```

## Contributing

このプロジェクトはTDD（テスト駆動開発）のアプローチで開発されています。  
新機能の追加は以下の手順で行ってください：

1. `testlist.md` にテスト項目を追加
2. テストを先に書く
3. テストを通すための実装を行う
4. テストが通ったら `testlist.md` の項目を完了にマーク

## License

MIT
