import getBitcoin from 'nodes-get-bitcoin';

async function value() {
  const result = await getBitcoin();
  const { prices } = result;
  const target = prices.find(p => p.name === 'CoinGecko');
  if (!target) {
    throw new Error('CoinGecko price not found');
  }
  return String(target.price);
}

export default value;
export { value };
