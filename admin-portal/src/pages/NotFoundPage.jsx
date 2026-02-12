import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <p className="text-9xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
