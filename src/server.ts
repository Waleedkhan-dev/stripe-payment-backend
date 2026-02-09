import express from 'express';
import type { Request, Response } from 'express';

import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import { it } from 'node:test';

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

app.get("/", (req: Request  , res: Response) => {
  res.send("Stripe Payment Backend is running.");
});
app.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const { items, shippingCost } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // 👈 REAL PRICE
      },
      quantity: item.quantity,
    }));

    // Optional shipping
    if (shippingCost > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: 'https://www.bevvybullet.com/success',
      cancel_url: 'https://www.bevvybullet.com/cancel',
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
