/**
 * Example Node.js backend for Stripe Checkout integration.
 *
 * Setup:
 *   1. npm init -y
 *   2. npm install express stripe cors
 *   3. Replace the STRIPE_SECRET_KEY below with your real secret key
 *   4. Run: node server-example.js
 *   5. Update STRIPE_PUBLISHABLE_KEY in script.js with your publishable key
 *
 * This creates a single endpoint: POST /api/create-checkout-session
 * The frontend calls this to get a Stripe session ID, then redirects to Stripe.
 */

const express = require('express');
const cors = require('cors');

// TODO: Replace with your real Stripe secret key
const stripe = require('stripe')('sk_test_YOUR_STRIPE_SECRET_KEY_HERE');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve the website files

app.post('/api/create-checkout-session', async (req, res) => {
    const { amount } = req.body; // amount in cents

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Donation to The Laundry Society',
                        description: 'Clean clothes for children in need',
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${req.headers.origin || 'http://localhost:3000'}?donation=success`,
            cancel_url: `${req.headers.origin || 'http://localhost:3000'}#donate`,
        });

        res.json({ id: session.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
