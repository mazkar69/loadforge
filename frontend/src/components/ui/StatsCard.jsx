const StatsCard = ({ title, value, subtitle, icon: Icon, color = '#6366f1', trend }) => {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{ background: '#1e2130', border: '1px solid #2e3148' }}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
          {title}
        </p>
        {Icon && (
          <span
            className="p-2 rounded-lg"
            style={{ background: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
          {value ?? '—'}
        </p>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>
            {subtitle}
          </p>
        )}
      </div>
      {trend != null && (
        <p
          className="text-xs font-medium"
          style={{ color: trend >= 0 ? '#22c55e' : '#ef4444' }}
        >
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </p>
      )}
    </div>
  );
};

export default StatsCard;
