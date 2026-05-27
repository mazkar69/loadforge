const Spinner = ({ size = 'md', className = '' }) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <span
      className={`inline-block rounded-full animate-spin border-2 ${sizeMap[size]} ${className}`}
      style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }}
    />
  );
};

export default Spinner;
