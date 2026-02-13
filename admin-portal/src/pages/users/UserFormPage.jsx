import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Person, 
  Phone, 
  Email, 
  Lock, 
  Wc, 
  Bloodtype, 
  CalendarToday, 
  Save, 
  Cancel 
} from '@mui/icons-material';
import { userService } from '../../services/user.service';
import PageHeader from '../../components/common/PageHeader';
import FormCard from '../../components/common/FormCard';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';

const UserFormPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await userService.create(data);
      toast.success('User created successfully');
      navigate('/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Add New User"
        subtitle="Register a new patient/user manually"
        backUrl="/users"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <FormCard title="Personal Information" icon={Person}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="First Name *"
                    placeholder="e.g. John"
                    icon={Person}
                    error={errors.firstName}
                    {...register('firstName', { required: 'First name is required' })}
                  />

                  <FormInput
                    label="Last Name *"
                    placeholder="e.g. Doe"
                    error={errors.lastName}
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    label="Gender *"
                    icon={Wc}
                    error={errors.gender}
                    {...register('gender', { required: 'Gender is required' })}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </FormSelect>

                  <FormInput
                    label="Date of Birth *"
                    type="date"
                    icon={CalendarToday}
                    error={errors.dateOfBirth}
                    {...register('dateOfBirth', { required: 'Date of Birth is required' })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    label="Blood Group"
                    icon={Bloodtype}
                    error={errors.bloodGroup}
                    {...register('bloodGroup')}
                  >
                    <option value="">Select Blood Group (Optional)</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </FormSelect>

                   <FormInput
                    label="Phone Number *"
                    type="tel"
                    placeholder="+923001234567"
                    icon={Phone}
                    error={errors.phone}
                    {...register('phone', { 
                      required: 'Phone is required',
                      pattern: {
                        value: /^\+?[0-9]{10,13}$/,
                        message: 'Invalid phone number'
                      }
                    })}
                  />
                </div>
              </div>
            </FormCard>

            <FormCard title="Account Security" icon={Lock}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Email *"
                  type="email"
                  placeholder="john@example.com"
                  icon={Email}
                  error={errors.email}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />

                <FormInput
                  label="Password *"
                  type="password"
                  placeholder="******"
                  icon={Lock}
                  error={errors.password}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
              </div>
            </FormCard>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <FormCard title="Summary" className="bg-primary-50 border-primary-100">
               <div className="text-sm text-gray-600">
                 <p className="mb-2">New user Registration.</p>
                 <ul className="list-disc list-inside space-y-1 text-xs">
                   <li>Verify contact details</li>
                   <li>Ensure strong password</li>
                 </ul>
               </div>
            </FormCard>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center py-3 flex items-center gap-2 shadow-lg shadow-primary-500/20"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating User...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Create User</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="btn btn-secondary w-full justify-center flex items-center gap-2"
                disabled={loading}
              >
                <Cancel className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserFormPage;
