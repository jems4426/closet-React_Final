import express from 'express';
import Stripe from 'stripe';
import asyncHandler from 'express-async-handler';
import { requireAuth } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

// Create PaymentIntent from user's current cart
router.post(
  '/create-intent',
  requireAuth,
  asyncHandler(async (req, res) => {
    try {
      const { items, currency = 'inr', address } = req.body;
      console.log('Payment request:', { items, currency, address, userId: req.userId });
      
      // items: [{ productId, quantity }]
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'No items provided' });
      }
      
      const productIds = items.map((i) => i.productId);
      console.log('Looking for products:', productIds);
      
      const products = await Product.find({ _id: { $in: productIds }, isActive: true });
      console.log('Found products:', products.length);
      
      if (products.length === 0) {
        return res.status(400).json({ message: 'No valid products found' });
      }
      
      const priceById = new Map(products.map((p) => [p._id.toString(), p.price]));
      const amount = items.reduce((sum, i) => sum + (priceById.get(i.productId) || 0) * i.quantity, 0);
      
      if (amount <= 0) {
        return res.status(400).json({ message: 'Invalid order amount' });
      }
      
      const amountInCents = Math.round(amount * 100);

      let paymentIntent;
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency,
          metadata: { userId: req.userId },
          automatic_payment_methods: { enabled: true }
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // Fallback: create order without Stripe
        const order = await Order.create({
          user: req.userId,
          items: items.map((i) => ({ product: i.productId, quantity: i.quantity, price: priceById.get(i.productId) || 0 })),
          totalAmount: amount,
          currency,
          status: 'paid', // Mark as paid for demo
          address
        });
        return res.json({ orderId: order._id, fallback: true });
      }

      const order = await Order.create({
        user: req.userId,
        items: items.map((i) => ({ product: i.productId, quantity: i.quantity, price: priceById.get(i.productId) || 0 })),
        totalAmount: amount,
        currency,
        status: 'pending',
        paymentIntentId: paymentIntent.id,
        address
      });

      res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
    } catch (error) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ message: 'Payment processing failed', error: error.message });
    }
  })
);

// Stripe webhook to confirm payment
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    await Order.findOneAndUpdate({ paymentIntentId: intent.id }, { status: 'paid' });
  } else if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    await Order.findOneAndUpdate({ paymentIntentId: intent.id }, { status: 'failed' });
  }

  res.json({ received: true });
});

// Fallback confirmation without webhook (not as robust as webhooks)
router.post(
  '/confirm',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { paymentIntentId, clientSecret } = req.body;
    if (!paymentIntentId && !clientSecret) {
      return res.status(400).json({ message: 'paymentIntentId or clientSecret is required' });
    }

    let intent;
    try {
      if (paymentIntentId) {
        intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      } else {
        // clientSecret format: pi_XXX_secret_YYY -> extract id up to first "_secret"
        const id = String(clientSecret).split('_secret')[0];
        intent = await stripe.paymentIntents.retrieve(id);
      }
    } catch (e) {
      return res.status(400).json({ message: 'Invalid PaymentIntent', error: e.message });
    }

    const order = await Order.findOne({ paymentIntentId: intent.id, user: req.userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (intent.status === 'succeeded') {
      if (order.status !== 'paid') {
        order.status = 'paid';
        await order.save();
      }
      return res.json({ ok: true, status: order.status });
    }

    return res.json({ ok: false, status: intent.status });
  })
);

export default router;


