import { fetcher } from '../fetcher';
import type { BinanceSdkMode } from '../modes';
import { isBinanceSdkMode } from '../modes';

export type BinanceSdkContext<M extends BinanceSdkMode = BinanceSdkMode> = {
  mode: M;
  server: string;
  chainId: string;
};

export const buildContext = async <M extends BinanceSdkMode>({
  mode,
}: {
  mode: M;
}): Promise<BinanceSdkContext<M>> => {
  if (!isBinanceSdkMode(mode)) {
    throw new Error(`Invalid Binance SDK mode: "${mode}"`);
  }

  const server = mode === 'test' ? 'https://testnet-dex.binance.org' : 'https://dex.binance.org';

  const {
    node_info: { network: chainId },
  } = await fetcher<{ node_info: { network: string } }>(`${server}/api/v1/node-info`);

  return { mode, server, chainId };
};
