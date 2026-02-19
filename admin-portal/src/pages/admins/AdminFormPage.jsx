import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  VerifiedUser, 
  Business, 
  Person, 
  Email, 
  Lock, 
  Save, 
  Cancel,
  AdminPanelSettings
} from '@mui/icons-material';
import { authService } from '../../services/auth.service';
import { hospitalService } from '../../services/hospital.service';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import FormCard from '../../components/common/FormCard';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';

const AdminFormPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      role: 'hospital_admin',
    },
  });

  const [hospitals, setHospitals] = useState([]);
  const selectedRole = watch('role');
  const selectedHospital = watch('hospital');
  const firstName = watch('firstName');

  useEffect(() => {
    if (selectedRole === 'hospital_admin') {
      fetchHospitals();
    }
  }, [selectedRole]);

  // Auto-generate email when hospital or firstName changes
  useEffect(() => {
    if (selectedRole === 'hospital_admin' && selectedHospital && firstName) {
      const hospital = hospitals.find(h => h._id === selectedHospital);
      if (hospital) {
        const domain = generateEmailDomain(hospital.name);
        const email = `${firstName.toLowerCase().replace(/\s+/g, '')}@${domain}`;
        setValue('email', email, { shouldValidate: true });
      }
    }
  }, [selectedHospital, firstName, hospitals, selectedRole, setValue]);

  const fetchHospitals = async () => {
    try {
      const data = await hospitalService.getAll();
      setHospitals(data.data.hospitals || []);
    } catch (error) {
      console.error('Failed to fetch hospitals', error);
      toast.error('Could not load hospitals list');
    }
  };

  // Generate email domain from hospital name
  const generateEmailDomain = (hospitalName) => {
    if (!hospitalName) return 'hospital.com.pk';
    
    // Remove common words and create domain
    const removeWords = ['hospital', 'medical', 'center', 'centre', 'healthcare', 'clinic', 'foundation'];
    let words = hospitalName.toLowerCase().split(/\s+/);
    
    // Filter out common words but keep at least one word
    let filteredWords = words.filter(w => !removeWords.includes(w));
    if (filteredWords.length === 0) {
      filteredWords = [words[0]]; // Keep first word if all were removed
    }
    
    // Join words and clean up
    const domain = filteredWords
      .slice(0, 2) // Max 2 words
      .join('')
      .replace(/[^a-z0-9]/g, ''); // Remove special characters
    
    return `${domain}.com.pk`;
  };

  const getSelectedHospitalDomain = () => {
    if (!selectedHospital) return null;
    const hospital = hospitals.find(h => h._id === selectedHospital);
    if (!hospital) return null;
    return generateEmailDomain(hospital.name);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        name: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
        role: data.role,
        permissions: data.role === 'super_admin' ? [] : ['view_users', 'manage_staff', 'manage_resources'],
      };

      if (data.role === 'hospital_admin') {
        payload.hospital = data.hospital;
      }

      await authService.registerAdmin(payload);
      toast.success('Admin created successfully');
      navigate('/admins');
    } catch (error) {
      toast.error(error.toString() || 'Failed to create admin');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Create New Admin"
        subtitle="Add a new system or hospital administrator"
        backUrl="/admins"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Personal Info & Role */}
          <div className="space-y-6">
            <FormCard title="Administrator Details" icon={Person}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="First Name *"
                    placeholder="John"
                    icon={Person}
                    error={errors.firstName}
                    {...register('firstName', { required: 'First name is required' })}
                  />

                  <FormInput
                    label="Last Name *"
                    placeholder="Doe"
                    error={errors.lastName}
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                </div>
              </div>
            </FormCard>

            <FormCard title="Role Assignment" icon={AdminPanelSettings}>
              <div className="grid grid-cols-2 gap-4">
                <label className={`
                  relative flex flex-col items-center justify-center p-6 border rounded-xl cursor-pointer transition-all duration-200
                  ${selectedRole === 'hospital_admin' 
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
                    : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'}
                `}>
                  <input
                    type="radio"
                    value="hospital_admin"
                    {...register('role')}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-full mb-3 ${selectedRole === 'hospital_admin' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Business className="w-6 h-6" />
                  </div>
                  <span className={`font-semibold ${selectedRole === 'hospital_admin' ? 'text-emerald-900' : 'text-gray-700'}`}>
                    Hospital Admin
                  </span>
                  <span className="text-xs text-gray-500 mt-1 text-center">Manages single hospital</span>
                </label>

                <label className={`
                  relative flex flex-col items-center justify-center p-6 border rounded-xl cursor-pointer transition-all duration-200
                  ${selectedRole === 'super_admin' 
                    ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' 
                    : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'}
                `}>
                  <input
                    type="radio"
                    value="super_admin"
                    {...register('role')}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-full mb-3 ${selectedRole === 'super_admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                    <VerifiedUser className="w-6 h-6" />
                  </div>
                  <span className={`font-semibold ${selectedRole === 'super_admin' ? 'text-purple-900' : 'text-gray-700'}`}>
                    Super Admin
                  </span>
                  <span className="text-xs text-gray-500 mt-1 text-center">Full system access</span>
                </label>
              </div>
            </FormCard>
          </div>

          {/* Right Column: Account Settings */}
          <div className="space-y-6">
            <FormCard title="Account Settings" icon={Email}>
              <div className="space-y-4">
                {/* Hospital Selection (Conditional) */}
                {selectedRole === 'hospital_admin' && (
                  <div className="animate-fadeIn">
                    <FormSelect
                      label="Assign Hospital *"
                      icon={Business}
                      error={errors.hospital}
                      {...register('hospital', { required: 'Hospital is required for Hospital Admins' })}
                    >
                      <option value="">Select a hospital...</option>
                      {hospitals.map((hospital) => (
                        <option key={hospital._id} value={hospital._id}>
                          {hospital.name} ({hospital.code})
                        </option>
                      ))}
                    </FormSelect>
                    
                    {selectedHospital && (
                      <div className="mt-2 p-3 bg-emerald-50 rounded-lg flex items-start gap-2 text-sm text-emerald-700">
                        <VerifiedUser className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Domain Verified</p>
                          <p className="text-emerald-600/80 text-xs">Email domain will be set to: @{getSelectedHospitalDomain()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div className="relative">
                    <FormInput
                      label="Email Address *"
                      type="email"
                      placeholder={selectedRole === 'hospital_admin' ? 'Select hospital & enter first name' : 'admin@example.com'}
                      icon={Email}
                      error={errors.email}
                      readOnly={selectedRole === 'hospital_admin' && !!selectedHospital && !!firstName}
                      {...register('email', { required: 'Email is required' })}
                    />
                    {selectedRole === 'hospital_admin' && selectedHospital && firstName && (
                      <span className="absolute right-3 top-9 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        Auto-generated
                      </span>
                    )}
                  </div>

                  <div>
                    <FormInput
                      label="Password *"
                      type="password"
                      placeholder="••••••••"
                      icon={Lock}
                      error={errors.password}
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                        }
                      })}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Must be at least 8 characters with an uppercase letter, a lowercase letter, and a number.
                    </p>
                  </div>
                </div>
              </div>
            </FormCard>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full justify-center py-3 flex items-center gap-2 shadow-lg shadow-primary-500/20"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Administrator...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Create Administrator</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/admins')}
                className="btn btn-secondary w-full justify-center flex items-center gap-2"
                disabled={isSubmitting}
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

export default AdminFormPage;
