import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { hospitalService } from '../../services/hospital.service';
import toast from 'react-hot-toast';

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
      country: 'India',
      phone: '',
      email: '',
      website: '',
      is24x7: true,
      hasEmergency: true,
      hasAmbulance: false,
      hasBloodBank: false,
    },
  });

  const watchType = watch('type');
  const watchStatus = watch('status');

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
        country: hospital.location?.country || 'India',
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
      },
      country: data.country,
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
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/hospitals')}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Hospitals
        </button>
        <h1 className="page-title">{isEditing ? 'Edit Hospital' : 'Add New Hospital'}</h1>
        <p className="page-subtitle">
          {isEditing ? 'Update hospital information' : 'Register a new hospital in the system'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Hospital Name *</label>
                <input
                  type="text"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Enter hospital name"
                  {...register('name', { required: 'Hospital name is required' })}
                />
                {errors.name && <p className="text-danger-600 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="input-label">Hospital Code *</label>
                <input
                  type="text"
                  className={`input ${errors.code ? 'input-error' : ''}`}
                  placeholder="e.g., HOSP001"
                  {...register('code', { required: 'Hospital code is required' })}
                />
                {errors.code && <p className="text-danger-600 text-xs mt-1">{errors.code.message}</p>}
              </div>

              <div>
                <label className="input-label">Hospital Type *</label>
                <select
                  className={`input ${errors.type ? 'input-error' : ''}`}
                  {...register('type', { required: 'Type is required' })}
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div>
                <label className="input-label">Status *</label>
                <select
                  className={`input ${errors.status ? 'input-error' : ''}`}
                  {...register('status', { required: 'Status is required' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Address *</label>
                <input
                  type="text"
                  className={`input ${errors.address ? 'input-error' : ''}`}
                  placeholder="Street address"
                  {...register('address', { required: 'Address is required' })}
                />
                {errors.address && <p className="text-danger-600 text-xs mt-1">{errors.address.message}</p>}
              </div>

              <div>
                <label className="input-label">City *</label>
                <input
                  type="text"
                  className={`input ${errors.city ? 'input-error' : ''}`}
                  placeholder="City"
                  {...register('city', { required: 'City is required' })}
                />
                {errors.city && <p className="text-danger-600 text-xs mt-1">{errors.city.message}</p>}
              </div>

              <div>
                <label className="input-label">State *</label>
                <input
                  type="text"
                  className={`input ${errors.state ? 'input-error' : ''}`}
                  placeholder="State"
                  {...register('state', { required: 'State is required' })}
                />
                {errors.state && <p className="text-danger-600 text-xs mt-1">{errors.state.message}</p>}
              </div>

              <div>
                <label className="input-label">Zip Code *</label>
                <input
                  type="text"
                  className={`input ${errors.zipCode ? 'input-error' : ''}`}
                  placeholder="Zip code"
                  {...register('zipCode', { required: 'Zip code is required' })}
                />
                {errors.zipCode && <p className="text-danger-600 text-xs mt-1">{errors.zipCode.message}</p>}
              </div>

              <div>
                <label className="input-label">Country</label>
                <input
                  type="text"
                  className="input"
                  {...register('country')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Phone *</label>
                <input
                  type="tel"
                  className={`input ${errors.phone ? 'input-error' : ''}`}
                  placeholder="+91 98765 43210"
                  {...register('phone', { required: 'Phone is required' })}
                />
                {errors.phone && <p className="text-danger-600 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="input-label">Email *</label>
                <input
                  type="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="hospital@example.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    }
                  })}
                />
                {errors.email && <p className="text-danger-600 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Website (optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="https://hospital.com"
                  {...register('website')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'is24x7', label: '24/7 Service' },
                { name: 'hasEmergency', label: 'Emergency' },
                { name: 'hasAmbulance', label: 'Ambulance' },
                { name: 'hasBloodBank', label: 'Blood Bank' },
              ].map((service) => (
                <label
                  key={service.name}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    {...register(service.name)}
                  />
                  <span className="text-sm text-gray-700">{service.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/hospitals')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditing ? 'Update Hospital' : 'Create Hospital'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HospitalFormPage;
