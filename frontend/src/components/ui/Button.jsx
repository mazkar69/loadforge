const variantStyles = {
  primary: {
    background: '#6366f1',
    color: 'white',
    border: 'none',
  },
  secondary: {
    background: '#252836',
    color: '#e2e8f0',
    border: '1px solid #2e3148',
  },
  danger: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #2e3148',
  },
  success: {
    background: '#22c55e',
    color: 'white',
    border: 'none',
  },
};

const sizeStyles = {
  sm: { padding: '0.25rem 0.75rem', fontSize: '0.8125rem' },
  md: { padding: '0.5rem 1.25rem', fontSize: '0.875rem' },
  lg: { padding: '0.75rem 1.75rem', fontSize: '1rem' },
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span
          className="w-4 h-4 border-2 rounded-full animate-spin"
          style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}
        />
      )}
      {children}
    </button>
  );
};

export default Button;
