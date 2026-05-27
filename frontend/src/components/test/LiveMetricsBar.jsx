import useTestStore from '../../store/testStore.js';
import { formatLatency, formatRps } from '../../utils/formatters.js';

const Metric = ({ label, value }) => (
  <div className="text-center">
    <p className="text-xl font-bold" style={{ color: '#e2e8f0' }}>
      {value}
    </p>
    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
      {label}
    </p>
  </div>
);

const LiveMetricsBar = () => {
  const liveMetrics = useTestStore((s) => s.liveMetrics);
  const progress = useTestStore((s) => s.progress);

  if (!liveMetrics) return null;

  return (
    <div className="rounded-xl p-4" style={{ background: '#1e2130', border: '1px solid #2e3148' }}>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1" style={{ color: '#94a3b8' }}>
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#252836' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366f1, #818cf8)',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Metric label="P50" value={formatLatency(liveMetrics.p50)} />
        <Metric label="P95" value={formatLatency(liveMetrics.p95)} />
        <Metric label="RPS" value={formatRps(liveMetrics.requestsPerSecond)} />
        <Metric
          label="Errors"
          value={`${liveMetrics.failed ?? 0} / ${liveMetrics.total ?? 0}`}
        />
      </div>
    </div>
  );
};

export default LiveMetricsBar;
