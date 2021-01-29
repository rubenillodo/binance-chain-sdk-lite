import type { BinanceSdkContext } from '../context';
import { fetcher } from '../fetcher';

export const sendSignedTransaction = async ({
  context,
  signedTransaction,
}: {
  context: BinanceSdkContext;
  signedTransaction: string;
}): Promise<{ transactionHash: string }> => {
  const result = await fetcher<[{ hash: string }]>(`${context.server}/api/v1/broadcast?sync=true`, {
    method: 'POST',
    body: signedTransaction,
    headers: {
      'Content-Type': 'text/plain',
    },
  });

  return { transactionHash: result[0].hash };
};
