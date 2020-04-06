import React, { useState } from 'react';
import axios from 'axios';
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';

import CardSection from './CardSection';

require("dotenv").config({ path: "./.env" });

export default function CheckoutForm(props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const setError = (message) => {
    document.getElementById('card-form-error').innerHTML = message;
    // any time an error is triggered, order processing stops
    setProcessingOrder(false);
  }

  const setSuccess = (message) => {
    document.getElementById('card-success').innerHTML = message;
  }

  const updateFormOnSuccess = (orderId) => {
    var form = document.getElementById("card-form");
    form.style.display = "none";
    setSuccess("Thank you for your purchase! Your order ID is: " + orderId);

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
  const validEmailAddress = (inputText) => {
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

  const validFormInputs = () => {
    if(!props.description) {
      setError("Please select a product before ordering.")
    }
    // todo: make these field-level errors in the future
    else if(name.length < 2) {
      setError("Please provide a valid name.");
    }
    else if(!validEmailAddress(email)){
      setError("Please provide a valid email address.");
    }
    else {
      return true;
    }
    return false;
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

    if(validFormInputs()) {
      // indicate that order processing has begun
      setProcessingOrder(true);
    }
    else {
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

    // contact the server and create the payment intent
    let clientSecret, orderId;
    try {
      const baseURL = process.env.REACT_APP_SERVER_URL;
      const response = await axios.post(new URL("create-payment-intent", baseURL), requestData);
      clientSecret = response.data.clientSecret;
      orderId = response.data.orderId;
    } catch(error) {
      const errorMessage = error.response ? error.response.data.error : error;
      console.log(errorMessage);
      setError("Server error. Please retry again later.");
      return;
    }

    // confirm the card payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
            name: name,
            email: email
        },
        metadata: {
          orderId: orderId
        }
      }
    });

    // handle card payment success/errors
    if (result.error) {
      console.log(result.error.message);
      setError(result.error.message);
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        updateFormOnSuccess(orderId);
      }
    }
  };

  return (
    <div>
      <div className="CheckoutForm" id="card-form">
        <div>
          <h2>Purchase total: ${props.price} USD</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="TextInputGroup">
            <div className="TextInputGroupItem">
              <label>Name:
                <input type="text" value={name} className="TextInputField" onChange={handleNameChange}/>
              </label>
            </div>
            <div className="TextInputGroupItem">
              <label>Email Address:
                <input type="text" value={email} className="TextInputField" onChange={handleEmailChange}/>
              </label>
            </div>
          </div>
          <CardSection />
          <div className="Error">
            <span id="card-form-error"></span>
          </div>
          <button disabled={!stripe || processingOrder} className="OrderButton">Place order</button>
        </form>
      </div>
      <div className="Success">
        <span  id="card-success"></span>
      </div>
      <div>
        <button className="BuyAnotherButton" id="buy-another" onClick={handleReset}>Buy one more?</button>
      </div>
    </div>
  );
}