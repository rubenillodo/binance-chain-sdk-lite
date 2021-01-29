import {
  buildContext,
  createRawTransactionTransfer,
  getAccountDetails,
  getAddressFromPrivateKey,
  sendSignedTransaction,
  signTransaction,
} from 'binance-chain-sdk-lite';
import { config } from 'dotenv';

config();

const privateKey = process.env.TEST_ACCOUNT_PRIVATE_KEY || '';
if (!privateKey) {
  throw new Error(`TEST_ACCOUNT_PRIVATE_KEY was not set`);
}

(async () => {
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
      addressReceiving: 'tbnb1rmmevywv6atva440leajhscq80p3lgjmmd3yhp',
      addressSending,
      amount: '0.00000001',
      assetId: 'BUSD-BAF',
      sequence: account.sequence,
      memo: 'thememo',
    },
  });

  const signedTransaction = await signTransaction({ context, privateKey, transaction });
  try {
    const result = await sendSignedTransaction({ context, signedTransaction });
    console.log('Transaction sent: ', JSON.stringify(result));
  } catch (e) {
    console.error(e, 'Failed to send transaction');
  }
})();
