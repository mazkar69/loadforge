const BodyEditor = ({ bodyType, value, onChange, onBodyTypeChange }) => {
  const bodyTypes = ['none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw', 'binary'];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {bodyTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onBodyTypeChange(type)}
            className="px-3 py-1 rounded text-xs font-medium transition-colors"
            style={{
              background: bodyType === type ? 'rgba(99,102,241,0.2)' : '#252836',
              color: bodyType === type ? '#818cf8' : '#94a3b8',
              border: `1px solid ${bodyType === type ? '#6366f1' : '#2e3148'}`,
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {bodyType !== 'none' && bodyType !== 'binary' && (
        <textarea
          rows={8}
          placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Enter body content'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm font-mono resize-none outline-none"
          style={{
            background: '#2a2d3e',
            border: '1px solid #2e3148',
            color: '#e2e8f0',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
          onBlur={(e) => (e.target.style.borderColor = '#2e3148')}
        />
      )}
    </div>
  );
};

export default BodyEditor;
