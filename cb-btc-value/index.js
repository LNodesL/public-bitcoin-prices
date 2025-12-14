import getBitcoin from 'nodes-get-bitcoin';

async function value() {
  const result = await getBitcoin();
  const { prices } = result;
  const coinbase = prices.find(p => p.name === 'Coinbase');
  if (!coinbase) {
    throw new Error('Coinbase price not found');
  }
  return String(coinbase.price);
}

export default value;
export { value };
