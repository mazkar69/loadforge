import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', style = {}, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium" style={{ color: '#94a3b8' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${className}`}
        style={{
          background: '#2a2d3e',
          border: `1px solid ${error ? '#ef4444' : '#2e3148'}`,
          color: '#e2e8f0',
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#6366f1';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#ef4444' : '#2e3148';
        }}
        {...props}
      />
      {error && (
        <span className="text-xs" style={{ color: '#ef4444' }}>
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
