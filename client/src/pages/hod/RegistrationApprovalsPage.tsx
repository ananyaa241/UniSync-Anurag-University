import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { ShieldCheck, Check, X, Clock, UserCheck } from 'lucide-react';

export const RegistrationApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      const res = await apiFetch('/users/registrations');
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const handleAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await apiFetch('/users/registrations/approve', {
        method: 'POST',
        body: JSON.stringify({ userId, action })
      });
      if (res.success) {
        loadPendingRequests();
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm">
        <h1 className="text-lg font-bold text-[#24232B] flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-[#7051C8]" />
          <span>Dean Staff Registration Approvals & Role Verification</span>
        </h1>
        <p className="text-xs text-[#737784] mt-0.5">
          Review, approve, or reject newly registered faculty and coordinator accounts before granting access to CSE records
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#E6E8ED] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E6E8ED] bg-[#F7F8FA] flex items-center justify-between">
          <span className="text-xs font-bold text-[#24232B]">
            Pending Department Registrations ({requests.length})
          </span>
        </div>

        <div className="divide-y divide-[#E6E8ED]">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#737784]">
              No pending registrations awaiting approval.
            </div>
          ) : (
            requests.map((r) => (
              <div key={r._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#24232B]">{r.fullName}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#737784] mt-0.5">
                    <span>Email: {r.email}</span>
                    <span>Emp ID: {r.employeeId}</span>
                    <span>Requested Role: <strong className="text-[#7051C8]">{r.role}</strong></span>
                    <span>Designation: {r.designation}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleAction(r._id, 'APPROVE')}
                    className="px-3.5 py-1.5 bg-[#219653] hover:bg-[#1a7742] text-white rounded-md text-xs font-semibold flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleAction(r._id, 'REJECT')}
                    className="px-3 py-1.5 bg-[#D94B4B] hover:bg-[#b53c3c] text-white rounded-md text-xs font-semibold flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
