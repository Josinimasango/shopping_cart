const express = require("express");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST); // Stripe secret key
const bodyParser = require("body-parser");
const cors = require("cors");

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' }));

// Payment route
app.post("/payment", async (req, res) => {
    const { amount, id } = req.body;
    try {
        const payment = await stripe.paymentIntents.create({
            amount,
            currency: "ZAR",
            description: "Annes glam",
            payment_method: id,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
            // Uncomment this line if you plan to handle redirect-based payment methods:
            // return_url: 'https://localhost:3000/CompleteOrder' // Update this with your actual URL
        });
        console.log("Payment", payment);

        if (payment.status === 'requires_action') {
            res.json({
                requiresAction: true,
                paymentIntentId: payment.id,
                clientSecret: payment.client_secret,
                nextAction: payment.next_action,
            });
        } else {
            // Redirect to the complete order page if payment is successful
            res.json({ success: true, redirectUrl: 'http://localhost:3000/CompleteOrder' });
        }
    } catch (error) {
        console.log("Error", error);
        res.json({
            message: "Oopsie! Payment unsuccessful",
            success: false
        });
    }
});

// Route to handle the form submission and show a thank-you message
app.post('/submit-details', (req, res) => {
    const { name, surname, address } = req.body;

    console.log(`Collected details: ${name} ${surname}, Address: ${address}`);

    res.send(`
        <html>
            <body>
                <h1>Thank you, ${name} ${surname}!</h1>
                <p>We have received your address: ${address}</p>
                <script>
                    setTimeout(() => {
                        window.location.href = '/'; // Redirect to home page after 5 seconds
                    }, 5000);
                </script>
            </body>
        </html>
    `);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

