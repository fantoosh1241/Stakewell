import { describe, it, expect } from 'vitest';
import { computeAccrual, formatXLM, formatRWD, txLink, contractLink, APY_BPS, SECONDS_PER_YEAR } from './contracts';

describe('computeAccrual', () => {
  it('returns just the checkpointed amount when no time has elapsed', () => {
    const nowSec = 1_700_000_000;
    const result = computeAccrual(1_000_000_000, nowSec, 42, nowSec * 1000);
    expect(result).toBeCloseTo(42, 6);
  });

  it('matches the on-chain formula after exactly one year at 12% APY', () => {
    const principalStroops = 100 * 10_000_000; // 100 XLM
    const checkpointSec = 1_700_000_000;
    const nowMs = (checkpointSec + SECONDS_PER_YEAR) * 1000;
    const result = computeAccrual(principalStroops, checkpointSec, 0, nowMs);
    const expected = (principalStroops * APY_BPS * SECONDS_PER_YEAR) / (10_000 * SECONDS_PER_YEAR);
    expect(result).toBeCloseTo(expected, 6);
    // 100 XLM * 12% = 12 XLM-equivalent of RWD, in stroops
    expect(result).toBeCloseTo(12 * 10_000_000, 2);
  });

  it('never goes negative when checkpoint is in the future (clock skew)', () => {
    const nowSec = 1_700_000_000;
    const result = computeAccrual(1_000_000_000, nowSec + 100, 5, nowSec * 1000);
    expect(result).toBe(5);
  });
});

describe('formatXLM / formatRWD', () => {
  it('converts stroops to XLM with fixed decimals', () => {
    expect(formatXLM(10_000_000)).toBe('1.0000');
    expect(formatXLM(15_000_000, 2)).toBe('1.50');
  });

  it('converts stroops to RWD with fixed decimals', () => {
    expect(formatRWD(10_000_000)).toBe('1.000000');
  });
});

describe('explorer link helpers', () => {
  it('builds a Stellar Expert tx link', () => {
    expect(txLink('abc123')).toBe('https://stellar.expert/explorer/testnet/tx/abc123');
  });

  it('builds a Stellar Expert contract link', () => {
    expect(contractLink('CABC')).toBe('https://stellar.expert/explorer/testnet/contract/CABC');
  });
});
