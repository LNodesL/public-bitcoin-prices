// import value from 'cb-btc-value';
import value from './index.js';
const coinbasePrice = await value();
console.log("Coinbase Price: ", coinbasePrice);