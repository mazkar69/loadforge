import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const LatencyChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="p50" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="p95" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="p99" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="t" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}s`} />
      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}ms`} />
      <Tooltip
        contentStyle={{ background: '#1e2130', border: '1px solid #2e3148', borderRadius: 8 }}
        labelStyle={{ color: '#94a3b8' }}
        formatter={(v) => [`${v}ms`]}
      />
      <Legend />
      <Area type="monotone" dataKey="p50" stroke="#6366f1" fill="url(#p50)" name="P50" dot={false} />
      <Area type="monotone" dataKey="p95" stroke="#f59e0b" fill="url(#p95)" name="P95" dot={false} />
      <Area type="monotone" dataKey="p99" stroke="#ef4444" fill="url(#p99)" name="P99" dot={false} />
    </AreaChart>
  </ResponsiveContainer>
);

export default LatencyChart;
