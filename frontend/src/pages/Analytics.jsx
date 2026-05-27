import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useTestStore from '../store/testStore.js';
import Table from '../components/ui/Table.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { formatDate, formatLatency, formatRps, methodColor } from '../utils/formatters.js';
import toast from 'react-hot-toast';

const statusBadgeColor = (s) => {
  const map = { pending: 'yellow', running: 'blue', completed: 'green', failed: 'red', cancelled: 'gray' };
  return map[s] || 'gray';
};

const Analytics = () => {
  const { tests, fetchTests, deleteTest } = useTestStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests({ limit: 50, page: 1 }).finally(() => setLoading(false));
  }, [fetchTests]);

  const completed = tests.filter((t) => t.status === 'completed');
  const avgP95 =
    completed.length > 0
      ? Math.round(completed.reduce((s, t) => s + (t.metrics?.p95 || 0), 0) / completed.length)
      : null;
  const avgRps =
    completed.length > 0
      ? (completed.reduce((s, t) => s + (t.metrics?.requestsPerSecond || 0), 0) / completed.length).toFixed(1)
      : null;

  const handleDelete = async (id) => {
    try {
      await deleteTest(id);
      toast.success('Test deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name / URL',
      render: (v, row) => (
        <Link to={`/tests/${row._id}`} style={{ color: '#818cf8' }} className="hover:underline">
          {v || row.url}
        </Link>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      render: (v) => <span className={`font-mono text-xs font-bold ${methodColor(v)}`}>{v}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge color={statusBadgeColor(v)}>{v}</Badge>,
    },
    {
      key: 'metrics',
      label: 'P95',
      render: (v) => formatLatency(v?.p95),
    },
    {
      key: 'metrics',
      label: 'RPS',
      render: (v) => formatRps(v?.requestsPerSecond),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (v) => formatDate(v),
    },
    {
      key: '_id',
      label: '',
      render: (v) => (
        <Button variant="danger" onClick={() => handleDelete(v)} className="text-xs py-1 px-2">
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
        Analytics
      </h1>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Runs', value: tests.length },
          { label: 'Completed', value: completed.length },
          { label: 'Avg P95', value: avgP95 != null ? `${avgP95}ms` : '—' },
          { label: 'Avg RPS', value: avgRps != null ? `${avgRps} req/s` : '—' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ background: '#1e2130', border: '1px solid #2e3148' }}
          >
            <p className="text-xs mb-1" style={{ color: '#64748b' }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <Table columns={columns} data={tests} loading={loading} emptyMessage="No tests found." />
    </div>
  );
};

export default Analytics;
