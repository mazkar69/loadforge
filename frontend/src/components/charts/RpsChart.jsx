import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const RpsChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="t" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}s`} />
      <YAxis tick={{ fontSize: 11 }} />
      <Tooltip
        contentStyle={{ background: '#1e2130', border: '1px solid #2e3148', borderRadius: 8 }}
        formatter={(v) => [`${v} req/s`, 'RPS']}
      />
      <Line type="monotone" dataKey="rps" stroke="#22c55e" dot={false} strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

export default RpsChart;
