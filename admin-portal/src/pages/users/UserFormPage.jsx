import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { userService } from '../../services/user.service';

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Add New User</h1>
        <p className="page-subtitle">Register a new patient/user manually</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="input-label">First Name</label>
                <input
                  type="text"
                  className={`input ${errors.firstName ? 'input-error' : ''}`}
                  {...register('firstName', { required: 'First name is required' })}
                  placeholder="e.g. John"
                />
                {errors.firstName && <span className="input-error-message">{errors.firstName.message}</span>}
              </div>

              {/* Last Name */}
              <div>
                <label className="input-label">Last Name</label>
                <input
                  type="text"
                  className={`input ${errors.lastName ? 'input-error' : ''}`}
                  {...register('lastName', { required: 'Last name is required' })}
                  placeholder="e.g. Doe"
                />
                {errors.lastName && <span className="input-error-message">{errors.lastName.message}</span>}
              </div>

              {/* Phone */}
              <div>
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  className={`input ${errors.phone ? 'input-error' : ''}`}
                  {...register('phone', { 
                    required: 'Phone is required',
                    pattern: {
                      value: /^\+?[0-9]{10,13}$/,
                      message: 'Invalid phone number'
                    }
                  })}
                  placeholder="+923001234567"
                />
                {errors.phone && <span className="input-error-message">{errors.phone.message}</span>}
              </div>

              {/* Email */}
              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="john@example.com"
                />
                {errors.email && <span className="input-error-message">{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div>
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  placeholder="******"
                />
                {errors.password && <span className="input-error-message">{errors.password.message}</span>}
              </div>

              {/* Gender */}
              <div>
                <label className="input-label">Gender</label>
                <select
                  className={`input ${errors.gender ? 'input-error' : ''}`}
                  {...register('gender', { required: 'Gender is required' })}
                  defaultValue=""
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="input-error-message">{errors.gender.message}</span>}
              </div>

              {/* Blood Group */}
              <div>
                <label className="input-label">Blood Group</label>
                <select
                  className={`input ${errors.bloodGroup ? 'input-error' : ''}`}
                  {...register('bloodGroup')}
                  defaultValue=""
                >
                  <option value="" disabled>Select Blood Group (Optional)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

               {/* Date of Birth */}
               <div>
                <label className="input-label">Date of Birth</label>
                <input
                  type="date"
                  className={`input ${errors.dateOfBirth ? 'input-error' : ''}`}
                  {...register('dateOfBirth', { required: 'Date of Birth is required' })}
                />
                {errors.dateOfBirth && <span className="input-error-message">{errors.dateOfBirth.message}</span>}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="btn btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormPage;
