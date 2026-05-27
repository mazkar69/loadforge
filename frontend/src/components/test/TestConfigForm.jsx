import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { HeadersTable, ParamsTable } from '../request/HeadersParamsTables.jsx';
import BodyEditor from '../request/BodyEditor.jsx';
import AuthSelector from '../request/AuthSelector.jsx';
import useTestRunner from '../../hooks/useTestRunner.js';
import LiveTerminal from './LiveTerminal.jsx';
import LiveMetricsBar from './LiveMetricsBar.jsx';
import useTestStore from '../../store/testStore.js';
import toast from 'react-hot-toast';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const tabs = ['Params', 'Headers', 'Body', 'Auth', 'Config'];

const TestConfigForm = () => {
  const [activeTab, setActiveTab] = useState('Params');
  const [headers, setHeaders] = useState([]);
  const [params, setParams] = useState([]);
  const [body, setBody] = useState('');
  const [bodyType, setBodyType] = useState('none');
  const [authType, setAuthType] = useState('none');
  const [authData, setAuthData] = useState({});
  const { run } = useTestRunner();
  const isRunning = useTestStore((s) => s.isRunning);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      method: 'GET',
      totalRequests: 100,
      concurrency: 10,
      timeout: 30000,
      delay: 0,
      retries: 0,
    },
  });

  const onSubmit = async (data) => {
    // Convert headers/params arrays to objects
    const headersObj = headers.reduce((acc, { key, value }) => {
      if (key) acc[key] = value;
      return acc;
    }, {});
    const queryParamsObj = params.reduce((acc, { key, value }) => {
      if (key) acc[key] = value;
      return acc;
    }, {});

    let parsedBody = body;
    if (bodyType === 'json') {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        toast.error('Invalid JSON body');
        return;
      }
    }

    const payload = {
      name: data.name,
      url: data.url,
      method: data.method,
      headers: headersObj,
      queryParams: queryParamsObj,
      body: parsedBody || undefined,
      bodyType,
      auth: authType !== 'none' ? { type: authType, ...authData } : undefined,
      config: {
        totalRequests: Number(data.totalRequests),
        concurrency: Number(data.concurrency),
        timeout: Number(data.timeout),
        delay: Number(data.delay),
        retries: Number(data.retries),
      },
    };

    await run(payload);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* URL bar */}
        <div className="flex gap-2 mb-4">
          <select
            className="rounded-lg px-3 py-2 text-sm font-mono font-bold outline-none"
            style={{ background: '#252836', border: '1px solid #2e3148', color: '#818cf8', minWidth: '100px' }}
            {...register('method')}
          >
            {HTTP_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: '#2a2d3e', border: `1px solid ${errors.url ? '#ef4444' : '#2e3148'}`, color: '#e2e8f0' }}
            placeholder="https://api.example.com/endpoint"
            onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
            onBlur={(e) => (e.target.style.borderColor = errors.url ? '#ef4444' : '#2e3148')}
            {...register('url', { required: 'URL is required' })}
          />
          <Button type="submit" loading={isRunning} disabled={isRunning}>
            {isRunning ? 'Running…' : 'Run Test'}
          </Button>
        </div>

        {/* Test name */}
        <Input
          label="Test Name (optional)"
          placeholder="My load test"
          className="mb-4"
          {...register('name')}
        />

        {/* Tabs */}
        <div
          className="rounded-xl overflow-hidden mb-4"
          style={{ background: '#1e2130', border: '1px solid #2e3148' }}
        >
          <div className="flex" style={{ borderBottom: '1px solid #2e3148' }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2.5 text-sm font-medium transition-colors"
                style={{
                  color: activeTab === tab ? '#818cf8' : '#64748b',
                  borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                  background: 'transparent',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4">
            {activeTab === 'Params' && <ParamsTable value={params} onChange={setParams} />}
            {activeTab === 'Headers' && <HeadersTable value={headers} onChange={setHeaders} />}
            {activeTab === 'Body' && (
              <BodyEditor
                bodyType={bodyType}
                value={body}
                onChange={setBody}
                onBodyTypeChange={setBodyType}
              />
            )}
            {activeTab === 'Auth' && (
              <AuthSelector
                authType={authType}
                authData={authData}
                onTypeChange={setAuthType}
                onDataChange={setAuthData}
              />
            )}
            {activeTab === 'Config' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Input
                  label="Total Requests"
                  type="number"
                  min={1}
                  max={100000}
                  error={errors.totalRequests?.message}
                  {...register('totalRequests', { required: true, min: 1 })}
                />
                <Input
                  label="Concurrency"
                  type="number"
                  min={1}
                  max={500}
                  error={errors.concurrency?.message}
                  {...register('concurrency', { required: true, min: 1 })}
                />
                <Input
                  label="Timeout (ms)"
                  type="number"
                  min={100}
                  error={errors.timeout?.message}
                  {...register('timeout')}
                />
                <Input
                  label="Delay between requests (ms)"
                  type="number"
                  min={0}
                  {...register('delay')}
                />
                <Input
                  label="Retries on failure"
                  type="number"
                  min={0}
                  max={5}
                  {...register('retries')}
                />
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Live metrics & terminal */}
      <LiveMetricsBar />
      <LiveTerminal />
    </div>
  );
};

export default TestConfigForm;
