import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useTestStore from '../store/testStore.js';
import Spinner from '../components/ui/Spinner.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import LatencyChart from '../components/charts/LatencyChart.jsx';
import RpsChart from '../components/charts/RpsChart.jsx';
import StatusPieChart from '../components/charts/StatusPieChart.jsx';
import ResponseDistChart from '../components/charts/ResponseDistChart.jsx';
import ErrorChart from '../components/charts/ErrorChart.jsx';
import { downloadJSON, downloadCSV, downloadPDF } from '../api/report.api.js';
import { formatDate, formatLatency, formatRps, methodColor, testStatusColor } from '../utils/formatters.js';
import toast from 'react-hot-toast';

const statusBadgeColor = (s) => {
  const map = { pending: 'yellow', running: 'blue', completed: 'green', failed: 'red', cancelled: 'gray' };
  return map[s] || 'gray';
};

const MetricBox = ({ label, value }) => (
  <div className="rounded-lg p-4 flex flex-col gap-1" style={{ background: '#252836', border: '1px solid #2e3148' }}>
    <p className="text-xs" style={{ color: '#64748b' }}>{label}</p>
    <p className="text-xl font-bold" style={{ color: '#e2e8f0' }}>{value ?? '—'}</p>
  </div>
);

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const TestResults = () => {
  const { id } = useParams();
  const { currentTest, fetchTestById } = useTestStore();

  useEffect(() => {
    fetchTestById(id);
  }, [id, fetchTestById]);

  if (!currentTest || currentTest._id !== id) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const m = currentTest.metrics || {};
  const timeSeries = m.timeSeries || [];

  const handleDownload = async (type) => {
    try {
      let blob;
      const filename = `test-${id}.${type}`;
      if (type === 'json') blob = await downloadJSON(id);
      else if (type === 'csv') blob = await downloadCSV(id);
      else blob = await downloadPDF(id);
      downloadBlob(blob, filename);
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
              {currentTest.name || currentTest.url}
            </h1>
            <Badge color={statusBadgeColor(currentTest.status)}>{currentTest.status}</Badge>
          </div>
          <p className="text-sm flex items-center gap-2" style={{ color: '#64748b' }}>
            <span className={`font-mono font-bold ${methodColor(currentTest.method)}`}>
              {currentTest.method}
            </span>
            <span>{currentTest.url}</span>
            <span>·</span>
            <span>{formatDate(currentTest.createdAt)}</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => handleDownload('json')}>Export JSON</Button>
          <Button variant="secondary" onClick={() => handleDownload('csv')}>Export CSV</Button>
          <Button variant="secondary" onClick={() => handleDownload('pdf')}>Export PDF</Button>
          <Link to="/tests/new">
            <Button>Re-run</Button>
          </Link>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricBox label="Total Requests" value={m.total} />
        <MetricBox label="Completed" value={m.successful} />
        <MetricBox label="Failed" value={m.failed} />
        <MetricBox label="P50 Latency" value={formatLatency(m.p50)} />
        <MetricBox label="P95 Latency" value={formatLatency(m.p95)} />
        <MetricBox label="P99 Latency" value={formatLatency(m.p99)} />
        <MetricBox label="Avg Latency" value={formatLatency(m.avgLatency)} />
        <MetricBox label="Min Latency" value={formatLatency(m.minLatency)} />
        <MetricBox label="Max Latency" value={formatLatency(m.maxLatency)} />
        <MetricBox label="RPS" value={formatRps(m.requestsPerSecond)} />
        <MetricBox label="Throughput" value={m.throughputKBps ? `${m.throughputKBps.toFixed(1)} KB/s` : '—'} />
        <MetricBox label="Success Rate" value={m.total ? `${((m.successful / m.total) * 100).toFixed(1)}%` : '—'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-4" style={{ background: '#1e2130', border: '1px solid #2e3148' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#94a3b8' }}>Latency Over Time</h3>
          <LatencyChart data={timeSeries} />
        </div>
        <div className="rounded-xl p-4" style={{ background: '#1e2130', border: '1px solid #2e3148' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#94a3b8' }}>Requests Per Second</h3>
          <RpsChart data={timeSeries} />
        </div>
        <div className="rounded-xl p-4" style={{ background: '#1e2130', border: '1px solid #2e3148' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#94a3b8' }}>Status Distribution</h3>
          <StatusPieChart distribution={m.statusDistribution || {}} />
        </div>
        <div className="rounded-xl p-4" style={{ background: '#1e2130', border: '1px solid #2e3148' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#94a3b8' }}>Response Time Distribution</h3>
          <ResponseDistChart histogram={m.histogram || []} />
        </div>
        {m.errorDistribution && Object.keys(m.errorDistribution).length > 0 && (
          <div className="rounded-xl p-4 lg:col-span-2" style={{ background: '#1e2130', border: '1px solid #2e3148' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#94a3b8' }}>Error Distribution</h3>
            <ErrorChart distribution={m.errorDistribution} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResults;
