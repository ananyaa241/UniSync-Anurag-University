import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Bell, Plus, CheckCircle, AlertTriangle, Trash2, Edit2 } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [targetAudience, setTargetAudience] = useState('ALL');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const res = await apiFetch('/announcements');
      if (res.success && res.data) {
        setAnnouncements(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        const res = await apiFetch(`/announcements/${editingAnnouncement._id}`, {
          method: 'PUT',
          body: JSON.stringify({ title, message, priority, targetAudience })
        });
        if (res.success) {
          setShowAddModal(false);
          setEditingAnnouncement(null);
          setTitle('');
          setMessage('');
          loadAnnouncements();
        }
      } else {
        const res = await apiFetch('/announcements', {
          method: 'POST',
          body: JSON.stringify({ title, message, priority, targetAudience })
        });
        if (res.success) {
          setShowAddModal(false);
          setTitle('');
          setMessage('');
          loadAnnouncements();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this circular?')) return;
    try {
      const res = await apiFetch(`/announcements/${id}`, { method: 'DELETE' });
      if (res.success) {
        loadAnnouncements();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement');
    }
  };

  const openEditModal = (a: any) => {
    setEditingAnnouncement(a);
    setTitle(a.title);
    setMessage(a.message);
    setPriority(a.priority);
    setTargetAudience(a.targetAudience);
    setShowAddModal(true);
  };

  const acknowledge = async (id: string) => {
    try {
      await apiFetch(`/announcements/${id}/acknowledge`, { method: 'POST' });
      loadAnnouncements();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[#24232B] flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#7654B8]" />
            <span>CSE Department Announcements & Circulars</span>
          </h1>
          <p className="text-xs text-[#737784]">
            Official circulars, NBA compliance alerts, exam circulars, and departmental notices
          </p>
        </div>

        {(user?.role === 'HOD' || user?.role === 'COORDINATOR') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#7654B8] hover:bg-[#5f3c9d] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a._id} className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-[#7654B8]">
                  {a.targetAudience}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-[#E47B32]">
                  {a.priority}
                </span>
              </div>
              <span className="text-[11px] text-[#737784]">
                {new Date(a.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h3 className="text-sm font-bold text-[#24232B]">{a.title}</h3>
            <p className="text-xs text-[#737784] leading-relaxed whitespace-pre-line">{a.message}</p>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#737784]">
              <span>Issued by: {a.createdBy?.fullName || 'Dean CSE'}</span>
              <div className="flex items-center space-x-2">
                {user?.role === 'HOD' && (
                  <>
                    <button
                      onClick={() => openEditModal(a)}
                      className="px-2.5 py-1 bg-purple-50 text-[#7654B8] hover:bg-purple-100 rounded text-xs font-semibold flex items-center space-x-1"
                      title="Edit Notice"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="px-2.5 py-1 bg-red-50 text-[#D94B4B] hover:bg-red-100 rounded text-xs font-semibold flex items-center space-x-1"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => acknowledge(a._id)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium"
                >
                  Acknowledge Receipt
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E6E8ED] max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-[#24232B] mb-4">
              {editingAnnouncement ? 'Edit Department Circular' : 'Publish Department Circular'}
            </h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#24232B]">Circular Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule of Class Review Committee Meetings"
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24232B]">Notice Content</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Circular text..."
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                  >
                    <option value="ALL">All CSE Staff</option>
                    <option value="FACULTY">Faculty Only</option>
                    <option value="COORDINATORS">Coordinators Only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7654B8] text-white rounded text-xs font-semibold hover:bg-[#5f3c9d]"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
