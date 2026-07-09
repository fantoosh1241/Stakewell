'use client';

import { txLink } from '@/lib/contracts';

export interface ActivityEvent {
  id: string;
  type: 'staked' | 'unstaked' | 'rwdclaim' | string;
  ledger: number;
  data: unknown;
  hash?: string;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  isLoading: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  staked: { 
    label: 'Staked', 
    bg: 'bg-brand-indigo/10', 
    text: 'text-brand-indigo',
    icon: (
      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    )
  },
  unstaked: { 
    label: 'Unstaked', 
    bg: 'bg-warning/10', 
    text: 'text-[#D97A07]', // darker warning text for contrast
    icon: (
      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    )
  },
  rwdclaim: { 
    label: 'Claimed', 
    bg: 'bg-success/10', 
    text: 'text-[#0D8A52]', // darker success text for contrast
    icon: (
      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
};

export function ActivityFeed({ events, isLoading }: ActivityFeedProps) {
  return (
    <div className="bg-white border border-border rounded-[16px] shadow-card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border bg-page">
        <h3 className="text-[16px] font-[700] text-content flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Recent Activity
        </h3>
        {isLoading && (
          <span className="text-[12px] font-medium text-brand-indigo animate-pulse bg-brand-indigo/10 px-2 py-1 rounded">Updating...</span>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-page border-b border-border text-[12px] font-semibold text-content-muted uppercase tracking-wider">
              <th className="px-5 py-3 font-semibold">Action</th>
              <th className="px-5 py-3 font-semibold">Ledger</th>
              <th className="px-5 py-3 font-semibold text-right">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-[13px] text-content-muted">
                  No activity found. Stake XLM to see events here.
                </td>
              </tr>
            ) : (
              events.map((event) => {
                const cfg = TYPE_CONFIG[event.type] ?? { 
                  label: event.type, 
                  bg: 'bg-page', 
                  text: 'text-content',
                  icon: <span className="w-1.5 h-1.5 rounded-full bg-content mr-2" />
                };
                
                return (
                  <tr key={event.id} className="border-b border-border last:border-0 hover:bg-page/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ${cfg.bg} ${cfg.text}`}>
                        {cfg.icon}
                        {cfg.label}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-content font-medium">
                      #{event.ledger.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {event.hash ? (
                        <a
                          href={txLink(event.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[13px] font-mono font-medium text-brand-indigo hover:text-brand-violet transition-colors bg-brand-indigo/5 px-2 py-1 rounded"
                        >
                          {event.hash.slice(0, 8)}...
                          <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-[13px] text-content-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
