import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Ensure secret key exists
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in .env');
}
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'VIP Backer Deposit',
              description: 'Reserve your VIP spot with $1 refundable deposit',
            },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:8080/success',
      cancel_url: 'http://localhost:8080/cancel',
    });

    // NEW: send the session URL instead of ID
    res.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
