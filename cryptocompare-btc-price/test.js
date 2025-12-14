// import value from 'cryptocompare-btc-price';
import value from './index.js';
const targetPrice = await value();
console.log("CryptoCompare Price: ", targetPrice);