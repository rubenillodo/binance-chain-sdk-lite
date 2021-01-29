const MODES = ['test', 'production'] as const;
export type BinanceSdkMode = typeof MODES[number];

export const isBinanceSdkMode = (value: any): value is BinanceSdkMode => MODES.includes(value);
