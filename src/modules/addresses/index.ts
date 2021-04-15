import { decode, fromWords } from 'bech32';

import type { BinanceSdkContext } from '../context';
import { baseLogger } from '../logger';

const logger = baseLogger.extend('address-binance');

export const isAddressValid = ({
  context,
  address,
}: {
  context: Pick<BinanceSdkContext, 'mode'>;
  address: string;
}): boolean => {
  const prefix = context.mode === 'production' ? 'bnb' : 'tbnb';

  try {
    if (!address.startsWith(prefix)) {
      return false;
    }

    const decodedAddress = decode(address);
    const decodedAddressLength = Buffer.from(fromWords(decodedAddress.words)).length;

    return decodedAddressLength === 20 && decodedAddress.prefix === prefix;
  } catch (e) {
    logger('isBinanceAddress() failed: %s', e.message);
    return false;
  }
};

export const decodeAddress = ({ address }: { address: string }): Buffer => {
  const decodeAddress = decode(address);
  return Buffer.from(fromWords(decodeAddress.words));
};
