import { buildContext } from '../context';

import { createRawTransactionTransfer } from './createRawTransactionTransfer';

it('creates a transaction object correctly', async () => {
  expect.assertions(1);

  const context = await buildContext({ mode: 'test' });
  const transaction = await createRawTransactionTransfer({
    context,
    transaction: {
      accountNumber: '1',
      addressReceiving: 'tbnb1qca3vpea0dgcq4c694j0g4fyhmpgtkng4fxxx5',
      addressSending: 'tbnb1qca3vpea0dgcq4c694j0g4fyhmpgtkng4fxxx5',
      amount: '0.1',
      assetId: 'BUSD-BAF',
      sequence: '0',
      memo: 'thememo',
    },
  });

  expect(transaction).toMatchObject({
    account_number: 1,
    chain_id: 'Binance-Chain-Ganges',
    memo: 'thememo',
    msg: {
      aminoPrefix: '2A2C87FA',
      inputs: [
        {
          address: 'tbnb1qca3vpea0dgcq4c694j0g4fyhmpgtkng4fxxx5',
          coins: [{ amount: 10000000, denom: 'BUSD-BAF' }],
        },
      ],
      outputs: [
        {
          address: 'tbnb1qca3vpea0dgcq4c694j0g4fyhmpgtkng4fxxx5',
          coins: [{ amount: 10000000, denom: 'BUSD-BAF' }],
        },
      ],
    },
    sequence: 0,
    source: 0,
  });
});

it('orders transaction object properties correctly', async () => {
  expect.assertions(4);

  const context = await buildContext({ mode: 'test' });
  const transaction = await createRawTransactionTransfer({
    context,
    transaction: {
      accountNumber: '1',
      addressReceiving: 'tbnb1qca3vpea0dgcq4c694j0g4fyhmpgtkng4fxxx5',
      addressSending: 'tbnb1qca3vpea0dgcq4c694j0g4fyhmpgtkng4fxxx5',
      amount: '0.1',
      assetId: 'BUSD-BAF',
      sequence: '0',
      memo: 'thememo',
    },
  });

  expect(Object.keys(transaction)).toEqual([
    'account_number',
    'chain_id',
    'memo',
    'msg',
    'sequence',
    'source',
  ]);
  expect(Object.keys(transaction.msg)).toEqual(['inputs', 'outputs', 'aminoPrefix']);
  expect(Object.keys(transaction.msg.inputs[0])).toEqual(['address', 'coins']);
  expect(Object.keys(transaction.msg.inputs[0].coins[0])).toEqual(['denom', 'amount']);
});
