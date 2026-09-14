import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, PlusCircle, X, Loader2, Trash2,Bell } from 'lucide-react';
import api from '../api';

export default function ResidentDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [file, setFile] = useState<File | null>(null);
  const [notices, setNotices] = useState<any[]>([]);

  const userName = localStorage.getItem('name') || 'Resident';

const fetchComplaints = async () => {
  try {
    // Fetch both complaints and notices at the same time
    const [complaintsRes, noticesRes] = await Promise.all([
      api.get('/complaints'),
      api.get('/notices')
    ]);
    setComplaints(complaintsRes.data);
    setNotices(noticesRes.data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let photoUrl = '';

    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'society-images'); // <-- REPLACE THIS

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/dgqqveu3/image/upload`, // <-- REPLACE THIS
          { method: 'POST', body: formData }
        );
        const cloudinaryData = await cloudinaryRes.json();
        photoUrl = cloudinaryData.secure_url;
      }

      await api.post('/complaints', {
        title,
        category,
        description,
        priority,
        photoUrl,
      });

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchComplaints(); 

    } catch (error) {
      console.error('Failed to submit complaint:', error);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Delete Function
  const handleDelete = async (id: string) => {
    // Show a quick confirmation popup so users don't delete by accident
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    
    try {
      await api.delete(`/complaints/${id}`);
      // Remove it from the screen immediately without reloading the page
      setComplaints(complaints.filter((complaint) => complaint.id !== id));
    } catch (error) {
      console.error('Failed to delete complaint:', error);
      alert('Failed to delete the complaint.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Society Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium">Hello, {userName}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors cursor-pointer">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 mt-6">
        {notices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" /> Society Notices
            </h2>
            <div className="grid gap-3">
              {notices.map(notice => (
                <div key={notice.id} className={`p-4 rounded-xl border ${notice.isUrgent ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold ${notice.isUrgent ? 'text-red-800' : 'text-blue-800'}`}>{notice.title}</h3>
                    <span className="text-xs text-gray-500">{new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className={`text-sm ${notice.isUrgent ? 'text-red-900' : 'text-gray-700'}`}>{notice.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Complaints</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" /> Raise Complaint
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading your complaints...</p>
        ) : complaints.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">You haven't raised any complaints yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{complaint.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{complaint.category} • Priority: {complaint.priority}</p>
                </div>
                <div className="flex items-center gap-4">
                  {complaint.photoUrl && (
                    <a href={complaint.photoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                      View Photo
                    </a>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium 
                    ${complaint.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' : 
                      complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {complaint.status}
                  </span>
                  
                  {/* NEW: Delete Button */}
                  <button 
                    onClick={() => handleDelete(complaint.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete complaint"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Overlay Code Remains Exactly the Same... */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Raise New Complaint</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="E.g. Leaking pipe in bathroom" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Provide details about the issue..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-70 cursor-pointer">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}