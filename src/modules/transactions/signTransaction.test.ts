import { config } from 'dotenv';

import { getAccountDetails, getAddressFromPrivateKey } from '../accounts';
import { buildContext } from '../context';

import { createRawTransactionTransfer } from './createRawTransactionTransfer';
import { signTransaction } from './signTransaction';

config();

it('', async () => {
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
    'db01f0625dee0a5c2a2c87fa0a2a0a14063b16073d7b5180571a2d64f45524bec285da6812120a0b5357494e4742592d3838381080ade204122a0a14063b16073d7b5180571a2d64f45524bec285da6812120a0b5357494e4742592d3838381080ade204126e0a26eb5ae98721034780ee19cac82b10847866a1e60bd5d648e96beecf85fb38406a7e197ff4ae4512406e81b5622cc361b3e1d8b24d687ede64ee8335cd74ce20631c69bd2a3d0a1169303532dedf4a8818fba272e1a04121a24486a17db7731f94b23c54e03d1524d3188cf5011a077468656d656d6f',
  );
});
