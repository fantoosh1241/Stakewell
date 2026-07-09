import { WalletButton, type WalletState } from './WalletButton';
import type { TxStatus } from './TxToast';

interface NavbarProps {
  wallet: WalletState;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onTxStatus: (s: TxStatus) => void;
}

export function Navbar({ wallet, onConnect, onDisconnect, onTxStatus }: NavbarProps) {
  return (
    <nav className="h-16 bg-white border-b border-border sticky top-0 z-30 flex items-center justify-between px-6 shrink-0">
      {/* Left: Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative flex items-center w-full h-10 bg-page rounded-[10px] px-3">
          <svg className="w-4 h-4 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search accounts, transactions..."
            className="bg-transparent w-full h-full px-2 text-[14px] text-content outline-none placeholder:text-content-muted"
          />
          <div className="hidden sm:flex items-center justify-center px-1.5 py-0.5 rounded border border-border text-[10px] text-content-muted bg-white shadow-sm font-medium">
            ⌘F
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button className="w-[38px] h-[38px] rounded-full hover:bg-page flex items-center justify-center text-content-secondary transition-colors">
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
        <button className="w-[38px] h-[38px] rounded-full hover:bg-page flex items-center justify-center text-content-secondary transition-colors relative">
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-error" />
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Wallet / User Block */}
        <div className="mr-2">
          <WalletButton state={wallet} onConnect={onConnect} onDisconnect={onDisconnect} onTxStatus={onTxStatus} />
        </div>
      </div>
    </nav>
  );
}
