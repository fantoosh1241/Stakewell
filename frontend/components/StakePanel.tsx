'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { STROOPS_PER_XLM, CONTRACT_STAKING } from '@/lib/contracts';
import { invokeContract, addressToScVal, i128ToScVal } from '@/lib/stellar';
import type { TxStatus } from './TxToast';

interface StakePanelProps {
  address: string;
  xlmBalance: number;
  onTxStatus: (status: TxStatus) => void;
  onSuccess: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

export function StakePanel({ address, xlmBalance, onTxStatus, onSuccess, signTransaction }: StakePanelProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const xlmAmount = parseFloat(amount || '0');
  const stroops = BigInt(Math.floor(xlmAmount * STROOPS_PER_XLM));

  // Validation
  const tooMuch = xlmAmount > xlmBalance;
  const tooLittle = xlmAmount > 0 && xlmAmount < 0.0000001;
  const isValid = xlmAmount > 0 && !tooMuch && !tooLittle;

  const handleStake = async () => {
    if (!isValid || isLoading) return;

    setIsLoading(true);
    onTxStatus({ state: 'pending', label: `Staking ${xlmAmount} XLM` });

    const result = await invokeContract(
      CONTRACT_STAKING,
      'stake',
      [addressToScVal(address), i128ToScVal(stroops)],
      address,
      signTransaction
    );

    setIsLoading(false);

    if (result.ok) {
      setAmount('');
      onTxStatus({ state: 'success', hash: result.hash, label: `Staked ${xlmAmount} XLM` });
      onSuccess();
    } else if (result.cancelled) {
      onTxStatus({ state: 'cancelled' });
    } else {
      let friendly = result.error;
      if (friendly.toLowerCase().includes('insufficient')) {
        friendly = 'Insufficient XLM balance. You need more XLM to stake this amount.';
      }
      onTxStatus({ state: 'error', message: friendly });
    }
  };

  const setPercent = (pct: number) => {
    const val = (xlmBalance * pct) / 100;
    // Keep a small amount for fees
    const adjusted = Math.max(0, val - (pct === 100 ? 1.5 : 0));
    setAmount(adjusted > 0 ? adjusted.toFixed(7) : '');
  };

  return (
    <div className="bg-white border border-border rounded-[16px] p-6 shadow-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand-indigo/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-brand-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="font-[700] text-[16px] text-content">Stake XLM</h2>
          <p className="text-[13px] text-content-muted">Lock XLM to start earning RWD instantly</p>
        </div>
      </div>

      {/* Balance display */}
      <div className="mb-5 p-4 rounded-[12px] bg-page border border-border">
        <div className="flex justify-between text-[13px] text-content-secondary mb-3 font-medium">
          <span>Available balance</span>
          <span className="font-bold text-content">{xlmBalance.toFixed(7)} XLM</span>
        </div>
        <div className="flex gap-2">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => setPercent(pct)}
              className="flex-1 text-[13px] py-1.5 rounded-lg bg-white border border-border hover:bg-page hover:border-brand-indigo/30
                text-content-secondary hover:text-brand-indigo transition-colors font-medium"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="relative mb-5">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-content-muted text-[15px] font-medium">XLM</span>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0000000"
          min="0"
          max={xlmBalance}
          step="0.0000001"
          className={`w-full bg-white border ${
            tooMuch ? 'border-error ring-1 ring-error/20' : 'border-border'
          } rounded-[12px] py-3 pl-14 pr-4 text-[15px] font-mono text-content placeholder:text-content-muted focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo/20 transition-all`}
        />
        {tooMuch && (
          <p className="absolute -bottom-5 left-0 text-[11px] text-error">
            Amount exceeds available balance
          </p>
        )}
      </div>

      <button
        onClick={handleStake}
        disabled={!isValid || isLoading}
        className={`w-full py-3.5 rounded-[12px] font-semibold text-[14px] transition-all duration-200
          ${isValid && !isLoading
            ? 'bg-brand-indigo hover:bg-brand-violet text-white shadow-sm'
            : 'bg-page text-content-muted cursor-not-allowed border border-border'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          'Confirm Stake'
        )}
      </button>
    </div>
  );
}
