# Database Schema

このドキュメントは、プロジェクトのデータベース構造を可視化したものです。

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ team_members : "belongs to"
    users ||--o{ invitations : "invites"
    users ||--o{ activity_logs : "performs"
    teams ||--o{ team_members : "has"
    teams ||--o{ activity_logs : "tracks"
    teams ||--o{ invitations : "receives"

    users {
        serial id PK
        varchar(100) name
        varchar(255) email UK "NOT NULL"
        text password_hash "NOT NULL"
        varchar(20) role "NOT NULL, DEFAULT 'member'"
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
        timestamp deleted_at
    }

    teams {
        serial id PK
        varchar(100) name "NOT NULL"
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
        text stripe_customer_id UK
        text stripe_subscription_id UK
        text stripe_product_id
        varchar(50) plan_name
        varchar(20) subscription_status
    }

    team_members {
        serial id PK
        integer user_id FK "NOT NULL"
        integer team_id FK "NOT NULL"
        varchar(50) role "NOT NULL"
        timestamp joined_at "NOT NULL"
    }

    activity_logs {
        serial id PK
        integer team_id FK "NOT NULL"
        integer user_id FK
        text action "NOT NULL"
        timestamp timestamp "NOT NULL"
        varchar(45) ip_address
    }

    invitations {
        serial id PK
        integer team_id FK "NOT NULL"
        varchar(255) email "NOT NULL"
        varchar(50) role "NOT NULL"
        integer invited_by FK "NOT NULL"
        timestamp invited_at "NOT NULL"
        varchar(20) status "NOT NULL, DEFAULT 'pending'"
    }
```

## テーブル説明

### users

ユーザー情報を管理するテーブル。認証情報とプロファイルを保存します。

- **主キー**: `id`
- **ユニークキー**: `email`
- **ソフトデリート**: `deleted_at`を使用

### teams

チーム/組織情報を管理するテーブル。Stripe連携情報も含みます。

- **主キー**: `id`
- **Stripe統合**: 顧客ID、サブスクリプションID、製品IDを保存

### team_members

ユーザーとチームの中間テーブル。多対多の関係を実現します。

- **主キー**: `id`
- **外部キー**: `user_id` → users.id, `team_id` → teams.id

### activity_logs

チームとユーザーのアクティビティを記録するテーブル。

- **主キー**: `id`
- **外部キー**: `team_id` → teams.id, `user_id` → users.id (nullable)
- **用途**: 監査ログ、セキュリティ追跡

### invitations

チームへの招待を管理するテーブル。

- **主キー**: `id`
- **外部キー**: `team_id` → teams.id, `invited_by` → users.id
- **ステータス**: pending (デフォルト)

## Activity Types

アプリケーションで追跡される主なアクティビティタイプ:

- `SIGN_UP`: ユーザー登録
- `SIGN_IN`: ログイン
- `SIGN_OUT`: ログアウト
- `UPDATE_PASSWORD`: パスワード更新
- `DELETE_ACCOUNT`: アカウント削除
- `UPDATE_ACCOUNT`: アカウント情報更新
- `CREATE_TEAM`: チーム作成
- `REMOVE_TEAM_MEMBER`: メンバー削除
- `INVITE_TEAM_MEMBER`: メンバー招待
- `ACCEPT_INVITATION`: 招待承認
