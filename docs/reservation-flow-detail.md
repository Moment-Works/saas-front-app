# 予約フロー詳細

## 概要

リクエスト型予約の詳細な処理フロー。Payment Linkと`client_reference_id`を使って、予約と決済を紐づける。

---

## データの紐づけ

```
┌─────────────────────────────────────────────────────────────┐
│ consultants テーブル                                        │
├─────────────────────────────────────────────────────────────┤
│ id: "consultant_123"                                        │
│ name: "山田太郎"                                            │
│ payment_link: "https://buy.stripe.com/xxxxx"  ← 手動で登録  │
│ meet_url: "https://meet.google.com/xxx-xxxx-xxx"            │
│ email: "yamada@example.com"                                 │
└─────────────────────────────────────────────────────────────┘
        │
        │ consultant_id で紐づけ
        ▼
┌─────────────────────────────────────────────────────────────┐
│ bookings テーブル                                           │
├─────────────────────────────────────────────────────────────┤
│ id: "booking_abc123"                                        │
│ consultant_id: "consultant_123"                             │
│ client_name: "田中一郎"                                     │
│ client_email: "client@example.com"                          │
│ preferred_dates: ["1/20 19:00", "1/21 20:00", "1/22 19:00"] │
│ message: "キャリアについて相談したいです"                    │
│ status: "pending"                                           │
│ confirmed_date: null                                        │
│ stripe_session_id: null                                     │
└─────────────────────────────────────────────────────────────┘
        │
        │ client_reference_id で紐づけ
        ▼
┌─────────────────────────────────────────────────────────────┐
│ Payment Link URL                                            │
├─────────────────────────────────────────────────────────────┤
│ https://buy.stripe.com/xxxxx?client_reference_id=booking_abc123
└─────────────────────────────────────────────────────────────┘
```

---

## フロー詳細

### Step 1: リクエスト送信

**アクション**: クライアントがフォーム送信

```
POST /api/bookings
{
  "consultant_id": "consultant_123",
  "client_name": "田中一郎",
  "client_email": "client@example.com",
  "preferred_dates": ["1/20 19:00", "1/21 20:00", "1/22 19:00"],
  "message": "キャリアについて相談したいです"
}
```

**処理**:

```javascript
// 1. bookingをDBに保存
const { data: booking } = await supabase
  .from('bookings')
  .insert({
    consultant_id,
    client_name,
    client_email,
    preferred_dates,
    message,
    status: 'pending'
  })
  .select()
  .single();

// 2. コンサルタント情報を取得
const { data: consultant } = await supabase
  .from('consultants')
  .select('*')
  .eq('id', consultant_id)
  .single();

// 3. Payment LinkにIDを付与
const paymentUrl = `${consultant.payment_link}?client_reference_id=${booking.id}`;

// 4. メール送信
await sendEmail(consultant.email, 'コンサルタント向け通知', { booking, paymentUrl });
await sendEmail(client_email, 'クライアント向け確認', { booking });
```

**DB状態**:

| フィールド | 値 |
|-----------|-----|
| status | `pending` |
| confirmed_date | `null` |
| stripe_session_id | `null` |

---

### Step 2: 日時調整（手動）

**アクション**: コンサルタントがメールでクライアントと調整

通知メールに含まれる内容：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
新しい相談リクエストがあります
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ クライアント情報
お名前: 田中一郎
メール: client@example.com

■ 希望日時
・1/20 19:00
・1/21 20:00
・1/22 19:00

■ 相談内容
キャリアについて相談したいです

■ 日程確定後、以下のリンクを送付してください
https://buy.stripe.com/xxxxx?client_reference_id=booking_abc123

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※このメールは送信専用です
お問い合わせ: hi.moment@gmail.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Step 3: Payment Link送付（手動）

**アクション**: コンサルタントがクライアントにURLを送る

```
田中様

日程は1/20 19:00で確定とさせていただきます。
以下よりお支払いをお願いいたします。

https://buy.stripe.com/xxxxx?client_reference_id=booking_abc123

山田太郎
```

---

### Step 4: 決済

**アクション**: クライアントがPayment Linkで支払い

Stripeが処理：

1. クレジットカード情報入力
2. 決済処理
3. 完了後 `/bookings/confirmed` にリダイレクト
4. Webhookを送信

