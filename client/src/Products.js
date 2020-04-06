import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Products(props) {
  const [products, setProducts] = useState([]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    axios.get("http://localhost:4242/products")
      .then(res => {
        setProducts(res.data);
      });
  },[]);

  const handleChange = async (event) => {
    const selected = products.find(object => object.description === event.target.value)
    let desc;
    let price;
    if(selected) {
      desc = selected.description;
      price = selected.price;
    }
    else {
      desc = '';
      price = 0;
    }

    setDescription(desc);
    props.onProductSelection(desc, price);
  };

  return (
    <div>
      <ul>
        { products ? products.map(item => 
          <li key={item.description}>{item.description} : ${item.price}</li>
        ) : ""}
      </ul>
      <form>
        <label>
          Select product:
        </label>
        <select value={description ? description : ''} onChange={handleChange}>
          <option value='' key='none'>Select a product</option>
          {products ? products.map(item => <option value={item.description} key={item.description}>{item.description}</option>) : null}
        </select>
      </form>
    </div>
  );
}