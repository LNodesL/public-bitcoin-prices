// import value from 'coingecko-bitcoin';
import value from './index.js';
const targetPrice = await value();
console.log("CoinGecko Price: ", targetPrice);