---

### Step 5: Webhook受信

**アクション**: Stripeからの通知を処理

```
POST /api/webhook
```

**処理**:

```javascript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  // 1. 署名検証
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // 2. イベント処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.client_reference_id;

    // 3. booking取得
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, consultants(*)')
      .eq('id', bookingId)
      .single();

    // 4. ステータス更新
    await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        stripe_session_id: session.id
      })
      .eq('id', bookingId);

    // 5. 確定メール送信
    await sendEmail(booking.client_email, 'クライアント向け確定', {
      booking,
      meetUrl: booking.consultants.meet_url
    });
    await sendEmail(booking.consultants.email, 'コンサルタント向け確定', {
      booking
    });
  }

  return new Response('OK', { status: 200 });
}
```

**DB状態（更新後）**:

| フィールド | 値 |
|-----------|-----|
| status | `confirmed` |
| confirmed_date | コンサルが手動で入れるか、別途対応 |
| stripe_session_id | `cs_xxxxxxxxxxxxx` |

---

## メール一覧

### リクエスト受信時

| 宛先 | 件名 | 内容 |
|------|------|------|
| コンサルタント | 新しい相談リクエスト | クライアント情報、希望日時、Payment Link（ID付き） |
| クライアント | リクエストを受け付けました | 確認内容、「連絡をお待ちください」 |

### 決済完了時

| 宛先 | 件名 | 内容 |
|------|------|------|
| クライアント | 予約が確定しました | Meet URL、日時（※）、問い合わせ先 |
| コンサルタント | 予約が確定しました | クライアント情報、日時（※） |

※ 確定日時はメールでのやり取りで決まるため、システムでは保持しない。メール文面は汎用的にする。

---

## confirmed_date の扱い

MVP では確定日時をシステムで管理しない選択肢もある。

| 方式 | メリット | デメリット |
|------|----------|-----------|
| **A. 管理しない** | 実装シンプル | 後から履歴が追えない |
| **B. 手動で更新** | Supabase管理画面から入力 | 手間がかかる |
| **C. メールに入力欄** | - | 実装複雑 |

**MVP推奨: A（管理しない）**

必要になったらPhase 2で対応。

---

## ステータス遷移

```
pending（リクエスト受付）
    │
    │ 決済完了（Webhook）
    ▼
confirmed（予約確定）
    │
    │ ミーティング実施後（将来）
    ▼
completed（完了）※MVP では未実装
```

---

## エラーケース

| ケース | 対応 |
|--------|------|
| Webhook署名検証失敗 | 400エラー返却、処理しない |
| booking_idが見つからない | ログ出力、エラーメール通知（将来） |
| メール送信失敗 | リトライ or ログ出力（MVPではログのみ） |
| 二重Webhook | `stripe_session_id` の存在チェックでスキップ |

---

## Stripe設定

### Webhook エンドポイント登録

Stripeダッシュボード → 開発者 → Webhook → エンドポイント追加

| 項目 | 値 |
|------|-----|
| URL | `https://moment-works.com/api/webhook` |
| イベント | `checkout.session.completed` |

### 環境変数

```
STRIPE_SECRET_KEY=sk_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## テスト方法

### 1. ローカルでのWebhookテスト

Stripe CLIを使用：

```bash
# Stripe CLI インストール後
stripe listen --forward-to localhost:3000/api/webhook
```

表示されるWebhook Secretを`.env.local`に設定。

### 2. テスト決済

```
カード番号: 4242 4242 4242 4242
有効期限: 任意の未来日付
CVC: 任意の3桁
```

### 3. 確認項目

| 確認内容 | 方法 |
|----------|------|
| booking作成 | Supabase管理画面 |
| ステータス更新 | `status`が`confirmed`になっているか |
| メール送信 | Resendダッシュボード or 実際の受信確認 |

---

## 補足：決済完了画面

`/bookings/confirmed` は静的ページでOK。

```tsx
// app/bookings/confirmed/page.tsx
export default function ConfirmedPage() {
  return (
    <div>
      <h1>予約が確定しました</h1>
      <p>詳細はメールをご確認ください。</p>
      <p>届かない場合: hi.moment@gmail.com</p>
    </div>
  );
}
```

Webhook処理とは独立しているので、タイミングを気にする必要なし。
