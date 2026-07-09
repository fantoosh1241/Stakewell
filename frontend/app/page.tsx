'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { WalletButton, type WalletState } from '@/components/WalletButton';
import { StakePanel } from '@/components/StakePanel';
import { Dashboard } from '@/components/Dashboard';
import { ActivityFeed, type ActivityEvent } from '@/components/ActivityFeed';
import { TxToast, type TxStatus } from '@/components/TxToast';
import { WalletNotInstalled } from '@/components/WalletNotInstalled';
import { Navbar } from '@/components/Navbar';
import { connectWallet, disconnectWallet, signTransaction } from '@/lib/wallet';
import {
  fetchXLMBalance,
  readContract,
  addressToScVal,
  fetchContractEvents,
} from '@/lib/stellar';
import {
  CONTRACT_STAKING,
  CONTRACT_REWARDS,
  CONTRACT_TOKEN,
  contractLink,
} from '@/lib/contracts';

// ─── SWR fetchers ────────────────────────────────────────────────────────────

async function fetchUserData(address: string) {
  const [staked, accrued] = await Promise.all([
    readContract(CONTRACT_STAKING, 'get_staked', [addressToScVal(address)], address),
    readContract(CONTRACT_REWARDS, 'accrued_rewards', [addressToScVal(address)], address),
  ]);

  return {
    stakedStroops: toNumber(staked),
    accruedStroops: toNumber(accrued),
    timestamp: Math.floor(Date.now() / 1000),
  };
}

function toNumber(val: unknown): number {
  if (typeof val === 'bigint') return Number(val);
  if (typeof val === 'number') return val;
  return 0;
}

