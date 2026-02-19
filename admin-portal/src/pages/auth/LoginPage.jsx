import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  EmailOutlined, 
  LockOutlined, 
  VisibilityOutlined, 
  VisibilityOffOutlined,
  LocalHospital,
  MedicalServices,
  HealthAndSafety
} from '@mui/icons-material';
import LoginInput from '../../components/common/LoginInput';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
    return null;
  }

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Premium Medical Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #22b598 0%, #3b82f6 100%)' }}>
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-black/5 z-0" />
        
        {/* Abstract Medical Shapes */}
        {/* Floating Decorative Shapes */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute w-[400px] h-[400px] rounded-full bg-white/[0.08] -top-[120px] -right-[80px]" style={{ animation: 'float 8s ease-in-out infinite' }} />
          <div className="absolute w-[250px] h-[250px] rounded-full bg-white/[0.08] -bottom-[60px] -left-[40px]" style={{ animation: 'float 10s ease-in-out infinite reverse' }} />
          <div className="absolute w-[150px] h-[150px] rounded-full bg-white/[0.06] top-[40%] left-[15%]" style={{ animation: 'float 7s ease-in-out infinite 1s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-16 text-center h-full">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="mb-6 w-[80px] h-[80px] rounded-[22px] flex items-center justify-center"
             style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
           >
             <LocalHospital style={{ fontSize: 40, color: '#ffffff' }} />
           </motion.div>
           
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="text-4xl font-extrabold text-white mb-3 tracking-tight"
             style={{ textShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
           >
             CareConnect
           </motion.h1>

           <motion.p
             initial={{ opacity: 0, y: 12 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4 }}
             className="text-white/80 text-base font-normal"
           >
             Finding care when you need it most
           </motion.p>
         </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white/50 relative">
        {/* Mobile Background Blob used only when on small screens for visual interest */}
        <div className="absolute inset-0 overflow-hidden lg:hidden pointer-events-none">
           <div className="absolute -top-[20%] -right-[20%] w-[80%] h-[80%] bg-emerald-100/40 rounded-full blur-3xl opacity-50" />
           <div className="absolute -bottom-[20%] -left-[20%] w-[80%] h-[80%] bg-blue-100/40 rounded-full blur-3xl opacity-50" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-gray-200/50 relative z-10 border border-gray-100"
        >
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="lg:hidden mx-auto w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
              <LocalHospital />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Please sign in to access your dashboard</p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3"
            >
              <div className="text-red-500 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <LoginInput
              label="Email Address"
              type="email"
              icon={EmailOutlined}
              error={errors.email}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />

            <LoginInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon={LockOutlined}
              endIcon={showPassword ? VisibilityOffOutlined : VisibilityOutlined}
              onEndIconClick={() => setShowPassword(!showPassword)}
              error={errors.password}
              {...register('password', {
                required: 'Password is required',
              })}
            />

            <div className="flex items-center justify-between mb-8 mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-4 h-4 border-2 border-gray-300 rounded transition-colors peer-checked:bg-emerald-500 peer-checked:border-emerald-500 group-hover:border-emerald-400" />
                  <svg className="w-3 h-3 text-white absolute left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Remember me</span>
              </label>
              
              <a href="#" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
             <p className="text-xs text-gray-400">
               Protected by enterprise-grade security.
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
