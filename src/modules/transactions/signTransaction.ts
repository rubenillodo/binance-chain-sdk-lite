import { SHA256, enc } from 'crypto-js';
import tinySecp256k1 from 'tiny-secp256k1';

import { getPublicKeyFromPrivateKey } from '../accounts';
import type { BinanceSdkContext } from '../context';
import { AminoPrefix, convertObjectToSignBytes, encodeNumber, marshalBinary } from '../amino';
import { buildEc } from '../elliptic';

import type { BinanceSdkRawTransaction } from './createRawTransactionTransfer';
import { decodeAddress } from '../addresses';

export const signTransaction = async ({
  context,
  privateKey,
  transaction,
}: {
  context: BinanceSdkContext;
  transaction: BinanceSdkRawTransaction;
  privateKey: string;
}): Promise<string> => {
  const signature = generateSignature({
    privateKey,
    data: convertObjectToSignBytes({
      account_number: `${transaction.account_number}`,
      chain_id: context.chainId,
      data: null,
      memo: transaction.memo,
      msgs: [{ inputs: transaction.msg.inputs, outputs: transaction.msg.outputs }],
      sequence: `${transaction.sequence}`,
      source: `${transaction.source}`,
    }),
  });

  return marshalBinary({
    msg: [
      {
        ...transaction.msg,
        inputs: transaction.msg.inputs.map((it) => ({ ...it, address: decodeAddress(it) })),
        outputs: transaction.msg.outputs.map((it) => ({ ...it, address: decodeAddress(it) })),
      },
    ],
    signatures: [
      {
        pub_key: serializePubKey({ publicKey: getPublicKeyFromPrivateKey({ privateKey }) }),
        signature,
        account_number: transaction.account_number,
        sequence: transaction.sequence,
      },
    ],
    memo: transaction.memo,
    source: transaction.source,
    data: '',
    aminoPrefix: AminoPrefix.StdTx,
  }).toString('hex');
};

const serializePubKey = ({ publicKey: publicKeyParam }: { publicKey: string | Buffer }) => {
  const unencodedPubKey = (Buffer.isBuffer(publicKeyParam)
    ? buildEc().keyFromPublic(publicKeyParam)
    : buildEc().keyFromPublic(publicKeyParam, 'hex')
  ).getPublic();

  let format = 0x2;
  const y = unencodedPubKey.getY();
  const x = unencodedPubKey.getX();
  if (y && y.isOdd()) {
    format |= 0x1;
  }

  let pubBz = Buffer.concat([encodeNumber(format), x.toArrayLike(Buffer, 'be', 32)]);
  // prefixed with length
  pubBz = Buffer.concat([encodeNumber(pubBz.length), pubBz]);
  // add the amino prefix
  pubBz = Buffer.concat([Buffer.from(AminoPrefix.PubKeySecp256k1, 'hex'), pubBz]);

  return pubBz;
};

const generateSignature = ({
  data: dataParam,
  privateKey: privateKeyParam,
}: {
  data: string | Buffer;
  privateKey: string | Buffer;
}): Buffer => {
  const data = Buffer.isBuffer(dataParam) ? dataParam.toString('hex') : dataParam;
  const privateKey = Buffer.isBuffer(privateKeyParam)
    ? privateKeyParam
    : Buffer.from(privateKeyParam, 'hex');

  const msgHash = SHA256(enc.Hex.parse(data)).toString();
  const msgHashHex = Buffer.from(msgHash, 'hex');
  return tinySecp256k1.sign(msgHashHex, privateKey);
};
