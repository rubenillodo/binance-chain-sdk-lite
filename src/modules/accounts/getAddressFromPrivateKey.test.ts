import type { BinanceSdkContext } from '../context';

import { getAddressFromPrivateKey } from './getAddressFromPrivateKey';

it.each<{ privateKey: string; context: Pick<BinanceSdkContext, 'mode'>; address: string }>([
  {
    privateKey: '7d66763ca585ffb90fa85702aca761690a6d81661ef78746c497d1679392109b',
    context: { mode: 'test' },
    address: 'tbnb1f6er954qs3lm2a6ejemsssd56r9kznk4uweugl',
  },
  {
    privateKey: '7d66763ca585ffb90fa85702aca761690a6d81661ef78746c497d1679392109b',
    context: { mode: 'production' },
    address: 'bnb1f6er954qs3lm2a6ejemsssd56r9kznk4jmscgw',
  },
])('gets address from private key', ({ privateKey, address, context }) => {
  return expect(getAddressFromPrivateKey({ privateKey, context })).resolves.toBe(address);
});
