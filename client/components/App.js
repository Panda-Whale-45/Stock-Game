import React, { useState, useEffect } from 'react';
import Portfolio from './Portfolio';
import OrderTicket from './OrderTicket';

export default function App() {
  return (
    <>
      <div className='row'>
        <img height={100} src={'https://factanimal.com/wp-content/uploads/2022/03/red-lipped-batfish-facts.jpg'} />
        <h1>Trading Simulator</h1>
      </div>
      <br/>
      <div className='row2'>
        <OrderTicket />
        <Portfolio />
      </div>
    </>
  );
}
