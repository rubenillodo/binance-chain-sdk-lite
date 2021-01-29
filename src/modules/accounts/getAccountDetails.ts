import { Big } from 'big.js';

import { BinanceSdkContext } from '../context';
import { fetcher } from '../fetcher';

export const getAccountDetails = async ({
  address,
  context,
}: {
  address: string;
  context: BinanceSdkContext;
}): Promise<{
  accountNumber: string | null;
  sequence: string;
  balances: Array<{ assetId: string; amountFree: string }>;
}> => {
  try {
    const result = await fetcher<{
      account_number: number;
      sequence: number;
      balances: Array<{ symbol: string; free: string }>;
    }>(`${context.server}/api/v1/account/${address}`);

    return {
      accountNumber: `${result.account_number}`,
      sequence: `${result.sequence}`,
      balances: result.balances.map((it) => ({
        assetId: it.symbol,
        amountFree: new Big(it.free || 0).toFixed(),
      })),
    };
  } catch (e) {
    if (!/404: account not found/.test(e?.message || '')) {
      throw e;
    }

    return {
      accountNumber: null,
      sequence: '0',
      balances: [],
    };
  }
};
