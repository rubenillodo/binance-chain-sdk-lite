import { string as VarString } from 'protocol-buffers-encodings';

import { baseLogger } from '../../logger';

import { UVarInt } from './VarInt';

const typeToTyp3 = (type: any): 0 | 1 | 2 => {
  if (typeof type === 'boolean') {
    return 0;
  }

  if (typeof type === 'number') {
    if (Number.isInteger(type)) {
      return 0;
    } else {
      return 1;
    }
  }

  if (typeof type === 'string' || Array.isArray(type) || typeof type === 'object') {
    return 2;
  }

  throw new Error(`Invalid type "${type}"`); // Is this what's expected?
};

const sortObject = (obj: any): any => {
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  // arrays have typeof "object" in js!
  if (Array.isArray(obj)) return obj.map(sortObject);
  const sortedKeys = Object.keys(obj).sort();
  const result: any = {};
  sortedKeys.forEach((key) => {
    result[key] = sortObject(obj[key]);
  });
  return result;
};

export const encodeNumber = (num: number) => UVarInt.encode(num);

export const encodeBool = (b: boolean) => (b ? UVarInt.encode(1) : UVarInt.encode(0));

export const encodeString = (str: string) => {
  const buf = Buffer.alloc(VarString.encodingLength(str));
  return VarString.encode(str, buf, 0);
};

export const encodeTime = (value: string | Date) => {
  const millis = new Date(value).getTime();
  const seconds = Math.floor(millis / 1000);
  const nanos = Number(seconds.toString().padEnd(9, '0'));

  const buffer = Buffer.alloc(14);

  // buffer[0] = (1 << 3) | 1 // field 1, typ3 1
  buffer.writeInt32LE((1 << 3) | 1, 0);
  buffer.writeUInt32LE(seconds, 1);

  // buffer[9] = (2 << 3) | 5 // field 2, typ3 5
  buffer.writeInt32LE((2 << 3) | 5, 9);
  buffer.writeUInt32LE(nanos, 10);

  return buffer;
};

export const convertObjectToSignBytes = (obj: any) => {
  baseLogger.extend('convertObjectToSignBytes')('Called with: %j', obj);
  return Buffer.from(JSON.stringify(sortObject(obj)));
};

export const marshalBinary = (obj: any) => {
  if (typeof obj !== 'object') throw new TypeError('data must be an object');
  return encodeBinary(obj, -1, true).toString('hex');
};

export const marshalBinaryBare = (obj: any) => {
  if (typeof obj !== 'object') throw new TypeError('data must be an object');
  return encodeBinary(obj).toString('hex');
};

export const encodeBinary = (val: any, fieldNum?: number, isByteLenPrefix?: boolean) => {
  if (val === null || val === undefined) throw new TypeError('unsupported type');

  if (Buffer.isBuffer(val)) {
    if (isByteLenPrefix) {
      return Buffer.concat([UVarInt.encode(val.length), val]);
    }
    return val;
  }

  if (Array.isArray(val)) {
    return encodeArrayBinary(fieldNum, val, isByteLenPrefix);
  }

  if (typeof val === 'number') {
    return encodeNumber(val);
  }

  if (typeof val === 'boolean') {
    return encodeBool(val);
  }

  if (typeof val === 'string') {
    return encodeString(val);
  }

  if (typeof val === 'object') {
    return encodeObjectBinary(val, isByteLenPrefix);
  }

  return;
};

export const encodeBinaryByteArray = (bytes: Buffer) => {
  const lenPrefix = bytes.length;
  return Buffer.concat([UVarInt.encode(lenPrefix), bytes]);
};

export const encodeObjectBinary = (obj: any, isByteLenPrefix?: boolean) => {
  const bufferArr: any[] = [];

  Object.keys(obj).forEach((key, index) => {
    if (key === 'aminoPrefix' || key === 'version') return;

    if (isDefaultValue(obj[key])) return;

    if (Array.isArray(obj[key]) && obj[key].length > 0) {
      bufferArr.push(encodeArrayBinary(index, obj[key]));
    } else {
      bufferArr.push(encodeTypeAndField(index, obj[key]));
      bufferArr.push(encodeBinary(obj[key], index, true));
    }
  });

  let bytes = Buffer.concat(bufferArr);

  // add prefix
  if (obj.aminoPrefix) {
    const prefix = Buffer.from(obj.aminoPrefix, 'hex');
    bytes = Buffer.concat([prefix, bytes]);
  }

  // Write byte-length prefixed.
  if (isByteLenPrefix) {
    const lenBytes = UVarInt.encode(bytes.length);
    bytes = Buffer.concat([lenBytes, bytes]);
  }

  return bytes;
};

export const encodeArrayBinary = (
  fieldNum: number | undefined,
  arr: any[],
  isByteLenPrefix?: boolean,
) => {
  const result: any[] = [];

  arr.forEach((item) => {
    result.push(encodeTypeAndField(fieldNum, item));

    if (isDefaultValue(item)) {
      result.push(Buffer.from('00', 'hex'));
      return;
    }

    result.push(encodeBinary(item, fieldNum, true));
  });

  //encode length
  if (isByteLenPrefix) {
    const length = result.reduce((prev, item) => prev + item.length, 0);
    result.unshift(UVarInt.encode(length));
  }

  return Buffer.concat(result);
};

// Write field key.
const encodeTypeAndField = (index: number | undefined, field: any) => {
  index = Number(index);
  const value = ((index + 1) << 3) | typeToTyp3(field);
  return UVarInt.encode(value);
};

const isDefaultValue = (obj: any) => {
  if (obj === null) return false;

  return (
    (typeof obj === 'number' && obj === 0) ||
    (typeof obj === 'string' && obj === '') ||
    (Array.isArray(obj) && obj.length === 0) ||
    (typeof obj === 'boolean' && !obj)
  );
};
