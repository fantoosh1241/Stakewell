'use client';

import { useState, useEffect } from 'react';
import { STROOPS_PER_XLM, CONTRACT_STAKING, CONTRACT_REWARDS, CONTRACT_TOKEN, NETWORK_PASSPHRASE, computeAccrual } from '@/lib/contracts';
import { invokeContract, addressToScVal, i128ToScVal } from '@/lib/stellar';
import { addRwdTokenToWallet } from '@/lib/wallet';
import type { TxStatus } from './TxToast';

interface DashboardProps {
  address: string;
  stakedStroops: number;
  accruedUnclaimedStroops: number;
  onTxStatus: (status: TxStatus) => void;
  onSuccess: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

export function Dashboard({
  address,
  stakedStroops,
  accruedUnclaimedStroops,
  onTxStatus,
  onSuccess,
  signTransaction,
}: DashboardProps) {
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [unstakeLoading, setUnstakeLoading] = useState(false);
  const [addingToken, setAddingToken] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  // Timestamp (client clock) of the moment `accruedUnclaimedStroops` was last
  // polled from the chain — `accrued_rewards()` on-chain is already a live
  // value as of that poll, so the ticker only needs to add elapsed time since
  // then, not since the contract's own checkpoint (that's baked in already).
  const [polledAtMs, setPolledAtMs] = useState(() => Date.now());

  useEffect(() => {
    setPolledAtMs(Date.now());
  }, [accruedUnclaimedStroops, stakedStroops]);

  // Live rewards ticker: re-render every second so the accrued RWD figure
  // increments smoothly between the ~7s SWR polls of the on-chain value.
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const liveAccruedStroops = computeAccrual(
    stakedStroops,
    polledAtMs / 1000,
    accruedUnclaimedStroops,
    nowMs
  );

  const handleAddToken = async () => {
    if (addingToken) return;
    setAddingToken(true);
    onTxStatus({ state: 'pending', label: 'Adding RWD token to wallet' });

    const result = await addRwdTokenToWallet(CONTRACT_TOKEN, NETWORK_PASSPHRASE);
    setAddingToken(false);

    if (result.success) {
      onTxStatus({ state: 'success', hash: '', label: 'RWD token successfully added to wallet!' });
      setTimeout(() => onSuccess(), 4000);
    } else {
      onTxStatus({ state: 'error', message: result.error || 'Failed to add token.' });
    }
  };

  const stakedXLM = stakedStroops / STROOPS_PER_XLM;
  const unstakeXLM = parseFloat(unstakeAmount || '0');
  const unstakeStroops = BigInt(Math.floor(unstakeXLM * STROOPS_PER_XLM));

  const unstakeTooMuch = unstakeXLM > stakedXLM;
  const unstakeValid = unstakeXLM > 0 && !unstakeTooMuch;

  const handleClaim = async () => {
    if (claimLoading) return;
    setClaimLoading(true);
    onTxStatus({ state: 'pending', label: 'Claiming RWD rewards' });

    const result = await invokeContract(
      CONTRACT_REWARDS,
      'claim_rewards',
      [addressToScVal(address)],
      address,
      signTransaction
    );

    setClaimLoading(false);
    if (result.ok) {
      onTxStatus({ state: 'success', hash: result.hash, label: 'Rewards claimed' });
      onSuccess();
    } else if (result.cancelled) {
      onTxStatus({ state: 'cancelled' });
    } else {
      onTxStatus({ state: 'error', message: result.error });
    }
  };

  const handleUnstake = async () => {
    if (!unstakeValid || unstakeLoading) return;
    setUnstakeLoading(true);
    onTxStatus({ state: 'pending', label: `Unstaking ${unstakeXLM.toFixed(4)} XLM` });

    const result = await invokeContract(
      CONTRACT_STAKING,
      'unstake',
      [addressToScVal(address), i128ToScVal(unstakeStroops)],
      address,
      signTransaction
    );

    setUnstakeLoading(false);
    if (result.ok) {
      setUnstakeAmount('');
      onTxStatus({ state: 'success', hash: result.hash, label: `Unstaked ${unstakeXLM.toFixed(4)} XLM` });
      onSuccess();
    } else if (result.cancelled) {
      onTxStatus({ state: 'cancelled' });
    } else {
      let msg = result.error;
      if (msg.toLowerCase().includes('more than staked')) {
        msg = `You can only unstake up to ${stakedXLM.toFixed(4)} XLM (your current principal).`;
      }
      onTxStatus({ state: 'error', message: msg });
    }
  };

  return (
    <div className="space-y-6">
      {/* Rewards & Claiming */}
      <div className="bg-white border border-border rounded-[16px] p-6 shadow-card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-[16px] font-[700] text-content flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Rewards Management
            </h3>
            <p className="text-[13px] text-content-muted mt-1">Claim your accrued RWD tokens or add the asset to your wallet.</p>
          </div>
          <div className="px-3 py-1 rounded-[8px] bg-page border border-border">
            <div className="text-[11px] uppercase tracking-wide font-bold text-content-muted">Accrued</div>
            <div className="text-[15px] font-bold text-brand-indigo tabular-nums">
              {(liveAccruedStroops / 1e7).toFixed(4)} RWD
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleClaim}
            disabled={claimLoading}
            className="flex-1 py-3 bg-brand-indigo hover:bg-brand-violet text-white font-semibold rounded-[12px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {claimLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {claimLoading ? 'Claiming...' : 'Claim RWD'}
          </button>
          
          <button
            onClick={handleAddToken}
            disabled={addingToken}
            className="flex-1 py-3 bg-white border border-border hover:bg-page text-content font-semibold rounded-[12px] transition-colors disabled:opacity-50"
          >
            {addingToken ? 'Adding...' : 'Add RWD to Wallet'}
          </button>
        </div>
      </div>

      {/* Unstake Panel */}
      <div className="bg-white border border-border rounded-[16px] p-6 shadow-card">
        <h3 className="text-[16px] font-[700] text-content mb-1 flex items-center gap-2">
          <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          Unstake XLM
        </h3>
        <p className="text-[13px] text-content-muted mb-5">
          Rewards are settled automatically before unstaking. You have {stakedXLM.toFixed(4)} XLM staked.
        </p>

        <div className="flex gap-2 relative mb-1">
          <div className="relative flex-1">
             <input
              type="number"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              placeholder={`Max: ${stakedXLM.toFixed(4)}`}
              min="0"
              max={stakedXLM}
              step="0.0000001"
              className={`w-full bg-white border ${
                unstakeTooMuch ? 'border-error ring-1 ring-error/20' : 'border-border'
              } rounded-[12px] py-3 px-4 text-[15px] font-mono text-content placeholder:text-content-muted focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo/20 transition-all`}
            />
            <button
              onClick={() => setUnstakeAmount(stakedXLM.toFixed(7))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold uppercase tracking-wider text-brand-indigo hover:text-brand-violet bg-brand-indigo/10 px-2 py-1 rounded"
            >
              Max
            </button>
          </div>

          <button
            onClick={handleUnstake}
            disabled={!unstakeValid || unstakeLoading}
            className={`px-5 py-3 rounded-[12px] font-semibold text-[14px] transition-all
              ${unstakeValid && !unstakeLoading
                ? 'bg-warning hover:bg-[#D97A07] text-white shadow-sm'
                : 'bg-page text-content-muted cursor-not-allowed border border-border'
              }`}
          >
            {unstakeLoading ? (
               <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block align-middle" />
            ) : 'Unstake'}
          </button>
        </div>
        
        {unstakeTooMuch && (
          <p className="text-[11px] text-error mt-1">
            Cannot unstake more than your active principal ({stakedXLM.toFixed(4)} XLM).
          </p>
        )}
      </div>
    </div>
  );
}
