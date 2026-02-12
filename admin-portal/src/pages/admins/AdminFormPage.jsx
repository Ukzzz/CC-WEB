import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowBack as ArrowLeft, Save, VerifiedUser as Shield, Business as Building } from '@mui/icons-material';
import { authService } from '../../services/auth.service';
import { hospitalService } from '../../services/hospital.service';
import toast from 'react-hot-toast';

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
  // e.g., "Jinnah Hospital" -> "jinnah.com.pk"
  // e.g., "City General Hospital" -> "citygeneral.com.pk"
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admins')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Admin</h1>
          <p className="text-gray-500">Add a new system or hospital administrator</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Fields */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="John"
              />
              {errors.firstName && (
                <span className="text-sm text-red-500">{errors.firstName.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="Doe"
              />
              {errors.lastName && (
                <span className="text-sm text-red-500">{errors.lastName.message}</span>
              )}
            </div>

            {/* Role Selection */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`
                  relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all
                  ${selectedRole === 'hospital_admin' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'}
                `}>
                  <input
                    type="radio"
                    value="hospital_admin"
                    {...register('role')}
                    className="sr-only"
                  />
                  <Building className={selectedRole === 'hospital_admin' ? 'text-emerald-600' : 'text-gray-400'} />
                  <span className={`mt-2 font-medium ${selectedRole === 'hospital_admin' ? 'text-emerald-900' : 'text-gray-600'}`}>
                    Hospital Admin
                  </span>
                </label>

                <label className={`
                  relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all
                  ${selectedRole === 'super_admin' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'}
                `}>
                  <input
                    type="radio"
                    value="super_admin"
                    {...register('role')}
                    className="sr-only"
                  />
                  <Shield className={selectedRole === 'super_admin' ? 'text-purple-600' : 'text-gray-400'} />
                  <span className={`mt-2 font-medium ${selectedRole === 'super_admin' ? 'text-purple-900' : 'text-gray-600'}`}>
                    Super Admin
                  </span>
                </label>
              </div>
            </div>

            {/* Hospital Selection (Conditional) */}
            {selectedRole === 'hospital_admin' && (
              <div className="md:col-span-2 space-y-2 animate-fadeIn">
                <label className="block text-sm font-medium text-gray-700">Assign Hospital</label>
                <select
                  {...register('hospital', { required: 'Hospital is required for Hospital Admins' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="">Select a hospital...</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name} ({hospital.code})
                    </option>
                  ))}
                </select>
                {errors.hospital && (
                  <span className="text-sm text-red-500">{errors.hospital.message}</span>
                )}
                {selectedHospital && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Email domain will be: @{getSelectedHospitalDomain()}
                  </p>
                )}
              </div>
            )}

            {/* Email & Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
                {selectedRole === 'hospital_admin' && selectedHospital && (
                  <span className="text-xs text-gray-400 ml-2">(auto-generated)</span>
                )}
              </label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder={selectedRole === 'hospital_admin' ? 'Select hospital & enter first name' : 'admin@example.com'}
                readOnly={selectedRole === 'hospital_admin' && !!selectedHospital && !!firstName}
              />
              {errors.email && (
                <span className="text-sm text-red-500">{errors.email.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' } 
                })}
                type="password"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
              {errors.password && (
                <span className="text-sm text-red-500">{errors.password.message}</span>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save />
              <span>{isSubmitting ? 'Creating...' : 'Create Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminFormPage;
