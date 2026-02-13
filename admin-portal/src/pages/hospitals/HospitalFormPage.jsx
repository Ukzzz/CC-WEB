import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { hospitalService } from '../../services/hospital.service';
import toast from 'react-hot-toast';
import { 
  Business, 
  LocationOn, 
  Phone, 
  MedicalServices, 
  Save, 
  Cancel 
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import FormCard from '../../components/common/FormCard';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';

const HospitalFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      code: '',
      type: 'private',
      status: 'active',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Pakistan',
      phone: '',
      email: '',
      website: '',
      is24x7: true,
      hasEmergency: true,
      hasAmbulance: false,
      hasBloodBank: false,
    },
  });



  useEffect(() => {
    if (isEditing) {
      fetchHospital();
    }
  }, [id]);

  const fetchHospital = async () => {
    try {
      setFetchLoading(true);
      const response = await hospitalService.getById(id);
      const hospital = response.data.hospital;
      
      reset({
        name: hospital.name || '',
        code: hospital.code || '',
        type: hospital.hospitalType || hospital.type || 'private',
        status: hospital.status || 'active',
        address: hospital.location?.address || '',
        city: hospital.location?.city || '',
        state: hospital.location?.state || '',
        zipCode: hospital.location?.zipCode || '',
        country: hospital.location?.country || 'Pakistan',
        phone: hospital.contact?.phone || '',
        email: hospital.contact?.email || '',
        website: hospital.contact?.website || '',
        is24x7: hospital.services?.is24x7 ?? true,
        hasEmergency: hospital.services?.hasEmergency ?? true,
        hasAmbulance: hospital.services?.hasAmbulance ?? false,
        hasBloodBank: hospital.services?.hasBloodBank ?? false,
      });
    } catch (error) {
      toast.error('Failed to load hospital details');
      navigate('/hospitals');
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    const payload = {
      name: data.name,
      code: data.code,
      hospitalType: data.type,
      status: data.status,
      location: {
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      },
      contact: {
        phone: data.phone,
        email: data.email,
        website: data.website || undefined,
      },
      services: {
        is24x7: data.is24x7,
        hasEmergency: data.hasEmergency,
        hasAmbulance: data.hasAmbulance,
        hasBloodBank: data.hasBloodBank,
      },
    };

    try {
      if (isEditing) {
        await hospitalService.update(id, payload);
        toast.success('Hospital updated successfully');
      } else {
        await hospitalService.create(payload);
        toast.success('Hospital created successfully');
      }
      navigate('/hospitals');
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500">Loading hospital details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader 
        title={isEditing ? 'Edit Hospital' : 'Add New Hospital'}
        subtitle={isEditing ? 'Update hospital information' : 'Register a new hospital in the system'}
        backUrl="/hospitals"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <FormCard title="Basic Information" icon={Business}>
            <div className="space-y-4">
              <FormInput
                label="Hospital Name *"
                placeholder="Enter hospital name"
                icon={Business}
                error={errors.name}
                {...register('name', { required: 'Hospital name is required' })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Hospital Code *"
                  placeholder="e.g., HOSP001"
                  error={errors.code}
                  {...register('code', { required: 'Hospital code is required' })}
                />
                
                <FormSelect
                  label="Hospital Type *"
                  error={errors.type}
                  {...register('type', { required: 'Type is required' })}
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </FormSelect>
              </div>

              <FormSelect
                label="Status *"
                error={errors.status}
                {...register('status', { required: 'Status is required' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </FormSelect>
            </div>
          </FormCard>

          {/* Contact Information */}
          <FormCard title="Contact Information" icon={Phone}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Phone *"
                  type="tel"
                  placeholder="+91 98765 43210"
                  icon={Phone}
                  error={errors.phone}
                  {...register('phone', { required: 'Phone is required' })}
                />

                <FormInput
                  label="Email *"
                  type="email"
                  placeholder="hospital@example.com"
                  error={errors.email}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    }
                  })}
                />
              </div>

              <FormInput
                label="Website (optional)"
                placeholder="https://hospital.com"
                {...register('website')}
              />
            </div>
          </FormCard>
        </div>

        {/* Location */}
        <FormCard title="Location Details" icon={LocationOn}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormInput
                label="Address *"
                placeholder="Street address"
                icon={LocationOn}
                error={errors.address}
                {...register('address', { required: 'Address is required' })}
              />
            </div>

            <FormInput
              label="City *"
              placeholder="City"
              error={errors.city}
              {...register('city', { required: 'City is required' })}
            />

            <FormInput
              label="State *"
              placeholder="State"
              error={errors.state}
              {...register('state', { required: 'State is required' })}
            />

            <FormInput
              label="Zip Code *"
              placeholder="Zip code"
              error={errors.zipCode}
              {...register('zipCode', { required: 'Zip code is required' })}
            />

            <FormInput
              label="Country"
              {...register('country')}
              readOnly
            />
          </div>
        </FormCard>

        {/* Services */}
        <FormCard title="Available Services" icon={MedicalServices}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'is24x7', label: '24/7 Service' },
              { name: 'hasEmergency', label: 'Emergency' },
              { name: 'hasAmbulance', label: 'Ambulance' },
              { name: 'hasBloodBank', label: 'Blood Bank' },
            ].map((service) => (
              <label
                key={service.name}
                className="group relative flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all duration-200"
              >
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 transition-all duration-200"
                    {...register(service.name)}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
                  {service.label}
                </span>
              </label>
            ))}
          </div>
        </FormCard>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/hospitals')}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 flex items-center gap-2"
            disabled={loading}
          >
            <Cancel className="w-4 h-4" />
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-8 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-500/30 transition-all duration-200 flex items-center gap-2 transform active:scale-95"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Update Hospital' : 'Create Hospital'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HospitalFormPage;
