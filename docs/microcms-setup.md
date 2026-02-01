# microCMS Integration Setup Guide

このドキュメントでは、microCMSとの連携設定方法を説明します。

## 概要

このプロジェクトでは、ブログ記事の管理にmicroCMSを使用しています。

## microCMS API設定

### 1. microCMSプロジェクトの作成

1. [microCMS](https://microcms.io/)にログイン
2. 新規サービスを作成

### 2. API作成

#### blogs API

以下の設定でAPIを作成してください：

- **API名**: `blogs`
- **エンドポイント**: `blogs`
- **APIの型**: リスト形式

**フィールド設定**:

- `title` (テキストフィールド) - タイトル
- `content` (リッチエディタv2) - 内容
- `eyecatch` (画像) - アイキャッチ
- `categories` (複数コンテンツ参照) - カテゴリ

#### categories API

以下の設定でAPIを作成してください：

- **API名**: `categories`
- **エンドポイント**: `categories`
- **APIの型**: リスト形式

**フィールド設定**:

- `name` (テキストフィールド) - カテゴリ名

### 3. APIキーの取得

1. microCMS管理画面で「API設定」→「APIキー」を開く
2. 新しいAPIキーを作成（GET権限があれば十分）
3. APIキーをコピー

### 4. 環境変数の設定

プロジェクトルートの`.env`ファイルに以下を追加：

```bash
# microCMS API settings
MICROCMS_SERVICE_DOMAIN=your-service-name
MICROCMS_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

- `MICROCMS_SERVICE_DOMAIN`: microCMSのサービス名（URLの`https://your-service-name.microcms.io`の部分）
- `MICROCMS_API_KEY`: 取得したAPIキー

## 実装詳細

### ファイル構成

```
lib/microcms/
├── types.ts       # TypeScript型定義
└── client.ts      # API クライアント

app/(public)/
├── page.tsx                    # トップページ（最新3件表示）
├── blog/
│   ├── page.tsx               # ブログ一覧ページ
│   └── [slug]/
│       └── page.tsx           # ブログ詳細ページ
```

### 利用可能な関数

#### `getBlogs(queries?)`

ブログ記事の一覧を取得

```typescript
import { getBlogs } from '@/lib/microcms/client';

const response = await getBlogs({
  limit: 10,
  offset: 0,
  orders: '-publishedAt', // 公開日の降順
});
```

#### `getBlogById(id, queries?)`

特定のブログ記事を取得

```typescript
import { getBlogById } from '@/lib/microcms/client';

const blog = await getBlogById('blog-id');
```

#### `getRecentBlogs(limit?)`

最新のブログ記事を取得（デフォルト3件）

```typescript
import { getRecentBlogs } from '@/lib/microcms/client';

const blogs = await getRecentBlogs(3);
```

#### `getBlogsByCategory(categoryId, queries?)`

カテゴリーでフィルタリングされたブログ記事を取得

```typescript
import { getBlogsByCategory } from '@/lib/microcms/client';

const response = await getBlogsByCategory('category-id', {
  limit: 10,
});
```

### クエリパラメータ

- `limit`: 取得件数（デフォルト: 10）
- `offset`: オフセット（ページネーション用）
- `orders`: ソート順（例: `-publishedAt` で降順）
- `filters`: フィルター条件
- `fields`: 取得するフィールドを指定
- `depth`: 参照の深さ

詳細は[microCMS公式ドキュメント](https://document.microcms.io/content-api/get-list-contents)を参照してください。

## キャッシング戦略

Next.jsのApp Routerを使用しているため、デフォルトで以下のキャッシング戦略を採用：

- **Revalidate**: 60秒ごとに再検証
- **Static Generation**: ビルド時に静的生成（`generateStaticParams`使用）

キャッシュ設定は [`lib/microcms/client.ts`](lib/microcms/client.ts:38) で変更できます。

## テスト

ローカルで開発サーバーを起動して確認：

```bash
npm run dev
```

以下のページにアクセス：

- トップページ: <http://localhost:3000>
- ブログ一覧: <http://localhost:3000/blog>
- ブログ詳細: <http://localhost:3000/blog/[記事ID>]

## トラブルシューティング

### エラー: "MICROCMS_API_KEY is not defined"

`.env`ファイルに環境変数が設定されているか確認してください。

### 記事が表示されない

1. microCMS管理画面で記事を公開しているか確認
2. APIキーに適切な権限があるか確認
3. ブラウザのコンソールでエラーログを確認

### 画像が表示されない

Next.jsの`next.config.ts`に以下の設定を追加：

```typescript
images: {
  domains: ['images.microcms-assets.io'],
}
```

## 本番環境での設定

Vercelなどのホスティングサービスで環境変数を設定：

1. プロジェクト設定画面で Environment Variables を開く
2. 以下の変数を追加：
   - `MICROCMS_SERVICE_DOMAIN`
   - `MICROCMS_API_KEY`

## 参考リンク

- [microCMS公式ドキュメント](https://document.microcms.io/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
