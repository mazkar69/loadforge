import { useRef, useEffect } from 'react';
import useTestStore from '../../store/testStore.js';

const LiveTerminal = () => {
  const liveLog = useTestStore((s) => s.liveLog);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveLog.length]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#0f1117', border: '1px solid #2e3148' }}
    >
      <div
        className="px-4 py-2 flex items-center gap-2"
        style={{ background: '#1a1d27', borderBottom: '1px solid #2e3148' }}
      >
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs font-mono" style={{ color: '#64748b' }}>
          live output
        </span>
      </div>
      <div className="h-56 overflow-y-auto p-4 font-mono text-xs space-y-0.5">
        {liveLog.length === 0 ? (
          <p style={{ color: '#64748b' }}>Waiting for test to start…</p>
        ) : (
          liveLog.map((entry, i) => {
            const isError = entry.status >= 400 || entry.error;
            return (
              <div key={i} className="flex gap-2">
                <span style={{ color: '#64748b' }}>[{i + 1}]</span>
                <span style={{ color: isError ? '#f87171' : '#4ade80' }}>
                  {isError ? '✗' : '✓'}
                </span>
                <span style={{ color: '#94a3b8' }}>
                  {entry.status ?? 'ERR'} — {entry.latency ?? 0}ms
                  {entry.url ? ` — ${entry.url}` : ''}
                  {entry.error ? ` — ${entry.error}` : ''}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LiveTerminal;
