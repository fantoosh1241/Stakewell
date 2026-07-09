export function Sidebar() {
  return (
    <div className="w-[240px] h-screen bg-white border-r border-border flex flex-col shrink-0 hidden lg:flex">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-violet flex items-center justify-center mr-3">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          </svg>
        </div>
        <span className="font-bold text-content tracking-tight">Stakewell</span>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {/* Section */}
        <div className="text-[11px] uppercase tracking-[0.08em] font-bold text-content-muted mt-5 mb-2 px-3">
          Overview
        </div>
        <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-[#EEF0FF] text-brand-indigo font-semibold mb-1">
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[14px]">Dashboard</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-content-secondary hover:bg-page transition-colors mb-1">
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[14px]">Analytics</span>
        </button>

        {/* Section */}
        <div className="text-[11px] uppercase tracking-[0.08em] font-bold text-content-muted mt-5 mb-2 px-3">
          Staking
        </div>
        <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-content-secondary hover:bg-page transition-colors mb-1">
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[14px]">Stake Assets</span>
        </button>
        <button className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-content-secondary hover:bg-page transition-colors mb-1">
          <div className="flex items-center gap-3">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[14px]">History</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-brand-indigo text-white text-[10px] font-bold">12</span>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-center gap-3 w-full hover:bg-page p-2 rounded-xl transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-violet" />
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-content truncate">Admin User</div>
            <div className="text-[13px] text-content-muted truncate">admin@stakewell.io</div>
          </div>
          <svg className="w-4 h-4 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