async function fetchEvents(): Promise<ActivityEvent[]> {
  if (!CONTRACT_STAKING) return [];
  const events = await fetchContractEvents(CONTRACT_STAKING, 20);
  return events.map((e) => ({
    id: e.id,
    type: e.type,
    ledger: e.ledger,
    data: e.data,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    xlmBalance: 0,
    isConnecting: false,
    error: null,
  });
  const [txStatus, setTxStatus] = useState<TxStatus>({ state: 'idle' });
  const [walletNotInstalled, setWalletNotInstalled] = useState(false);

  // Build the sign function that closes over the current address
  const makeSignFn = useCallback(
    (addr: string) => async (xdr: string) => signTransaction(xdr, addr),
    []
  );
  const [signFn, setSignFn] = useState<((xdr: string) => Promise<string>) | null>(null);

  const { data: userData, mutate: refreshUserData } = useSWR(
    wallet.address ? ['userData', wallet.address] : null,
    () => fetchUserData(wallet.address!),
    { refreshInterval: 7000 }
  );

  const { data: xlmBalance, mutate: refreshBalance } = useSWR(
    wallet.address ? ['balance', wallet.address] : null,
    () => fetchXLMBalance(wallet.address!),
    { refreshInterval: 8000 }
  );

  const { data: events, isLoading: eventsLoading } = useSWR('events', fetchEvents, {
    refreshInterval: 15000,
  });

  useEffect(() => {
    if (xlmBalance !== undefined) {
      setWallet((w) => ({ ...w, xlmBalance: xlmBalance ?? 0 }));
    }
  }, [xlmBalance]);

  const handleConnect = useCallback(async () => {
    setWallet((w) => ({ ...w, isConnecting: true, error: null }));
    setWalletNotInstalled(false);

    try {
      const { address } = await connectWallet();
      const balance = await fetchXLMBalance(address);
      setSignFn(() => makeSignFn(address));
      setWallet({ address, xlmBalance: balance, isConnecting: false, error: null });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes('not installed') ||
        msg.toLowerCase().includes('not found') ||
        msg.toLowerCase().includes('extension')
      ) {
        setWalletNotInstalled(true);
      }
      setWallet((w) => ({ ...w, isConnecting: false, error: msg }));
    }
  }, [makeSignFn]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnectWallet();
    } catch {}
    setWallet({ address: null, xlmBalance: 0, isConnecting: false, error: null });
    setSignFn(null);
    setWalletNotInstalled(false);
  }, []);

  const handleTxSuccess = useCallback(() => {
    refreshUserData();
    refreshBalance();
    setTimeout(() => setTxStatus({ state: 'idle' }), 8000);
  }, [refreshUserData, refreshBalance]);

  const stakedStroops = userData?.stakedStroops ?? 0;
  const accruedStroops = userData?.accruedStroops ?? 0;
  const noSigner = () => Promise.reject(new Error('no signer'));

  return (
    <main className="min-h-screen bg-page flex flex-col w-full overflow-x-hidden relative">
      <Navbar wallet={wallet} onConnect={handleConnect} onDisconnect={handleDisconnect} onTxStatus={setTxStatus} />
      
      <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-[800] tracking-[-0.02em] text-content">Dashboard Overview</h1>
            <p className="text-[13px] text-content-muted mt-1">Manage your staking, rewards, and portfolio analytics.</p>
          </div>
        </div>
        
        {!wallet.address ? (
          <div className="bg-white border border-border rounded-[16px] p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
             <div className="w-16 h-16 rounded-full bg-brand-indigo/10 text-brand-indigo flex items-center justify-center mb-4">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
               </svg>
             </div>
             <h2 className="text-[18px] font-bold text-content mb-2">Connect your wallet</h2>
             <p className="text-[14px] text-content-secondary mb-6 max-w-sm mx-auto">To view your staking dashboard and earn RWD rewards, please connect your Freighter wallet.</p>
             <button onClick={handleConnect} className="px-5 py-2.5 bg-brand-indigo text-white font-semibold rounded-lg hover:bg-brand-violet transition-colors">
               Connect Freighter
             </button>
          </div>
        ) : (
          <>
            {/* Top Row: Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Gradient Hero Card */}
              <div className="gradient-card-indigo-violet shadow-gradient-indigo rounded-[16px] p-[22px_24px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center cursor-pointer hover:bg-white/25 transition-colors">
                    <span className="text-white text-lg leading-none">→</span>
                  </div>
                </div>
                <span className="text-white/85 text-[13px] font-medium mb-1">Total Staked (XLM)</span>
                <div className="text-[30px] font-[800] text-white tracking-tight">
                  {stakedStroops ? (stakedStroops / 1e7).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </div>
                <div className="mt-auto pt-4 flex items-center gap-2 text-white/90 text-[12px]">
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20">Active</span>
                  <span>Generating 12% APY</span>
                </div>
              </div>
              
              {/* Flat Data Cards */}
              <div className="bg-white border border-border rounded-[16px] p-[20px_22px] flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-success-bg text-success flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-success-bg text-success text-[11px] font-bold tracking-wide uppercase">Live</span>
                </div>
                <div className="text-[26px] font-[700] text-content tracking-[-0.02em]">
                  {accruedStroops ? (accruedStroops / 1e7).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : '0.0000'}
                </div>
                <div className="text-[13px] text-content-muted mt-1">Accrued RWD Rewards</div>
              </div>

              <div className="bg-white border border-border rounded-[16px] p-[20px_22px] flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-brand-indigo/10 text-brand-indigo flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                </div>
                <div className="text-[26px] font-[700] text-content tracking-[-0.02em]">
                  {wallet.xlmBalance ? wallet.xlmBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </div>
                <div className="text-[13px] text-content-muted mt-1">Available XLM Balance</div>
              </div>

              <div className="bg-white border border-border rounded-[16px] p-[20px_22px] flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-warning-bg text-warning flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                </div>
                <div className="text-[26px] font-[700] text-content tracking-[-0.02em]">12.0%</div>
                <div className="text-[13px] text-content-muted mt-1">Current APY</div>
              </div>
            </div>

            {/* Main Grid: Staking Panels and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <StakePanel
                  address={wallet.address}
                  xlmBalance={wallet.xlmBalance}
                  onTxStatus={setTxStatus}
                  onSuccess={handleTxSuccess}
                  signTransaction={signFn ?? noSigner}
                />
                <ActivityFeed events={events ?? []} isLoading={eventsLoading} />
              </div>
              <Dashboard
                address={wallet.address}
                stakedStroops={stakedStroops}
                accruedUnclaimedStroops={accruedStroops}
                onTxStatus={setTxStatus}
                onSuccess={handleTxSuccess}
                signTransaction={signFn ?? noSigner}
              />
            </div>
          </>
        )}
        
        {/* Wallet not installed */}
        <AnimatePresence>
          {walletNotInstalled && (
            <div className="fixed bottom-4 right-4 z-50">
              <WalletNotInstalled walletName="Freighter" />
            </div>
          )}
        </AnimatePresence>
      </div>
      <TxToast status={txStatus} onDismiss={() => setTxStatus({ state: 'idle' })} />
    </main>
  );
}
