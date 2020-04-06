const express = require("express");
const { resolve } = require("path");
const cors = require('cors')
const app = express();
const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(cors());

app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function(req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    }
  })
);

// list of product available for sale
// note: in production, this would come from a DB
const products = [
  { description: "USS Enterprise (NCC-1701) [Original Series]", price: 40.00 },
  { description: "USS Enterprise (NCC-1701) [Kelvin Timeline (2009 Reboot)]", price: 65.00 },
  { description: "USS Enterprise (NCC-1701-A) [Original Series]", price: 40.00 },
  { description: "USS Enterprise (NCC-1701) [Kelvin Timeline (2009 Reboot)]", price: 65.00 },
  { description: "USS Enterprise (NCC-1701-B)", price: 20.00 },
  { description: "USS Enterprise (NCC-1701-C)", price: 15.00 },
  { description: "USS Enterprise (NCC-1701-D)", price: 45.00 },
  { description: "USS Enterprise (NCC-1701-E)", price: 50.00 },
  { description: "Enterprise (NX-01)", price: 75.00 },
];

// return list of products offered and their prices
app.get("/products", (req, res) => {
  res.send(JSON.stringify(products));
});

// confirm that the item requested exists,
// and is the price that the customer expects to pay
function validatePurchaseAndPrice(description, price) {
  const selected = products.find(object => object.description === description);
  if(selected && selected.price === price) {
    return selected.price * 100;
  }
  else {
    return 0;
  }
}

// create Stripe payment intent and return client secret upon success
app.post("/create-payment-intent", async (req, res) => {
  const { description, price, currency, name, email } = req.body;
  console.log(req.body);
  const amount = validatePurchaseAndPrice(description, price);

  if(amount > 0) {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      // Testing: verify Stripg integration in this guide by including this parameter
      metadata: {integration_check: 'accept_a_payment'}
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      clientSecret: paymentIntent.client_secret,
      error: ''
    });
  }
  else {
    const errorString = "create-payment-intent: requested product not found or price mismatch.";
    console.log(errorString);
    res.status(500);
    res.send({error: errorString});
  }
});

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
app.post("/webhook", async (req, res) => {
  let data, eventType;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err);
      return res.sendStatus(400);
    }
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // we can retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === "payment_intent.succeeded") {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log("💰 Payment captured!");
  } else if (eventType === "payment_intent.payment_failed") {
    console.log("❌ Payment failed.");
  }
  res.sendStatus(200);
});

app.listen(4242, () => console.log(`Node server listening on port ${4242}!`));
