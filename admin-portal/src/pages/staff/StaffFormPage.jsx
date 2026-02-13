import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { staffService } from '../../services/staff.service';
import { hospitalService } from '../../services/hospital.service';
import toast from 'react-hot-toast';
import { 
  Person, 
  Badge, 
  Work, 
  LocalHospital, 
  Phone, 
  Email, 
  AccessTime,
  Save,
  Cancel
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import FormCard from '../../components/common/FormCard';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';

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
      is24x7: false,
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
        <svg className="animate-spin h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={isEdit ? 'Edit Staff' : 'Add Staff'}
        subtitle={isEdit ? 'Update staff member details' : 'Register a new staff member'}
        backUrl="/staff"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <FormCard title="Personal Information" icon={Person}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormInput
                    label="Employee ID *"
                    placeholder="EMP001"
                    icon={Badge}
                    error={errors.employeeId}
                    {...register('employeeId', { required: 'Employee ID is required' })}
                    disabled={isEdit}
                  />
                  
                  <FormInput
                    label="First Name *"
                    placeholder="John"
                    error={errors.name?.firstName}
                    {...register('name.firstName', { required: 'First name is required' })}
                  />

                  <FormInput
                    label="Last Name *"
                    placeholder="Doe"
                    error={errors.name?.lastName}
                    {...register('name.lastName', { required: 'Last name is required' })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Phone *"
                    placeholder="+91 98765 43210"
                    icon={Phone}
                    error={errors.contact?.phone}
                    {...register('contact.phone', { required: 'Phone is required' })}
                  />

                  <FormInput
                    label="Email *"
                    type="email"
                    placeholder="staff@hospital.com"
                    icon={Email}
                    error={errors.contact?.email}
                    {...register('contact.email', { required: 'Email is required' })}
                  />
                </div>
              </div>
            </FormCard>

            {/* Work Information */}
            <FormCard title="Work Information" icon={Work}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        label="Role *"
                        icon={Work}
                        {...field}
                      >
                        <option value="doctor">Doctor</option>
                        <option value="nurse">Nurse</option>
                        <option value="technician">Technician</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="admin_staff">Admin Staff</option>
                      </FormSelect>
                    )}
                  />

                  {watchRole === 'doctor' && (
                    <FormInput
                      label="Specialization *"
                      placeholder="e.g. Cardiology"
                      icon={LocalHospital}
                      error={errors.specialization}
                      {...register('specialization', { 
                        required: watchRole === 'doctor' ? 'Specialization is required for doctors' : false 
                      })}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name="hospital"
                    control={control}
                    rules={{ required: 'Hospital is required' }}
                    render={({ field }) => (
                      <FormSelect
                        label="Hospital *"
                        icon={LocalHospital}
                        error={errors.hospital}
                        {...field}
                      >
                        <option value="">Select Hospital</option>
                        {hospitals.map((h) => (
                          <option key={h._id} value={h._id}>{h.name}</option>
                        ))}
                      </FormSelect>
                    )}
                  />

                  <FormInput
                    label="Department *"
                    placeholder="e.g. Emergency"
                    error={errors.department}
                    {...register('department', { required: 'Department is required' })}
                  />
                </div>
              </div>
            </FormCard>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <FormCard title="Shift & Status" icon={AccessTime}>
              <div className="space-y-4">
                <Controller
                  name="shift.type"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Shift"
                      icon={AccessTime}
                      {...field}
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="night">Night</option>
                      <option value="rotating">Rotating</option>
                    </FormSelect>
                  )}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Status"
                      {...field}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_leave">On Leave</option>
                      <option value="terminated">Terminated</option>
                    </FormSelect>
                  )}
                />
              </div>
            </FormCard>

            {/* Action Buttons */}
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{isEdit ? 'Update Staff Member' : 'Register Staff Member'}</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/staff')}
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
export default StaffFormPage;
