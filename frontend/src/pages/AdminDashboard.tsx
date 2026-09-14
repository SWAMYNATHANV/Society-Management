import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, AlertCircle, Clock, Loader2, Megaphone, Send, Trash2 } from 'lucide-react';
import api from '../api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for creating a notice
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const userName = localStorage.getItem('name') || 'Admin';

  const fetchData = async () => {
    try {
      const [metricsRes, complaintsRes, noticesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/complaints'),
        api.get('/notices')
      ]);
      setMetrics(metricsRes.data);
      setComplaints(complaintsRes.data);
      setNotices(noticesRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/complaints/${id}/status`, { status: newStatus });
      fetchData();
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/notices', { title: noticeTitle, content: noticeContent, isUrgent });
      setNoticeTitle('');
      setNoticeContent('');
      setIsUrgent(false);
      fetchData();
    } catch (error) {
      alert('Failed to publish notice.');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Delete this notice permanently?')) return;
    try {
      await api.delete(`/notices/${id}`);
      setNotices(notices.filter(notice => notice.id !== id));
    } catch (error) {
      alert('Failed to delete notice.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">Admin Control Center</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium">Manager: {userName}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 cursor-pointer">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-6">
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-full"><LayoutDashboard className="w-8 h-8" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Complaints</p>
                <h3 className="text-2xl font-bold text-gray-900">{metrics.totalComplaints}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-4 bg-yellow-50 text-yellow-600 rounded-full"><Clock className="w-8 h-8" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Issues</p>
                <h3 className="text-2xl font-bold text-gray-900">{complaints.filter(c => c.status !== 'RESOLVED').length}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex items-center gap-4">
              <div className="p-4 bg-red-50 text-red-600 rounded-full"><AlertCircle className="w-8 h-8" /></div>
              <div>
                <p className="text-sm font-medium text-red-500">Overdue (&gt;{metrics.overdueThresholdDays} Days)</p>
                <h3 className="text-2xl font-bold text-red-600">{metrics.overdueCount}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" /> Broadcast Notice
            </h2>
            <form onSubmit={handleCreateNotice} className="space-y-4">
              <input type="text" required placeholder="Notice Title" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea required rows={3} placeholder="Notice Details..." value={noticeContent} onChange={e => setNoticeContent(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} className="w-4 h-4 rounded text-blue-600" /> Mark as Urgent
              </label>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer">
                <Send className="w-4 h-4" /> Publish
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Notices</h2>
            <div className="space-y-3">
              {notices.map(notice => (
                <div key={notice.id} className={`p-4 border rounded-lg ${notice.isImportant ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex justify-between items-start mb-1">
                    {/* Notice Title and Date wrapped in a div so they stay on the left */}
                    <div>
                      <h3 className={`font-semibold ${notice.isImportant ? 'text-red-800' : 'text-gray-900'}`}>{notice.title}</h3>
                      <span className="text-xs text-gray-500">{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                    {/* Delete Button added to the right */}
                    <button 
                      onClick={() => handleDeleteNotice(notice.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">{notice.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Complaints</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-600">
                <th className="p-4">Resident</th>
                <th className="p-4">Issue details</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{complaint.createdBy?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{complaint.title}</p>
                    <p className="text-sm text-gray-600 truncate max-w-xs">{complaint.description}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${complaint.priority === 'HIGH' ? 'bg-red-100 text-red-700' : complaint.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{complaint.priority}</span>
                  </td>
                  <td className="p-4">
                    <select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 outline-none cursor-pointer ${complaint.status === 'OPEN' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' : complaint.status === 'IN_PROGRESS' ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-green-200 bg-green-50 text-green-800'}`}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}