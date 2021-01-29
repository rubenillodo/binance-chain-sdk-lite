import { ec as EC } from 'elliptic';

export const buildEc = () => new EC('secp256k1');
