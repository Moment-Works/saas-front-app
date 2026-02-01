import Stripe from 'stripe';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { bookings, consultants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendBookingConfirmation } from '@/lib/email/send';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 },
    );
  }

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;

    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

/**
 * Handle checkout.session.completed event for Payment Links
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const bookingId = session.client_reference_id;

    if (!bookingId) {
      console.log(
        'No client_reference_id found in session, skipping booking update',
      );
      return;
    }

    console.log('Processing checkout completion for booking:', bookingId);

    // Get booking with consultant data
    const bookingResult = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingResult.length === 0) {
      console.error('Booking not found:', bookingId);
      return;
    }

    const booking = bookingResult[0];

    // Check if already processed (prevent duplicate webhook processing)
    if (booking.stripeSessionId) {
      console.log('Booking already processed, skipping:', bookingId);
      return;
    }

    // Get consultant data
    const consultantResult = await db
      .select()
      .from(consultants)
      .where(eq(consultants.id, booking.consultantId))
      .limit(1);

    if (consultantResult.length === 0) {
      console.error('Consultant not found:', booking.consultantId);
      return;
    }

    const consultant = consultantResult[0];

    // Update booking status
    await db
      .update(bookings)
      .set({
        status: 'confirmed',
        stripeSessionId: session.id,
      })
      .where(eq(bookings.id, bookingId));

    console.log('Booking status updated to confirmed:', bookingId);

    // Send confirmation emails
    try {
      await sendBookingConfirmation({
        ...booking,
        consultant,
      });
      console.log('Confirmation emails sent for booking:', bookingId);
    } catch (emailError) {
      console.error('Failed to send confirmation emails:', emailError);
      // Don't throw - booking is already updated
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error);
    throw error;
  }
}
