import useAuth from '../hooks/useAuth.js';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';

const Settings = () => {
  const { logout } = useAuth();

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
        Settings
      </h1>

      {/* Appearance (stub) */}
      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: '#94a3b8' }}>
          Appearance
        </h2>
        <div className="rounded-xl p-4" style={{ background: '#1e2130', border: '1px solid #2e3148' }}>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Theme: <span style={{ color: '#818cf8' }}>Dark (default)</span>. Additional themes coming soon.
          </p>
        </div>
      </section>

      {/* Notifications (stub) */}
      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: '#94a3b8' }}>
          Notifications
        </h2>
        <div className="rounded-xl p-4" style={{ background: '#1e2130', border: '1px solid #2e3148' }}>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Email and webhook notifications — coming soon.
          </p>
        </div>
      </section>

      {/* Team (stub) */}
      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: '#94a3b8' }}>
          Team Collaboration
        </h2>
        <div className="rounded-xl p-4" style={{ background: '#1e2130', border: '1px solid #2e3148' }}>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Invite team members and share collections — coming soon.
          </p>
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: '#ef4444' }}>
          Danger Zone
        </h2>
        <div className="rounded-xl p-4 space-y-3" style={{ background: '#1e2130', border: '1px solid #3b1d1d' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>Sign out</p>
              <p className="text-xs" style={{ color: '#64748b' }}>Sign out of your account on this device.</p>
            </div>
            <Button variant="danger" onClick={logout}>
              Sign out
            </Button>
          </div>
          <div className="flex items-center justify-between" style={{ borderTop: '1px solid #2e3148', paddingTop: '12px' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>Delete Account</p>
              <p className="text-xs" style={{ color: '#64748b' }}>Permanently delete your account and all data.</p>
            </div>
            <Button
              variant="danger"
              onClick={() => toast.error('Account deletion is not yet available')}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
