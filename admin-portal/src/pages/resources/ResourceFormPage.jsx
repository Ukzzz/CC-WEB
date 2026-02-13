import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { resourceService } from '../../services/resource.service';
import { hospitalService } from '../../services/hospital.service';
import toast from 'react-hot-toast';
import { 
  Inventory, 
  Category, 
  MeetingRoom, 
  LocalHospital, 
  Save, 
  Cancel,
  Numbers 
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import FormCard from '../../components/common/FormCard';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';

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
        title={isEdit ? 'Edit Resource' : 'Add Resource'}
        subtitle={isEdit ? 'Update resource availability and details' : 'Register a new resource'}
        backUrl="/resources"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <FormCard title="Resource Details" icon={Inventory}>
              <div className="space-y-4">
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

                  <Controller
                    name="resourceType"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        label="Resource Type *"
                        icon={Category}
                        {...field}
                      >
                        <option value="bed">Bed</option>
                        <option value="icu_bed">ICU Bed</option>
                        <option value="ventilator">Ventilator</option>
                        <option value="emergency_ward">Emergency Ward</option>
                        <option value="ambulance">Ambulance</option>
                        <option value="oxygen_cylinder">Oxygen Cylinder</option>
                      </FormSelect>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormInput
                    label="Total *"
                    type="number"
                    min="0"
                    icon={Numbers}
                    error={errors.total}
                    {...register('total', { required: true, valueAsNumber: true })}
                  />

                  <FormInput
                    label="Available *"
                    type="number"
                    min="0"
                    icon={Numbers}
                    error={errors.available}
                    {...register('available', { required: true, valueAsNumber: true })}
                  />

                  <FormInput
                    label="Occupied"
                    type="number"
                    min="0"
                    icon={Numbers}
                    {...register('occupied', { valueAsNumber: true })}
                  />

                  <FormInput
                    label="Maintenance"
                    type="number"
                    min="0"
                    icon={Numbers}
                    {...register('maintenance', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </FormCard>

            {/* Location Info */}
            <FormCard title="Location Details" icon={MeetingRoom}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput
                  label="Floor"
                  placeholder="e.g. 2nd Floor"
                  {...register('location.floor')}
                />

                <FormInput
                  label="Wing"
                  placeholder="e.g. North Wing"
                  {...register('location.wing')}
                />

                <FormInput
                  label="Ward"
                  placeholder="e.g. Ward A"
                  {...register('location.ward')}
                />
              </div>
            </FormCard>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <FormCard title="Summary" className="bg-primary-50 border-primary-100">
               <div className="text-sm text-gray-600">
                 <p className="mb-2">Review your resource details before saving.</p>
                 <ul className="list-disc list-inside space-y-1 text-xs">
                   <li>Ensure total count matches available + occupied + maintenance</li>
                   <li>Check location accuracy</li>
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{isEdit ? 'Update Resource' : 'Create Resource'}</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/resources')}
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

export default ResourceFormPage;
