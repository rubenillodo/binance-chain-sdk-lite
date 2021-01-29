import { config } from 'dotenv';

import { getAccountDetails, getAddressFromPrivateKey } from '../accounts';
import { buildContext } from '../context';

import { createRawTransactionTransfer } from './createRawTransactionTransfer';
import { signTransaction } from './signTransaction';

config();

it('signs a transaction correctly', async () => {
  expect.assertions(1);

  const privateKey = process.env.TEST_ACCOUNT_PRIVATE_KEY || '';
  if (!privateKey) {
    throw new Error(`TEST_ACCOUNT_PRIVATE_KEY was not set`);
  }

  const context = await buildContext({ mode: 'test' });
  const addressSending = await getAddressFromPrivateKey({ context, privateKey });
  const account = await getAccountDetails({ context, address: addressSending });
  if (!account.accountNumber) {
    throw new Error(`No account number for "${addressSending}"`);
  }

  const transaction = await createRawTransactionTransfer({
    context,
    transaction: {
      accountNumber: account.accountNumber as any,
      addressReceiving: 'tbnb1qca3vpea0dgcq4c694j0g4fyhmpgtkng4fxxx5',
      addressSending,
      amount: '0.1',
      assetId: 'BUSD-BAF',
      sequence: account.sequence,
      memo: 'thememo',
    },
  });

  return expect(signTransaction({ context, privateKey, transaction })).resolves.toBe(
    'd501f0625dee0a562a2c87fa0a270a141ef79611ccd756ced6affe7b2bc3003bc31fa25b120f0a08425553442d4241461080ade20412270a14063b16073d7b5180571a2d64f45524bec285da68120f0a08425553442d4241461080ade204126e0a26eb5ae9872103835ea0c084da592d4b5c9e32b67df322ac352e259f78de8ab2cfdb58edce082a124009236103fd05fbd9bed1236ee093ae3ee27a2733de7f10444210c39b3e14114e10bd4239d6508f855d9f362927c5deeb14e7eedfccef6d1507dffade7b12cb2318a2f5011a077468656d656d6f',
  );
});
