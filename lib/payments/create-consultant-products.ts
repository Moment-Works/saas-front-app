import { stripe } from './stripe';
import { db } from '../db/drizzle';
import { consultants } from '../db/schema';
import { eq } from 'drizzle-orm';

interface ConsultantProduct {
  consultantId: string;
  name: string;
  price: number;
}

async function createConsultantProducts() {
  console.log('Fetching consultants from database...');

  // Get all consultants from database
  const allConsultants = await db.select().from(consultants);

  if (allConsultants.length === 0) {
    console.error(
      'No consultants found in database. Please run seed-consultants.ts first.',
    );
    process.exit(1);
  }

  console.log(`Found ${allConsultants.length} consultants`);
  console.log('Creating Stripe products and payment links...\n');

  for (const consultant of allConsultants) {
    console.log(`\n📦 Creating product for: ${consultant.name}`);

    try {
      // Create Stripe Product
      const product = await stripe.products.create({
        name: `コンサルティング（${consultant.name}）30分`,
        description: `${consultant.title} - 30分セッション`,
        metadata: {
          consultant_id: consultant.id,
          consultant_name: consultant.name,
          duration: '30min',
        },
      });

      console.log(`  ✓ Product created: ${product.id}`);

      // Create Price (one-time payment)
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: consultant.price30min, // Amount in cents
        currency: 'jpy',
        metadata: {
          consultant_id: consultant.id,
        },
      });

      console.log(
        `  ✓ Price created: ${price.id} (¥${consultant.price30min.toLocaleString()})`,
      );

      // Create Payment Link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.BASE_URL || 'http://localhost:3000'}/bookings/confirmed`,
          },
        },
        allow_promotion_codes: false,
        billing_address_collection: 'auto',
        phone_number_collection: {
          enabled: false,
        },
        metadata: {
          consultant_id: consultant.id,
          consultant_name: consultant.name,
        },
      });

      console.log(`  ✓ Payment Link created: ${paymentLink.url}`);

      // Update consultant record with payment link
      await db
        .update(consultants)
        .set({ paymentLink: paymentLink.url })
        .where(eq(consultants.id, consultant.id));

      console.log(`  ✓ Database updated with payment link`);
      console.log(`  🎉 Completed for ${consultant.name}\n`);
    } catch (error) {
      console.error(
        `  ❌ Error creating product for ${consultant.name}:`,
        error,
      );
      throw error;
    }
  }

  console.log(
    '\n✅ All consultant products and payment links created successfully!',
  );
  console.log('\nSummary:');

  const updatedConsultants = await db.select().from(consultants);
  updatedConsultants.forEach((c) => {
    console.log(`  - ${c.name}: ${c.paymentLink}`);
  });
}

createConsultantProducts()
  .catch((error) => {
    console.error('\n❌ Process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('\nProcess finished. Exiting...');
    process.exit(0);
  });
