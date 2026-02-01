import { resend, EMAIL_FROM } from './resend';
import { Consultant, Booking } from '@/lib/db/schema';
import {
  getConsultantNotificationEmail,
  getClientConfirmationEmail,
  getBookingConfirmationEmail,
} from './templates';

interface BookingWithConsultant extends Booking {
  consultant: Consultant;
}

/**
 * Send booking request notification to consultant
 */
export async function sendConsultantNotification(
  consultant: Consultant,
  booking: Booking,
  paymentUrl: string,
) {
  const { subject, html } = getConsultantNotificationEmail(
    consultant,
    booking,
    paymentUrl,
  );

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: consultant.email,
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send consultant notification:', error);
      throw error;
    }

    console.log('Consultant notification sent:', data?.id);
    return data;
  } catch (error) {
    console.error('Error sending consultant notification:', error);
    throw error;
  }
}

/**
 * Send booking request confirmation to client
 */
export async function sendClientConfirmation(
  clientEmail: string,
  booking: Booking,
) {
  const { subject, html } = getClientConfirmationEmail(booking);

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: clientEmail,
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send client confirmation:', error);
      throw error;
    }

    console.log('Client confirmation sent:', data?.id);
    return data;
  } catch (error) {
    console.error('Error sending client confirmation:', error);
    throw error;
  }
}

/**
 * Send booking confirmation after payment (to both client and consultant)
 */
export async function sendBookingConfirmation(booking: BookingWithConsultant) {
  const { subject, html } = getBookingConfirmationEmail(
    booking,
    booking.consultant.meetUrl || '',
  );

  try {
    // Send to client
    const clientResult = await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.clientEmail,
      subject,
      html,
    });

    if (clientResult.error) {
      console.error('Failed to send client confirmation:', clientResult.error);
      throw clientResult.error;
    }

    console.log('Client booking confirmation sent:', clientResult.data?.id);

    // Send to consultant (simplified version)
    const consultantSubject = '予約が確定しました（コンサルタント向け）';
    const consultantHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .info-box { background-color: #dbeafe; padding: 15px; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>予約が確定しました</h1>
    </div>
    
    <div class="content">
      <p>${booking.consultant.name} 様</p>
      
      <p>決済が完了し、以下のクライアントとのセッションが確定しました。</p>

      <div class="info-box">
        <strong>クライアント情報:</strong><br>
        お名前: ${booking.clientName}<br>
        メール: ${booking.clientEmail}
      </div>

      <div class="info-box">
        <strong>相談内容:</strong><br>
        <div style="white-space: pre-wrap;">${booking.message}</div>
      </div>

      <p style="margin-top: 20px;">
        クライアントにはGoogle Meet URLを送信しました。<br>
        セッション当日は、お時間に余裕を持ってご準備ください。
      </p>
    </div>

    <div class="footer">
      <p>お問い合わせ: <a href="mailto:hi.moment@gmail.com" style="color: #f97316;">hi.moment@gmail.com</a></p>
      <p style="margin-top: 15px; color: #9ca3af;">© 2024 Moment Works</p>
    </div>
  </div>
</body>
</html>
    `;

    const consultantResult = await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.consultant.email,
      subject: consultantSubject,
      html: consultantHtml,
    });

    if (consultantResult.error) {
      console.error(
        'Failed to send consultant confirmation:',
        consultantResult.error,
      );
      // Don't throw - client email is more important
    } else {
      console.log(
        'Consultant booking confirmation sent:',
        consultantResult.data?.id,
      );
    }

    return {
      client: clientResult.data,
      consultant: consultantResult.data,
    };
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    throw error;
  }
}
