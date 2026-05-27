import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const ResponseDistChart = ({ histogram = [] }) => {
  if (!histogram.length) {
    return (
      <div className="flex items-center justify-center h-32" style={{ color: '#64748b' }}>
        No data
      </div>
    );
  }

  const data = histogram.map((b) => ({
    range: b.range,
    count: b.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#1e2130', border: '1px solid #2e3148', borderRadius: 8 }}
        />
        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResponseDistChart;
