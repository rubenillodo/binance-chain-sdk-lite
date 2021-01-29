import { Big } from 'big.js';

import type { BinanceSdkContext } from '../context';
import { AminoPrefix } from '../amino';

export type BinanceSdkSimpleTransfer = {
  addressSending: string;
  addressReceiving: string;
  amount: string;
  assetId: string;
  accountNumber: string;
  sequence: string;
  memo?: string;
};

export type BinanceSdkRawTransaction = {
  account_number: number;
  chain_id: string;
  memo: string;
  msg: {
    aminoPrefix: AminoPrefix.MsgSend;
    inputs: [{ address: string; coins: [{ amount: number; denom: string }] }];
    outputs: [{ address: string; coins: [{ amount: number; denom: string }] }];
  };
  sequence: number;
  source: 0;
};

export const createRawTransactionTransfer = async ({
  context,
  transaction,
}: {
  context: BinanceSdkContext;
  transaction: BinanceSdkSimpleTransfer;
}): Promise<BinanceSdkRawTransaction> => {
  const transfer = {
    denom: transaction.assetId,
    amount: +new Big(transaction.amount).times('1e8').toFixed(),
  };

  return {
    account_number: +transaction.accountNumber,
    chain_id: context.chainId,
    memo: transaction.memo || '',
    msg: {
      inputs: [{ address: transaction.addressSending, coins: [transfer] }],
      outputs: [{ address: transaction.addressReceiving, coins: [transfer] }],
      aminoPrefix: AminoPrefix.MsgSend,
    },
    sequence: +transaction.sequence,
    source: 0,
  };
};
