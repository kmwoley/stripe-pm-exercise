import React, { useState } from 'react';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import './App.css';

import Products from './Products';
import CheckoutForm from './CheckoutForm';

require("dotenv").config({ path: "./.env" });

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function App() {  
  const [productPrice, setProductPrice] = useState(0);
  const [productDescription, setProductDescription] = useState('');

  const handleProductSelection = (description, price) => {
    setProductPrice(price);
    setProductDescription(description);
  }

  return (
    <div className="App">
      <h1>Star Trek Enterprise 3D Printable Models</h1>
      <h2>Please select the 3D model you'd like to purchase. Once your payment is complete, we'll email you the STL file(s) you need to build your own model!</h2>
      <div className="Products">
        <Products onProductSelection={handleProductSelection}/>
      </div>
      <div className="CardForm">
        <Elements stripe={stripePromise}>
          <CheckoutForm price={productPrice} description={productDescription}/>
        </Elements>
      </div>
    </div>
  );
}