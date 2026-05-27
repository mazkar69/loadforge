import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../hooks/useAuth.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data) => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v != null)
    );
    setLoading(true);
    try {
      await updateProfile(payload);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#e2e8f0' }}>
        Profile
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="New Password (leave blank to keep current)"
          type="password"
          placeholder="Min 8 characters"
          error={errors.password?.message}
          {...register('password', {
            minLength: { value: 8, message: 'At least 8 characters' },
          })}
        />
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default Profile;
