import Spinner from './Spinner.jsx';

const Table = ({ columns, data, loading, emptyMessage = 'No data found' }) => {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #2e3148' }}>
      <table className="w-full text-sm">
        <thead style={{ background: '#252836' }}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-medium"
                style={{ color: '#64748b', whiteSpace: 'nowrap' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12">
                <Spinner />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-12"
                style={{ color: '#64748b' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || i}
                style={{
                  borderTop: '1px solid #2e3148',
                  background: i % 2 === 0 ? '#1e2130' : '#1a1d27',
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3"
                    style={{ color: '#e2e8f0' }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
