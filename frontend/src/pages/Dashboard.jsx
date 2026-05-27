import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import StatsCard from '../components/ui/StatsCard.jsx';
import Table from '../components/ui/Table.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import useTestStore from '../store/testStore.js';
import useAuth from '../hooks/useAuth.js';
import { formatDate, formatLatency, testStatusColor, methodColor } from '../utils/formatters.js';

const statusBadgeColor = (s) => {
  const map = { pending: 'yellow', running: 'blue', completed: 'green', failed: 'red', cancelled: 'gray' };
  return map[s] || 'gray';
};

const columns = [
  {
    key: 'name',
    label: 'Name',
    render: (v, row) => (
      <Link to={`/tests/${row._id}`} style={{ color: '#818cf8' }} className="hover:underline font-medium">
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
    render: (v) => (
      <Badge color={statusBadgeColor(v)}>{v}</Badge>
    ),
  },
  {
    key: 'metrics',
    label: 'P95',
    render: (v) => formatLatency(v?.p95),
  },
  {
    key: 'createdAt',
    label: 'Date',
    render: (v) => formatDate(v),
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { tests, fetchTests } = useTestStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests({ limit: 10, page: 1 }).finally(() => setLoading(false));
  }, [fetchTests]);

  const completed = tests.filter((t) => t.status === 'completed');
  const failed = tests.filter((t) => t.status === 'failed');
  const avgP95 =
    completed.length > 0
      ? Math.round(completed.reduce((s, t) => s + (t.metrics?.p95 || 0), 0) / completed.length)
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Monitor and analyze your API performance
          </p>
        </div>
        <Link to="/tests/new">
          <Button>
            <PlusIcon className="w-4 h-4" />
            New Test
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tests"
          value={tests.length}
          icon={BoltIcon}
          color="#6366f1"
          subtitle="All time"
        />
        <StatsCard
          title="Completed"
          value={completed.length}
          icon={CheckCircleIcon}
          color="#22c55e"
        />
        <StatsCard
          title="Failed"
          value={failed.length}
          icon={XCircleIcon}
          color="#ef4444"
        />
        <StatsCard
          title="Avg P95 Latency"
          value={avgP95 != null ? `${avgP95}ms` : '—'}
          icon={ClockIcon}
          color="#f59e0b"
          subtitle="Completed tests"
        />
      </div>

      {/* Recent tests table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold" style={{ color: '#e2e8f0' }}>
            Recent Tests
          </h2>
          <Link to="/analytics" style={{ color: '#818cf8', fontSize: '0.875rem' }}>
            View analytics →
          </Link>
        </div>
        <Table columns={columns} data={tests} loading={loading} emptyMessage="No tests yet. Run your first test!" />
      </div>
    </div>
  );
};

export default Dashboard;
