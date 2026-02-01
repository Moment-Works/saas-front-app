import { Consultant, Booking } from '@/lib/db/schema';

interface BookingWithConsultant extends Booking {
  consultant: Consultant;
}

// Email template for consultant notification
export function getConsultantNotificationEmail(
  consultant: Consultant,
  booking: Booking,
  paymentUrl: string,
) {
  const subject = '新しい相談リクエストがあります';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .section { margin-bottom: 25px; }
    .section-title { font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    .info-row { margin: 8px 0; }
    .payment-link { background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .dates-list { background-color: white; padding: 15px; border-radius: 6px; margin: 10px 0; }
    .date-item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .date-item:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>新しい相談リクエスト</h1>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">■ クライアント情報</div>
        <div class="info-row"><strong>お名前:</strong> ${booking.clientName}</div>
        <div class="info-row"><strong>メール:</strong> ${booking.clientEmail}</div>
      </div>

      <div class="section">
        <div class="section-title">■ 希望日時</div>
        <div class="dates-list">
          ${
            booking.preferredDates
              ?.map(
                (date, index) => `
            <div class="date-item">${index + 1}. ${date}</div>
          `,
              )
              .join('') || '<div>未指定</div>'
          }
        </div>
      </div>

      <div class="section">
        <div class="section-title">■ 相談内容</div>
        <div style="background-color: white; padding: 15px; border-radius: 6px; white-space: pre-wrap;">
${booking.message}
        </div>
      </div>

      <div class="section" style="background-color: #fef3c7; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b;">
        <div class="section-title" style="color: #92400e;">■ 日程確定後の対応</div>
        <p style="margin: 10px 0; color: #92400e;">クライアントと日程調整が完了したら、以下のPayment Linkを送付してください：</p>
        <a href="${paymentUrl}" class="payment-link" style="color: white;">Payment Linkをコピー</a>
        <p style="margin-top: 15px; font-size: 14px; color: #92400e;">
          ※ このリンクには予約IDが付与されています。決済完了後、自動的に予約が確定されます。
        </p>
      </div>
    </div>

    <div class="footer">
      <p>このメールは送信専用です。</p>
      <p>お問い合わせ: <a href="mailto:hi.moment@gmail.com" style="color: #f97316;">hi.moment@gmail.com</a></p>
      <p style="margin-top: 15px; color: #9ca3af;">© 2024 Moment Works</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

// Email template for client confirmation
export function getClientConfirmationEmail(booking: Booking) {
  const subject = 'リクエストを受け付けました';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .section { margin-bottom: 20px; }
    .check-icon { font-size: 48px; text-align: center; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .info-box { background-color: #dbeafe; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6; }
    .steps { background-color: white; padding: 20px; border-radius: 6px; }
    .step { padding: 15px; margin: 10px 0; border-left: 3px solid #f97316; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ リクエストを受け付けました</h1>
    </div>
    
    <div class="content">
      <div class="check-icon">✅</div>
      
      <p style="text-align: center; font-size: 18px; margin: 20px 0;">
        ${booking.clientName} 様
      </p>
      
      <p style="text-align: center;">
        ご相談リクエストありがとうございます。<br>
        コンサルタントから日程調整のご連絡をメールでお送りいたします。
      </p>

      <div class="info-box" style="margin: 30px 0;">
        <strong style="display: block; margin-bottom: 10px;">📧 今後の流れ</strong>
        <div class="steps">
          <div class="step">
            <strong>1. 日程調整</strong><br>
            コンサルタントから日程調整のメールが届きます（通常24時間以内）
          </div>
          <div class="step">
            <strong>2. 決済リンク送付</strong><br>
            日程確定後、お支払い用のリンクをお送りします
          </div>
          <div class="step">
            <strong>3. セッション実施</strong><br>
            決済完了後、Google MeetのURLをお送りします
          </div>
        </div>
      </div>

      <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 20px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>⚠️ メールが届かない場合</strong><br>
          迷惑メールフォルダもご確認ください。<br>
          24時間経っても連絡がない場合は、お手数ですが下記までお問い合わせください。
        </p>
      </div>
    </div>

    <div class="footer">
      <p>お問い合わせ: <a href="mailto:hi.moment@gmail.com" style="color: #f97316;">hi.moment@gmail.com</a></p>
      <p style="margin-top: 15px; color: #9ca3af;">© 2024 Moment Works</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

// Email template for booking confirmation (after payment)
export function getBookingConfirmationEmail(
  booking: BookingWithConsultant,
  meetUrl: string,
) {
  const subject = '予約が確定しました';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .section { margin-bottom: 25px; }
    .meet-link { background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; margin: 15px 0; }
    .info-box { background-color: #dbeafe; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .checklist { background-color: white; padding: 20px; border-radius: 6px; }
    .checklist-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .checklist-item:last-child { border-bottom: none; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 予約が確定しました</h1>
    </div>
    
    <div class="content">
      <p style="text-align: center; font-size: 18px;">
        ${booking.clientName} 様
      </p>
      
      <p style="text-align: center; margin-bottom: 30px;">
        決済が完了し、${booking.consultant.name}とのセッションが確定しました。
      </p>

      <div class="info-box">
        <div style="margin-bottom: 20px;">
          <strong style="display: block; margin-bottom: 8px;">📅 セッション情報</strong>
          <div>コンサルタント: <strong>${booking.consultant.name}</strong></div>
          <div style="margin-top: 8px; color: #6b7280; font-size: 14px;">
            ※ 確定日時はメールでのやり取りで決定した日時をご確認ください
          </div>
        </div>

        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #bfdbfe;">
          <strong style="display: block; margin-bottom: 10px;">🎥 Google Meet URL</strong>
          <div style="background-color: white; padding: 15px; border-radius: 6px; word-break: break-all;">
            <a href="${meetUrl}" style="color: #3b82f6;">${meetUrl}</a>
          </div>
          <p style="margin-top: 10px; font-size: 14px; color: #6b7280;">
            ※ セッション開始5分前にはアクセスしてお待ちください
          </p>
        </div>
      </div>

      <div class="section" style="background-color: #fef3c7; padding: 20px; border-radius: 6px;">
        <strong style="display: block; margin-bottom: 15px; color: #92400e;">⚠️ 当日の準備</strong>
        <div class="checklist">
          <div class="checklist-item">
            <strong>カメラとマイクの確認</strong><br>
            <span style="font-size: 14px; color: #6b7280;">事前に動作確認をお願いします</span>
          </div>
          <div class="checklist-item">
            <strong>相談内容の整理</strong><br>
            <span style="font-size: 14px; color: #6b7280;">聞きたいことを事前にまとめておくと効果的です</span>
          </div>
          <div class="checklist-item">
            <strong>静かな環境の確保</strong><br>
            <span style="font-size: 14px; color: #6b7280;">集中できる場所でのご参加をおすすめします</span>
          </div>
        </div>
      </div>

      <p style="text-align: center; margin-top: 30px; color: #6b7280;">
        それでは、セッションでお会いしましょう！
      </p>
    </div>

    <div class="footer">
      <p>キャンセル・日程変更は早めにご連絡ください</p>
      <p>お問い合わせ: <a href="mailto:hi.moment@gmail.com" style="color: #f97316;">hi.moment@gmail.com</a></p>
      <p style="margin-top: 15px; color: #9ca3af;">© 2024 Moment Works</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}
