# Overview
This app is a demonstration of the Stripe Payment Intents API. The app is a very simple ecommerce website that is selling models of the Star Trek Enterprise that can be 3D printed at home. The user selects which model of the ship they wish to order, enters their payment information, and completes their payment. The application does not actually process the orders (i.e. it does not email 3D models to the customer). The app logs the Stripe Payment activity to a file (`payments.log`) in the project’s `/server` directory.

# About
This project was created for a Stripe PM interview written test, which is focused on the [Stripe Payment Intents integration](https://stripe.com/docs/payments/accept-a-payment#web). It contains both a `client` and `server` component. 
* The `client` was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), and then built following the [client-side instructions here](https://stripe.com/docs/payments/accept-a-payment#web).
* The `server` originated from [Stripe's node webhooks example](https://github.com/stripe-samples/accept-a-card-payment) implementation, then modified for this exercise.
* The application is configured to run locally; there are no build/deploy instructions at this time.

# Prerequisites
These instructions assume you have `NodeJS (10.x)` installed and are running in a Linux environment. This has been tested on Ubuntu 18.04.4 (running under Windows 10 WSL).

# How to Install
After cloning this repository (e.g. `git clone https://github.com/kmwoley/stripe-pm-exercise.git`), follow these steps.

## Install the Stripe CLI
Because we're going to be using webhooks, we need the Strip CLI to connect our locally running server to Stripe's webhooks callbacks. The CLI handles that beautifully.

1. Follow the [instructions to install the Stripe CLI](https://stripe.com/docs/payments/handling-payment-events#install-cli) if you don't already have it installed and configured.
1. Once installed, Run `stripe listen --forward-to http://localhost:4242/webhook`
1. Make note of the webhook signing secret (i.e. `whsec_1abc2...`) returned; we'll use it in our next step.

## Server Setup
1. Change directory to the `/server` directory
1. Run `npm install`
1. Copy the template environment file `.env.copy_modify_me` to `.env` (i.e. `cp .env.copy_modify_me .env`)
1. Open `.env` in an editor
   1. Follow the instructions here to [obtain your API keys](https://stripe.com/docs/development#api-keys).
   1. Update the file to reflect your `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`
   1. (Optional) Change the `ORDERID_SECRET` to a randomly generated string.

## Client Setup
1. Change directory to the `/client` directory
1. Run `npm install`
1. Copy the template environment file `.env.copy_modify_me` to `.env` (i.e. `cp .env.copy_modify_me .env`)
1. Open `.env` in an editor
   1. Update `REACT_APP_STRIPE_PUBLISHABLE_KEY` to your Stripe publishable key.

# How to run
There three components which must be running for the project to work: the server, the client, and the Stripe CLI. Each must be running at the same time, in their own terminal window.

## Run the Server
1. Open a new terminal and navigate to the `/server` directory
1. Run `npm start`

## Run the Stripe CLI
1. Open a new terminal
1. Run `stripe listen --forward-to http://localhost:4242/webhook`

## Run the Client
1. Open a new terminal and navigate to the `/client` directory
1. Run `npm start`

At this time, your browser should launch to [http://localhost:3000](http://localhost:3000). If it does not, navigate to the page manually.

# Usage
Stripe provides [test Credit Card numbers](https://stripe.com/docs/payments/accept-a-payment#web-test-integration) to demonstrate the various payment success/failure conditions. Use these Credit Cards to complete a payment.

The Server logs relevent payment activity (intent creation, order information, success/failure, and payment intent events) in the `/server` directory in `payments.log`

# Enjoy!
Feel free to file issues for bugs and suggested improvements.
