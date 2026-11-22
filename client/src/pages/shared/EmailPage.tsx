import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Mail, Send, History, Sparkles, Check, AlertCircle } from 'lucide-react';

export const EmailPage: React.FC = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sentLogs, setSentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    loadSentHistory();
  }, []);

  const loadSentHistory = async () => {
    try {
      const res = await apiFetch('/emails/sent');
      if (res.success && res.data) {
        setSentLogs(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !body) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const recipientList = to.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await apiFetch('/emails/send', {
        method: 'POST',
        body: JSON.stringify({
          to: recipientList,
          subject,
          body
        })
      });

      if (res.success) {
        setStatusMsg({ text: 'Email successfully dispatched through institutional relay.' });
        setTo('');
        setSubject('');
        setBody('');
        loadSentHistory();
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to dispatch email.', error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm">
        <h1 className="text-lg font-bold text-[#24232B] flex items-center space-x-2">
          <Mail className="w-5 h-5 text-[#7051C8]" />
          <span>CSE Department Email Dispatch</span>
        </h1>
        <p className="text-xs text-[#737784] mt-0.5">
          Communicate with faculty members, coordinators, and external student recipient groups
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Email Composer (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#E6E8ED] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#24232B] border-b border-gray-100 pb-3">
            Compose Academic Message
          </h2>

          {statusMsg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                statusMsg.error
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {statusMsg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSendEmail} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#24232B]">
                Recipients (comma-separated emails)
              </label>
              <input
                type="text"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="e.g. rahul.cse@anurag.edu.in, studentgroup.cse3a@anurag.edu.in"
                className="mt-1 w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24232B]">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Notice: Mid-Term Internal Evaluation Guidelines"
                className="mt-1 w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24232B]">Message Content</label>
              <textarea
                rows={8}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Respected Faculty / Dear Students,&#10;&#10;Greetings from CSE Department Anurag University..."
                className="mt-1 w-full text-xs p-3 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Transmitting...' : 'Dispatch Email'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sent History (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-[#24232B] border-b border-gray-100 pb-3 flex items-center space-x-2">
            <History className="w-4 h-4 text-[#7051C8]" />
            <span>Dispatched Mail History</span>
          </h2>

          <div className="mt-4 flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[500px]">
            {sentLogs.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#737784]">
                No sent records found.
              </div>
            ) : (
              sentLogs.map((log) => (
                <div key={log._id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-[#219653]">
                      {log.status}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#24232B] truncate">{log.subject}</h4>
                  <p className="text-[11px] text-[#737784] truncate">To: {log.to?.join(', ')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
