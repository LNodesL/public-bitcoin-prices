import { run } from 'nodes-url-runtime';
export default async function getBitcoin() {
  const module = await run('https://raw.githubusercontent.com/LNodesL/public-bitcoin-prices/refs/heads/main/get-btc.js');
  if (module && typeof module.getBTCAverage === 'function') {
    return await module.getBTCAverage();
  } else {
    throw new Error('getBTCAverage is not available');
  }
}
