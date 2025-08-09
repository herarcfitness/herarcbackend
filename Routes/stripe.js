const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.get('/payments', async (req, res) => {
  try {
    const payments = await stripe.paymentIntents.list({ limit: 10 });

    const formatted = payments.data.map((p) => ({
      id: p.id,
      amount: p.amount / 100,
      currency: p.currency,
      status: p.status,
      created: new Date(p.created * 1000).toLocaleDateString(),
      customer: p.customer, // You can expand this later
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching Stripe payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// simple health check
router.get('/health', (_req, res) => res.json({ ok: true }));

module.exports = router;