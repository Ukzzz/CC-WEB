import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { staffService } from '../../services/staff.service';
import { hospitalService } from '../../services/hospital.service';
import toast from 'react-hot-toast';

const StaffFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [hospitals, setHospitals] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employeeId: '',
      name: { firstName: '', lastName: '' },
      role: 'doctor',
      specialization: '',
      department: '',
      hospital: '',
      contact: { phone: '', email: '' },
      shift: { type: 'morning' },
      status: 'active',
    },
  });

  const watchRole = watch('role');

  useEffect(() => {
    fetchHospitals();
    if (isEdit) {
      fetchStaff();
    }
  }, [id]);

  const fetchHospitals = async () => {
    try {
      const response = await hospitalService.getAll({ limit: 100, status: 'active' });
      setHospitals(response.data.hospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await staffService.getById(id);
      const staff = response.data.staff;
      reset({
        employeeId: staff.employeeId,
        name: staff.name,
        role: staff.role,
        specialization: staff.specialization || '',
        department: staff.department,
        hospital: staff.hospital?._id || '',
        contact: staff.contact,
        shift: { type: staff.shift?.type || 'morning' },
        status: staff.status,
      });
    } catch (error) {
      toast.error('Failed to load staff data');
      navigate('/staff');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (isEdit) {
        await staffService.update(id, data);
        toast.success('Staff updated successfully');
      } else {
        await staffService.create(data);
        toast.success('Staff created successfully');
      }

      navigate('/staff');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save staff';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/staff')}
          className="p-2 hover:bg-gray-100 rounded-md text-gray-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="page-title">{isEdit ? 'Edit Staff' : 'Add Staff'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="card">
              <div className="card-body">
                <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="input-label">Employee ID *</label>
                    <input
                      className={`input ${errors.employeeId ? 'border-danger-500' : ''}`}
                      {...register('employeeId', { required: 'Employee ID is required' })}
                      disabled={isEdit}
                    />
                  </div>
                  <div>
                    <label className="input-label">First Name *</label>
                    <input
                      className={`input ${errors.name?.firstName ? 'border-danger-500' : ''}`}
                      {...register('name.firstName', { required: 'First name is required' })}
                    />
                  </div>
                  <div>
                    <label className="input-label">Last Name *</label>
                    <input
                      className={`input ${errors.name?.lastName ? 'border-danger-500' : ''}`}
                      {...register('name.lastName', { required: 'Last name is required' })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Phone *</label>
                    <input
                      className={`input ${errors.contact?.phone ? 'border-danger-500' : ''}`}
                      {...register('contact.phone', { required: 'Phone is required' })}
                    />
                  </div>
                  <div>
                    <label className="input-label">Email *</label>
                    <input
                      type="email"
                      className={`input ${errors.contact?.email ? 'border-danger-500' : ''}`}
                      {...register('contact.email', { required: 'Email is required' })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Work Info */}
            <div className="card">
              <div className="card-body">
                <h2 className="font-semibold text-gray-900 mb-4">Work Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="input-label">Role *</label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <select {...field} className="input">
                          <option value="doctor">Doctor</option>
                          <option value="nurse">Nurse</option>
                          <option value="technician">Technician</option>
                          <option value="receptionist">Receptionist</option>
                          <option value="admin_staff">Admin Staff</option>
                        </select>
                      )}
                    />
                  </div>
                  {watchRole === 'doctor' && (
                    <div>
                      <label className="input-label">Specialization *</label>
                      <input
                        className={`input ${errors.specialization ? 'border-danger-500' : ''}`}
                        {...register('specialization', { 
                          required: watchRole === 'doctor' ? 'Specialization is required for doctors' : false 
                        })}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Hospital *</label>
                    <Controller
                      name="hospital"
                      control={control}
                      rules={{ required: 'Hospital is required' }}
                      render={({ field }) => (
                        <select {...field} className={`input ${errors.hospital ? 'border-danger-500' : ''}`}>
                          <option value="">Select Hospital</option>
                          {hospitals.map((h) => (
                            <option key={h._id} value={h._id}>{h.name}</option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  <div>
                    <label className="input-label">Department *</label>
                    <input
                      className={`input ${errors.department ? 'border-danger-500' : ''}`}
                      {...register('department', { required: 'Department is required' })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h2 className="font-semibold text-gray-900 mb-4">Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="input-label">Shift</label>
                    <Controller
                      name="shift.type"
                      control={control}
                      render={({ field }) => (
                        <select {...field} className="input">
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="night">Night</option>
                          <option value="rotating">Rotating</option>
                        </select>
                      )}
                    />
                  </div>

                  <div>
                    <label className="input-label">Status</label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <select {...field} className="input">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="on_leave">On Leave</option>
                          <option value="terminated">Terminated</option>
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isEdit ? 'Update Staff' : 'Create Staff'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StaffFormPage;
