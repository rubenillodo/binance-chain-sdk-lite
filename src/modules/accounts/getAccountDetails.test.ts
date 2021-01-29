import { buildContext } from '../context';

import { getAccountDetails } from './getAccountDetails';

it('gets account details for address holding some tokens', async () => {
  expect.assertions(1);

  const context = await buildContext({ mode: 'test' });
  return expect(
    getAccountDetails({ address: 'tbnb1qca3vpea0dgcq4c694j0g4fyhmpgtkng4fxxx5', context }),
  ).resolves.toMatchObject({
    accountNumber: '31372',
    sequence: expect.stringMatching(/[0-9]+/),
    balances: expect.arrayContaining([
      expect.objectContaining({ assetId: 'BUSD-BAF', amountFree: expect.any(String) }),
    ]),
  });
});

it('returns successfully for valid unused addresses that cause a 404 from the Binance API', async () => {
  expect.assertions(1);

  const context = await buildContext({ mode: 'test' });
  return expect(
    getAccountDetails({ address: 'tbnb1f6er954qs3lm2a6ejemsssd56r9kznk4uweugl', context }),
  ).resolves.toMatchObject({
    accountNumber: null,
    sequence: '0',
    balances: [],
  });
});
