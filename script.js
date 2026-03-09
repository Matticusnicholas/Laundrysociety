// ===== CONFIG =====
// TODO: Replace with your real Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_KEY_HERE';

// TODO: Replace with your backend endpoint that creates a Stripe Checkout Session
const CHECKOUT_API_URL = '/api/create-checkout-session';

// ===== Mobile Navigation =====
const mobileToggle = document.getElementById('mobile-toggle');
const navLinks = document.getElementById('nav-links');

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ===== Navbar scroll =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Donation logic =====
const tierCards = document.querySelectorAll('.tier-card');
const customInput = document.getElementById('custom-amount');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutAmount = document.getElementById('checkout-amount');

let selectedAmount = 240; // default

function updateCheckoutButton(amount) {
    selectedAmount = amount;
    checkoutAmount.textContent = '$' + amount;
}

// Tier card selection
tierCards.forEach(card => {
    card.addEventListener('click', () => {
        tierCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        customInput.value = '';
        updateCheckoutButton(parseInt(card.dataset.amount));
    });
});

// Custom amount input
customInput.addEventListener('input', () => {
    const val = parseInt(customInput.value);
    if (val > 0) {
        tierCards.forEach(c => c.classList.remove('selected'));
        updateCheckoutButton(val);
    }
});

// ===== Stripe Checkout =====
checkoutBtn.addEventListener('click', async () => {
    if (selectedAmount < 1) return;

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Redirecting...';

    try {
        // Call your backend to create a Stripe Checkout Session
        const response = await fetch(CHECKOUT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: selectedAmount * 100 }) // Stripe uses cents
        });

        const session = await response.json();

        // Redirect to Stripe Checkout
        const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        const result = await stripe.redirectToCheckout({ sessionId: session.id });

        if (result.error) {
            alert(result.error.message);
        }
    } catch (err) {
        // If no backend is set up yet, show a helpful message
        alert(
            'Stripe checkout is not connected yet.\n\n' +
            'To enable donations:\n' +
            '1. Add your Stripe publishable key in script.js\n' +
            '2. Set up a backend endpoint at ' + CHECKOUT_API_URL + '\n\n' +
            'Selected amount: $' + selectedAmount
        );
    }

    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'Donate $' + selectedAmount;
});

// ===== Contact form =====
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sent!';
    btn.style.background = '#16a34a';
    btn.style.borderColor = '#16a34a';
    btn.disabled = true;

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.disabled = false;
        contactForm.reset();
    }, 3000);
});
