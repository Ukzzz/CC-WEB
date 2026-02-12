import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { resourceService } from '../../services/resource.service';
import { hospitalService } from '../../services/hospital.service';
import toast from 'react-hot-toast';

const ResourceFormPage = () => {
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
    formState: { errors },
  } = useForm({
    defaultValues: {
      hospital: '',
      resourceType: 'bed',
      category: 'general',
      total: 0,
      available: 0,
      occupied: 0,
      maintenance: 0,
      location: { floor: '', wing: '', ward: '' },
    },
  });

  useEffect(() => {
    fetchHospitals();
    if (isEdit) {
      fetchResource();
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

  const fetchResource = async () => {
    try {
      const response = await resourceService.getById(id);
      const resource = response.data.resource;
      reset({
        hospital: resource.hospital?._id || '',
        resourceType: resource.resourceType,
        category: resource.category || 'general',
        total: resource.total,
        available: resource.available,
        occupied: resource.occupied,
        maintenance: resource.maintenance || 0,
        location: resource.location || {},
      });
    } catch (error) {
      toast.error('Failed to load resource data');
      navigate('/resources');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (isEdit) {
        await resourceService.update(id, data);
        toast.success('Resource updated successfully');
      } else {
        await resourceService.create(data);
        toast.success('Resource created successfully');
      }

      navigate('/resources');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save resource';
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
          onClick={() => navigate('/resources')}
          className="p-2 hover:bg-gray-100 rounded-md text-gray-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="page-title">{isEdit ? 'Edit Resource' : 'Add Resource'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-6">
          <div className="card">
            <div className="card-body">
              <h2 className="font-semibold text-gray-900 mb-4">Resource Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                  <label className="input-label">Resource Type *</label>
                  <Controller
                    name="resourceType"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="input">
                        <option value="bed">Bed</option>
                        <option value="icu_bed">ICU Bed</option>
                        <option value="ventilator">Ventilator</option>
                        <option value="emergency_ward">Emergency Ward</option>
                        <option value="ambulance">Ambulance</option>
                        <option value="oxygen_cylinder">Oxygen Cylinder</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="input-label">Total *</label>
                  <input
                    type="number"
                    min="0"
                    className={`input ${errors.total ? 'border-danger-500' : ''}`}
                    {...register('total', { required: true, valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="input-label">Available *</label>
                  <input
                    type="number"
                    min="0"
                    className={`input ${errors.available ? 'border-danger-500' : ''}`}
                    {...register('available', { required: true, valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="input-label">Occupied</label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    {...register('occupied', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="input-label">Maintenance</label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    {...register('maintenance', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <h3 className="font-medium text-gray-700 mb-3 mt-6">Location (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">Floor</label>
                  <input className="input" {...register('location.floor')} />
                </div>
                <div>
                  <label className="input-label">Wing</label>
                  <input className="input" {...register('location.wing')} />
                </div>
                <div>
                  <label className="input-label">Ward</label>
                  <input className="input" {...register('location.ward')} />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
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
                {isEdit ? 'Update Resource' : 'Create Resource'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceFormPage;
