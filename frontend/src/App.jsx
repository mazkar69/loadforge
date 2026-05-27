import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from './router/index.jsx';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e2130',
            color: '#e2e8f0',
            border: '1px solid #2e3148',
          },
        }}
      />
    </>
  );
}
export default App;
