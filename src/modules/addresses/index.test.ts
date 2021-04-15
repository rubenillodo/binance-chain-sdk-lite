import { BinanceSdkMode } from '../modes';

import { isAddressValid } from './';

type TestData = { address: string; expected: boolean; mode: BinanceSdkMode };

it.each<TestData>([
  { address: 'tb1q0fzppaflhcju7emf9sh5n5st3c47mwuczwxmt7', expected: false, mode: 'test' },
  { address: 'DummyAddress', expected: false, mode: 'test' },
  { address: '0x3F4341a0599f63F444B6f1e0c7C5cAf81b5843Cc', expected: false, mode: 'test' },
  { address: 'tbnb18y6ak4nvd7u89dsyu205jhwaguluxt9l7fklsz', expected: true, mode: 'test' },
  { address: 'tbnb18y6ak4nvd7u89dsyu205jhwaguluxt9l7fklsz', expected: false, mode: 'production' },
  { address: 'bnb1asnv2dvsd64z25n6u5mh2838kmghq3a7876htr', expected: false, mode: 'test' },
  { address: 'bnb1asnv2dvsd64z25n6u5mh2838kmghq3a7876htr', expected: true, mode: 'production' },
])('works for %O', ({ address, expected, mode }) => {
  expect(isAddressValid({ context: { mode }, address })).toBe(expected);
});
