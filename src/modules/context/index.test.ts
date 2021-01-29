import { buildContext } from '.';

it('creates default test context', () => {
  return expect(buildContext({ mode: 'test' })).resolves.toMatchObject({
    mode: 'test',
    server: 'https://testnet-dex.binance.org',
    chainId: 'Binance-Chain-Ganges',
  });
});

it('creates default production context', () => {
  return expect(buildContext({ mode: 'production' })).resolves.toMatchObject({
    mode: 'production',
    server: 'https://dex.binance.org',
    chainId: 'Binance-Chain-Tigris',
  });
});
