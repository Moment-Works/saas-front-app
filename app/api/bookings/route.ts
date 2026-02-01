import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { bookings, consultants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import {
  sendConsultantNotification,
  sendClientConfirmation,
} from '@/lib/email/send';

// Request validation schema
const bookingRequestSchema = z.object({
  consultantId: z.string().uuid(),
  clientName: z.string().min(1, 'お名前を入力してください'),
  clientEmail: z.string().email('有効なメールアドレスを入力してください'),
  preferredDates: z
    .array(z.string())
    .min(1, '希望日時を最低1つ入力してください')
    .max(3),
  message: z.string().min(1, '相談内容を入力してください'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = bookingRequestSchema.parse(body);

    // Check if consultant exists
    const consultant = await db
      .select()
      .from(consultants)
      .where(eq(consultants.id, validatedData.consultantId))
      .limit(1);

    if (consultant.length === 0) {
      return NextResponse.json(
        { error: 'コンサルタントが見つかりません' },
        { status: 404 },
      );
    }

    // Create booking
    const [booking] = await db
      .insert(bookings)
      .values({
        consultantId: validatedData.consultantId,
        clientName: validatedData.clientName,
        clientEmail: validatedData.clientEmail,
        preferredDates: validatedData.preferredDates,
        message: validatedData.message,
        status: 'pending',
      })
      .returning();

    console.log('Booking created:', booking.id);

    // Generate payment URL with client_reference_id
    const paymentUrl = `${consultant[0].paymentLink}?client_reference_id=${booking.id}`;

    // Send notification emails
    try {
      await Promise.all([
        sendConsultantNotification(consultant[0], booking, paymentUrl),
        sendClientConfirmation(validatedData.clientEmail, booking),
      ]);
      console.log('Notification emails sent successfully');
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Failed to send notification emails:', emailError);
      // You might want to implement a retry mechanism or alert here
    }

    return NextResponse.json(
      {
        success: true,
        bookingId: booking.id,
        message: 'リクエストを受け付けました',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating booking:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'バリデーションエラー',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: '予約の作成に失敗しました' },
      { status: 500 },
    );
  }
}
