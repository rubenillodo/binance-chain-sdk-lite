import bech32 from 'bech32';
import { enc, SHA256, RIPEMD160 } from 'crypto-js';

import type { BinanceSdkContext } from '../context';
import { buildEc } from '../elliptic';

export const getAddressFromPrivateKey = async ({
  privateKey,
  context,
}: {
  privateKey: string | Buffer;
  context: Pick<BinanceSdkContext, 'mode'>;
}): Promise<string> => {
  return getAddressFromPublicKey({
    publicKey: getPublicKeyFromPrivateKey({ privateKey }),
    context,
  });
};

export const getPublicKeyFromPrivateKey = ({
  privateKey,
}: {
  privateKey: string | Buffer;
}): Buffer => {
  const keypair = Buffer.isBuffer(privateKey)
    ? buildEc().keyFromPrivate(privateKey)
    : buildEc().keyFromPrivate(privateKey, 'hex');
  return Buffer.from(keypair.getPublic().encode('hex', false), 'hex');
};

const getAddressFromPublicKey = ({
  publicKey,
  context,
}: {
  publicKey: string | Buffer;
  context: Pick<BinanceSdkContext, 'mode'>;
}) => {
  const pubKey = Buffer.isBuffer(publicKey)
    ? buildEc().keyFromPublic(publicKey)
    : buildEc().keyFromPublic(publicKey, 'hex');
  const pubPoint = pubKey.getPublic();
  const compressed = pubPoint.encodeCompressed();
  const hexed = ab2hexstring(compressed);
  const hash = sha256ripemd160(hexed);
  return bech32.encode(
    context.mode === 'test' ? 'tbnb' : 'bnb',
    bech32.toWords(Buffer.isBuffer(hash) ? hash : Buffer.from(hash, 'hex')),
  );
};

const ab2hexstring = (arr: number[]) => {
  let result = '';
  for (let i = 0; i < arr.length; i++) {
    let str = arr[i].toString(16);
    str = str.length === 0 ? '00' : str.length === 1 ? '0' + str : str;
    result += str;
  }
  return result;
};

const sha256ripemd160 = (hex: string) => {
  if (hex.length % 2 !== 0) {
    throw new Error(`Invalid hex string length: "${hex}"`);
  }

  const hexEncoded = enc.Hex.parse(hex);
  const ProgramSha256 = SHA256(hexEncoded);
  return RIPEMD160(ProgramSha256).toString();
};
