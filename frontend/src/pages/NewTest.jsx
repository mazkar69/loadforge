import TestConfigForm from '../components/test/TestConfigForm.jsx';

const NewTest = () => (
  <div className="max-w-4xl mx-auto space-y-4">
    <div>
      <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
        New Load Test
      </h1>
      <p className="text-sm mt-1" style={{ color: '#64748b' }}>
        Configure your API endpoint, load parameters, and run the test.
      </p>
    </div>
    <TestConfigForm />
  </div>
);

export default NewTest;
