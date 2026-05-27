import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

const KeyValueTable = ({ label, value = [], onChange }) => {
  const handleChange = (idx, field, v) => {
    const updated = value.map((row, i) => (i === idx ? { ...row, [field]: v } : row));
    onChange(updated);
  };

  const addRow = () => onChange([...value, { key: '', value: '' }]);
  const removeRow = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>
          {label}
        </span>
        <button
          type="button"
          onClick={addRow}
          className="text-xs flex items-center gap-1 hover:opacity-80"
          style={{ color: '#818cf8' }}
        >
          <PlusIcon className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      {value.map((row, idx) => (
        <div key={idx} className="flex gap-2">
          <Input
            placeholder="Key"
            value={row.key}
            onChange={(e) => handleChange(idx, 'key', e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Value"
            value={row.value}
            onChange={(e) => handleChange(idx, 'value', e.target.value)}
            className="flex-1"
          />
          <button type="button" onClick={() => removeRow(idx)} className="shrink-0">
            <TrashIcon className="w-4 h-4" style={{ color: '#64748b' }} />
          </button>
        </div>
      ))}
    </div>
  );
};

export const HeadersTable = ({ value = [], onChange }) => (
  <KeyValueTable label="Headers" value={value} onChange={onChange} />
);

export const ParamsTable = ({ value = [], onChange }) => (
  <KeyValueTable label="Query Parameters" value={value} onChange={onChange} />
);
