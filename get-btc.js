#!/usr/bin/env node

/**
 * get-btc.js - Fetches Bitcoin current price average across trusted markets
 * Uses public APIs with no API key requirements (rate limited by IP)
 */

import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

// Trusted public APIs (no API key required, rate limited by IP)
const APIS = [
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    parser: (data) => data.bitcoin?.usd
  },
  {
    name: 'Binance',
    url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
    parser: (data) => parseFloat(data.price)
  },
  {
    name: 'Coinbase',
    url: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
    parser: (data) => parseFloat(data.data?.rates?.USD)
  },
  {
    name: 'CryptoCompare',
    url: 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD',
    parser: (data) => data.USD
  }
];

/**
 * Fetch data from a URL
 */
function fetch(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Fetch Bitcoin price from a single API
 */
async function fetchPrice(api) {
  try {
    const data = await fetch(api.url);
    const price = api.parser(data);
    
    if (price && !isNaN(price) && price > 0) {
      return { name: api.name, price, success: true };
    } else {
      return { name: api.name, error: 'Invalid price data', success: false };
    }
  } catch (error) {
    return { name: api.name, error: error.message, success: false };
  }
}

/**
 * Get Bitcoin price average across all trusted markets
 */
async function getBTCAverage() {
  // console.log('Fetching Bitcoin prices from trusted markets...\n');
  
  // Fetch from all APIs in parallel
  const results = await Promise.all(APIS.map(api => fetchPrice(api)));
  
  // Filter successful results only
  const successful = results.filter(r => r.success);
  
  // Check if we have any successful sources
  if (successful.length === 0) {
    // console.error('Error: Unable to fetch Bitcoin price. All sources are currently unavailable.');
    process.exit(1);
  }
  
  // Display only successful results
  // console.log('Successfully fetched prices:\n');
  successful.forEach(result => {
    // console.log(`✓ ${result.name}: $${result.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  });
  
  // console.log('');
  
  // Calculate average
  const prices = successful.map(r => r.price);
  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
  // Calculate statistics
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const spread = max - min;
  const spreadPercent = ((spread / average) * 100).toFixed(2);
  
//   // Display results
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//   console.log(`Average Price: $${average.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
//   console.log(`Sources: ${successful.length} market${successful.length !== 1 ? 's' : ''}`);
//   console.log(`Range: $${min.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - $${max.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
//   console.log(`Spread: $${spread.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${spreadPercent}%)`);
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return {
    average,
    min,
    max,
    spread,
    spreadPercent,
    sources: successful.length,
    totalSources: APIS.length,
    prices: successful.map(r => ({ name: r.name, price: r.price }))
  };
}

// Run if executed directly
if (isMainModule) {
  getBTCAverage()
    .then((result) => {
      // Exit with success
      process.exit(0);
    })
    .catch((error) => {
      // console.error('Fatal error:', error.message);
      process.exit(1);
    });
}

export { getBTCAverage, fetchPrice };
