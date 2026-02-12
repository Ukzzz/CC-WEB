import { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedback.service';
import toast from 'react-hot-toast';

const FeedbackPage = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFeedback();
  }, [page]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackService.getAll({ page, limit: 12 });
      setFeedbackList(response.data.feedback);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="page-title">Patient Feedback</h1>
           <p className="page-subtitle">Reviews and ratings from users</p>
        </div>
        <button onClick={fetchFeedback} className="btn btn-secondary">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card h-40">
              <div className="card-body">
                <div className="flex gap-2 mb-2">
                   <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                   <div className="flex-1">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="w-16 h-3 bg-gray-100 rounded animate-pulse" />
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="w-full h-3 bg-gray-100 rounded animate-pulse" />
                   <div className="w-3/4 h-3 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : feedbackList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedbackList.map((item) => (
            <div key={item._id} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                      {item.userName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.userName}</h3>
                      <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`badge ${item.category === 'service' ? 'badge-primary' : 'badge-default'}`}>
                    {item.category}
                  </span>
                </div>
                
                <div className="mb-2 flex items-center">
                   {renderStars(item.rating)}
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-3">
                  "{item.comment}"
                </p>

                {item.hospital && (
                   <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                     Hospital: {item.hospital.name}
                   </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No feedback received yet.</p>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
             <button 
               className="btn btn-secondary" 
               disabled={page === 1} 
               onClick={() => setPage(p => Math.max(1, p - 1))}
             >
               Previous
             </button>
             <button 
               className="btn btn-secondary" 
               disabled={page === totalPages} 
               onClick={() => setPage(p => Math.min(totalPages, p + 1))}
             >
               Next
             </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
