# Stripe Payment Link セットアップガイド

このドキュメントでは、コンサルタント向けのStripe Payment Linkの設定方法を説明します。

## 概要

MVPでは、各コンサルタントが固定のStripe Payment Linkを持ち、予約リクエストを受けた後に手動でクライアントに送信します。

## Payment Link作成手順

### 1. Stripe管理画面にログイン

#### 開発環境（テストモード）

- [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
- 左上の「テストモードを表示」がONになっていることを確認

#### 本番環境（本番モード）

- [Stripe Dashboard](https://dashboard.stripe.com/dashboard)
- 左上の「本番モードを表示」がONになっていることを確認

### 2. Payment Linkを作成

1. サイドバーから「商品」→「Payment Links」を選択
2. 「+ 新規」をクリック
3. 以下の情報を入力：

#### 商品情報

- **商品名**: 例: 「〇〇コンサルタント - 30分セッション」
- **説明**: オプション
- **金額**: 例: ¥5,000
- **支払い方法**: 1回のみ

#### 成功後のリダイレクト

**重要**: 環境に応じて設定を変更してください

**開発環境（テストモード）:**

```
http://localhost:3000/bookings/confirmed?session_id={CHECKOUT_SESSION_ID}
```

**本番環境（本番モード）:**

```
https://moment-works.com/bookings/confirmed?session_id={CHECKOUT_SESSION_ID}
```

#### その他の設定

- **顧客情報の収集**: メールアドレス（必須）、名前（任意）
- **支払い後のメッセージ**: 「予約が確定しました。詳細はメールでお送りします。」

### 3. Payment LinkのURLをコピー

作成後、Payment LinkのURLが生成されます：

```
https://buy.stripe.com/test_xxxxxxxxxx (テストモード)
https://buy.stripe.com/xxxxxxxxxx (本番モード)
```

### 4. データベースに登録

コンサルタントのレコードに Payment Link を登録します。

```sql
-- 開発環境（テストモード）の例
UPDATE consultants 
SET payment_link = 'https://buy.stripe.com/test_xxxxxxxxxx?client_reference_id={BOOKING_ID}'
WHERE id = 'コンサルタントのID';

-- 本番環境（本番モード）の例
UPDATE consultants 
SET payment_link = 'https://buy.stripe.com/xxxxxxxxxx?client_reference_id={BOOKING_ID}'
WHERE id = 'コンサルタントのID';
```

**注意**: `{BOOKING_ID}`はプレースホルダーです。実際の運用では、メール送信時にこの部分を実際のbooking IDに置き換えます。

## 環境ごとの設定まとめ

### 開発環境（ローカル + Stripe Test Mode）

**環境変数（`.env.local`）:**

```bash
BASE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx
```

**Payment Link リダイレクトURL:**

```
http://localhost:3000/bookings/confirmed?session_id={CHECKOUT_SESSION_ID}
```

### 本番環境（Vercel + Stripe Live Mode）

**環境変数（Vercel Dashboard）:**

```bash
BASE_URL=https://moment-works.com
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Payment Link リダイレクトURL:**

```
https://moment-works.com/bookings/confirmed?session_id={CHECKOUT_SESSION_ID}
```

## Webhook設定

### 1. Webhook エンドポイントを追加

Stripe Dashboard → 開発者 → Webhook で以下を追加：

**開発環境（テスト用）:**

```
https://your-ngrok-url.ngrok.io/api/stripe/webhook
```

または Stripe CLIを使用：

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**本番環境:**

```
https://moment-works.com/api/stripe/webhook
```

### 2. イベントを選択

以下のイベントを選択：

- `checkout.session.completed` - 決済完了時

### 3. Webhook署名シークレットをコピー

`whsec_xxxxx` 形式のシークレットを環境変数 `STRIPE_WEBHOOK_SECRET` に設定します。

## テスト方法

### 開発環境でのテスト

1. Stripe Test Modeでテストカードを使用：
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 将来の任意の日付
   - CVC: 任意の3桁

2. Payment Linkにアクセスして決済を実行

3. リダイレクト先が正しく表示されるか確認

4. Webhook が正常に受信されるか確認（ターミナルのログを確認）

## トラブルシューティング

### リダイレクトが失敗する

- Payment Link作成時のリダイレクトURLが正しいか確認
- `BASE_URL` 環境変数が正しく設定されているか確認

### Webhookが受信されない

- Webhook エンドポイントURLが正しいか確認
- `STRIPE_WEBHOOK_SECRET` が正しく設定されているか確認
- Stripe Dashboard → Webhook → ログで失敗原因を確認

### 本番環境でテストカードが使えない

- Stripe Dashboardが本番モードになっているか確認
- 本番モードでは実際のカード情報が必要です

## 参考リンク

- [Stripe Payment Links](https://stripe.com/docs/payment-links)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Test Cards](https://stripe.com/docs/testing)
