const colorMap = {
  indigo: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
  green: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
  red: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  yellow: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  blue: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
  gray: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
  orange: { bg: 'rgba(249,115,22,0.15)', text: '#fb923c' },
};

const Badge = ({ children, color = 'indigo', className = '' }) => {
  const c = colorMap[color] || colorMap.gray;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}
      style={{ background: c.bg, color: c.text }}
    >
      {children}
    </span>
  );
};

export default Badge;
