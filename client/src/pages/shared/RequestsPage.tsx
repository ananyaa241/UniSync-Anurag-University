import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, Plus, Check, Clock } from 'lucide-react';

export const RequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Laboratory Resources');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [reviewerRole, setReviewerRole] = useState<'COORDINATOR' | 'HOD'>('COORDINATOR');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const res = await apiFetch('/requests');
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/requests', {
        method: 'POST',
        body: JSON.stringify({ title, category, description, priority, reviewerRole })
      });
      if (res.success) {
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        loadRequests();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
    }
  };

  const handleReviewAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiFetch(`/requests/${id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      loadRequests();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[#24232B] flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-[#7051C8]" />
            <span>Faculty Requests, Lab Requisitions & Extensions</span>
          </h1>
          <p className="text-xs text-[#737784]">
            Submit infrastructure needs, software licenses, lab equipment, or task deadline extensions
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white p-12 text-center text-xs text-[#737784] rounded-xl border border-[#E6E8ED]">
            No active faculty requests.
          </div>
        ) : (
          requests.map((r) => {
            const canReview =
              (user?.role === 'HOD' || user?.role === 'COORDINATOR') &&
              r.status === 'SUBMITTED';

            return (
              <div key={r._id} className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-[#7051C8]">
                      {r.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.status === 'APPROVED'
                          ? 'bg-green-100 text-[#219653]'
                          : r.status === 'REJECTED'
                          ? 'bg-red-100 text-[#D94B4B]'
                          : 'bg-amber-100 text-[#D99A22]'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#737784]">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#24232B]">{r.title}</h3>
                <p className="text-xs text-[#737784] leading-relaxed whitespace-pre-line">{r.description}</p>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#737784]">
                  <span>Submitted by: {r.facultyId?.fullName} ({r.facultyId?.employeeId})</span>

                  {canReview && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReviewAction(r._id, 'APPROVED')}
                        className="px-3 py-1 bg-[#219653] hover:bg-[#1a7742] text-white rounded text-xs font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewAction(r._id, 'REJECTED')}
                        className="px-3 py-1 bg-[#D94B4B] hover:bg-[#b03b3b] text-white rounded text-xs font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E6E8ED]">
            <h2 className="text-base font-bold text-[#24232B] mb-4">Submit Faculty Request</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#24232B]">Request Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MySQL Workbench Installation in Lab 3"
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24232B]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                >
                  <option value="Laboratory Resources">Laboratory Resources</option>
                  <option value="Software Requirements">Software Requirements</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Teaching Materials">Teaching Materials</option>
                  <option value="Deadline Extension">Deadline Extension</option>
                  <option value="Workload Adjustment">Workload Adjustment</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24232B]">Detailed Justification</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain requirement, student batch size, or reason..."
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
                  <label className="block text-xs font-medium text-[#24232B]">Route Request To</label>
                  <select
                    value={reviewerRole}
                    onChange={(e) => setReviewerRole(e.target.value as any)}
                    className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                  >
                    <option value="COORDINATOR">Academic Coordinator</option>
                    <option value="HOD">Dean</option>
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
                  className="px-4 py-2 bg-[#7051C8] text-white rounded text-xs font-semibold hover:bg-[#50305F]"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
