# MVP実装プラン（完全版）

## サービス概要

コンサルタントを選んで相談を予約できるマッチングサービス。リクエスト型予約 + 手動日程調整でシンプルに運用。

---

## システム構成

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js (Vercel)                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ トップ  │ │ ブログ │ │コンサル│ │ 予約   │ │Webhook │       │
│  │ + 記事 │ │ 詳細   │ │ 一覧/  │ │ 完了   │ │ API    │       │
│  │ 一覧   │ │        │ │ 詳細   │ │ 画面   │ │        │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
└─────────────────────────────────────────────────────────────────┘
       │           │           │                      │
       ▼           ▼           ▼                      ▼
┌────────────┐  ┌──────────────────┐          ┌───────────────┐
│  microCMS  │  │     Supabase     │          │    Stripe     │
│  ブログ記事 │  │  - consultants   │          │ Payment Link  │
│  管理      │  │  - bookings      │          │ + Webhook     │
└────────────┘  └──────────────────┘          └───────────────┘
                       │
                       ▼
               ┌───────────────┐
               │    Resend     │
               │  メール送信    │
               └───────────────┘
```

---

## 画面構成

| 画面 | パス | 内容 |
|------|------|------|
| トップページ | `/` | サービス説明 + ブログ記事一覧（microCMS） |
| ブログ詳細 | `/blog/[slug]` | 記事詳細（microCMS） |
| コンサルタント一覧 | `/consultants` | コンサルタント一覧 |
| コンサルタント詳細 | `/consultants/[id]` | プロフィール + リクエストフォーム |
| リクエスト完了 | `/bookings/thanks` | 「受け付けました」 |
| 決済完了 | `/bookings/confirmed` | 「予約確定しました。詳細はメールをご確認ください。」 |

---

## 予約フロー

```
┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│1.選択  │ → │2.リク  │ → │3.日時  │ → │4.決済  │ → │5.確定  │
│        │   │ エスト │   │ 調整   │   │        │   │        │
└────────┘   └────────┘   └────────┘   └────────┘   └────────┘
   画面       フォーム       メールで     Payment      Webhook
             →DB保存        手動対応     Link        →DB更新
             →通知メール               クリック      →確定メール
```

| # | 誰が | やること | システム/手動 |
|---|------|----------|--------------|
| 1 | クライアント | コンサルタント選択 | システム |
| 2 | クライアント | 希望日時3つ + 相談内容を送信 | システム |
| 3 | コンサルタント | 日時調整のメール | **手動** |
| 4 | コンサルタント | Payment Link送付 | **手動** |
| 5 | クライアント | 決済 | システム（Stripe） |
| 6 | システム | 確定処理 + メール送信（Meet URL記載） | システム |

---

## DBスキーマ

```sql
-- コンサルタント（手動登録、3人程度）
create table consultants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  bio text,
  expertise text[],
  price_30min integer not null,
  image_url text,
  payment_link text,      -- Stripe Payment Link
  meet_url text,          -- 固定のGoogle Meet URL
  email text not null,    -- 通知先
  created_at timestamptz default now()
);

-- 予約（認証なし、メールで識別）
create table bookings (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid references consultants(id),
  client_name text not null,
  client_email text not null,
  message text,
  preferred_dates text[],
  confirmed_date timestamptz,
  status text default 'pending',
  stripe_session_id text,
  created_at timestamptz default now()
);
```

---

## API

| エンドポイント | メソッド | 内容 |
|---------------|---------|------|
| `/api/bookings` | POST | リクエスト作成 → DB保存 → 通知メール |
| `/api/webhook` | POST | Stripe Webhook → 予約確定 → 確定メール |

---

## メール

| タイミング | 宛先 | 内容 |
|-----------|------|------|
| リクエスト受信 | コンサルタント | 新規リクエスト + 希望日時 + Payment Link（`?client_reference_id=xxx`付き） |
| リクエスト受信 | クライアント | 「受け付けました、連絡をお待ちください」 |
| 決済完了 | クライアント | 確定日時 + Meet URL |
| 決済完了 | コンサルタント | 予約確定通知 |

**送信元**: `noreply@moment-works.com`（Resend）
**問い合わせ先**: `hi.moment@gmail.com`（メール文面に記載）

---

## 外部サービス設定

| サービス | 設定内容 |
|----------|---------|
| **Supabase** | プロジェクト作成、テーブル作成（認証設定は不要） |
| **Stripe** | Payment Linkをコンサルタント人数分作成 |
| **Resend** | `moment-works.com` のドメイン認証 |
| **microCMS** | `blogs` API作成（title, slug, content, thumbnail, publishedAt） |
| **Google Meet** | 各コンサルタントが固定URL発行（無料） |

---

## 実装スケジュール

| 日 | タスク |
|----|--------|
| 1 | Supabase設定、DBスキーマ作成 |
| 2 | microCMS設定、トップページ + ブログ詳細 |
| 3 | コンサルタント一覧・詳細ページ |
| 4 | リクエストフォーム + `/api/bookings` |
| 5 | Resend設定、メール送信実装 |
| 6 | Stripe Payment Link作成、Webhook API |
| 7 | テスト、デプロイ、本番確認 |

---

## 手動運用まとめ

| 作業 | 担当 | 方法 |
|------|------|------|
| 日時調整 | コンサルタント | メールでやり取り |
| Payment Link送付 | コンサルタント | 通知メールに記載されたURLをクライアントに送る |
| Meet URL案内 | システム | 確定メールに自動記載 |
| コンサルタント登録 | 管理者 | Supabase管理画面から直接INSERT |
| ブログ記事管理 | 管理者 | microCMS管理画面 |

---

## 将来の拡張

| Phase | 内容 |
|-------|------|
| 2 | ダッシュボード、自動リマインダー、キャンセル機能、ログイン機能 |
| 3 | レビュー、検索フィルター、コンサルタント自己登録 |
| 4 | Stripe Connect（自動分配）、パッケージ販売 |
