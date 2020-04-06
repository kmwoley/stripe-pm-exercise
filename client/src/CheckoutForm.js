import React, { useState } from 'react';
import axios from 'axios';
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';

import CardSection from './CardSection';

export default function CheckoutForm(props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  const setError = (message) => {
    document.getElementById('card-form-error').innerHTML = message;
  }

  const setSuccess = (message) => {
    document.getElementById('card-success').innerHTML = message;
  }

  const updateFormOnSuccess = () => {
    var form = document.getElementById("card-form");
    form.style.display = "none";
    setSuccess("Thank you for your purchase! Your order is on it's way.");

    var button = document.getElementById("buy-another");
    button.style.display = "block";
  }

  const handleReset = () => {
    setError(null);
    setSuccess(null);
    var form = document.getElementById("card-form");
    form.style.display = "block";
    var button = document.getElementById("buy-another");
    button.style.display = "none";
  }

  const handleNameChange = async (event) => {
    setName(event.target.value);
  }

  const handleEmailChange = async (event) => {
    setEmail(event.target.value);
  }

  // from: https://www.w3resource.com/javascript/form/email-validation.php
  function validEmailAddress(inputText)
  {
    // eslint-disable-next-line
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(inputText.match(mailformat))
    {
      return true;
    }
    else
    {
      return false;
    }
  }

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    // clear any previous display messages
    setError(null);
    setSuccess(null);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    if(!props.description) {
      setError("Please select a product before ordering.")
      return;
    }

    // very basic form validation 
    // todo: make these field-level errors in the future
    if(name.length < 2) {
      setError("Please provide a valid name.");
      return;
    }
    if(!validEmailAddress(email)){
      setError("Please provide a valid email address.");
      return;
    }

    // fixme: hardcoding the currency for development/testing
    const requestData = { 
      description: props.description, 
      price: props.price, 
      currency: 'USD',
      name: name,
      email: email
    };

    let clientSecret;
    try {
      const response = await axios.post("http://localhost:4242/create-payment-intent", requestData);
      clientSecret = response.data.clientSecret;
    } catch(error) {
      const errorMessage = error.response.data.error;
      console.log(errorMessage);
      setError("Server error. Please retry again later.");
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
            name: name
        },
      }
    });

    if (result.error) {
      console.log(result.error.message);
      setError(result.error.message);
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        updateFormOnSuccess();
      }
    }
  };

  return (
    <div className="CheckoutForm">
      <form onSubmit={handleSubmit} id="card-form">
          <label>Name:
            <input type="text" value={name} onChange={handleNameChange}/>
          </label>
          <label>Email Address:
            <input type="text" value={email} onChange={handleEmailChange}/>
          </label>
          <label>Purchase total: ${props.price}</label>
          <CardSection />
          <span className="Error" id="card-form-error"></span>
          <button disabled={!stripe}>Place order</button>
      </form>
      <span className="Success" id="card-success"></span>
      <button className = "BuyAnother" id="buy-another" onClick={handleReset}>Buy one more?</button>
    </div>
  );
}