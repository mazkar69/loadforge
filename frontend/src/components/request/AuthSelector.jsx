import Input from '../ui/Input.jsx';

const AuthSelector = ({ authType, authData, onTypeChange, onDataChange }) => {
  const authTypes = ['none', 'bearer', 'basic', 'api-key'];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {authTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onTypeChange(type)}
            className="px-3 py-1 rounded text-xs font-medium transition-colors"
            style={{
              background: authType === type ? 'rgba(99,102,241,0.2)' : '#252836',
              color: authType === type ? '#818cf8' : '#94a3b8',
              border: `1px solid ${authType === type ? '#6366f1' : '#2e3148'}`,
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {authType === 'bearer' && (
        <Input
          label="Bearer Token"
          placeholder="your-token-here"
          value={authData?.token || ''}
          onChange={(e) => onDataChange({ token: e.target.value })}
        />
      )}

      {authType === 'basic' && (
        <div className="flex gap-2">
          <Input
            label="Username"
            placeholder="username"
            value={authData?.username || ''}
            onChange={(e) => onDataChange({ ...authData, username: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="password"
            value={authData?.password || ''}
            onChange={(e) => onDataChange({ ...authData, password: e.target.value })}
          />
        </div>
      )}

      {authType === 'api-key' && (
        <div className="flex gap-2">
          <Input
            label="Header Name"
            placeholder="X-API-Key"
            value={authData?.headerName || ''}
            onChange={(e) => onDataChange({ ...authData, headerName: e.target.value })}
          />
          <Input
            label="Key Value"
            placeholder="your-api-key"
            value={authData?.key || ''}
            onChange={(e) => onDataChange({ ...authData, key: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};

export default AuthSelector;
