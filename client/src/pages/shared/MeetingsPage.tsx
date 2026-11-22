import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Meeting } from '../../types';
import { Video, Plus, Calendar, Clock, ExternalLink, Clipboard, Check, Filter, X, Edit, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Form states for Create & Edit
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('14:30');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [googleMeetLink, setGoogleMeetLink] = useState('');

  // Target Roles scope checkboxes:
  // For Dean (HOD): can select Faculty, Academic Coordinator
  // For Academic Coordinator: can select Faculty, Dean (HOD)
  const [targetRoles, setTargetRoles] = useState<string[]>(['FACULTY']);
  const [isListeningForClipboard, setIsListeningForClipboard] = useState(false);
  const [pastedStatus, setPastedStatus] = useState(false);

  // Today's date in IST format YYYY-MM-DD for min date attribute
  const todayIST = (() => {
    const d = new Date();
    // UTC+5.5
    const istMs = d.getTime() + 5.5 * 60 * 60 * 1000;
    const istDate = new Date(istMs);
    const yyyy = istDate.getUTCFullYear();
    const mm = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(istDate.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    const handleWindowFocus = async () => {
      if (!showAddModal || !isListeningForClipboard) return;
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text) {
            const trimmed = text.trim();
            const match = trimmed.match(/https?:\/\/meet\.google\.com\/[a-zA-Z0-9_-]+/i) ||
                          trimmed.match(/meet\.google\.com\/[a-zA-Z0-9_-]+/i);
            if (match) {
              const fullUrl = match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
              setGoogleMeetLink(fullUrl);
              setPastedStatus(true);
              setIsListeningForClipboard(false);
              setTimeout(() => setPastedStatus(false), 3500);
            }
          }
        }
      } catch {
        // Clipboard read permission
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [showAddModal, isListeningForClipboard]);

  // One-click Paste from Clipboard button
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const trimmed = text.trim();
          const match = trimmed.match(/https?:\/\/meet\.google\.com\/[a-zA-Z0-9_-]+/i) ||
                        trimmed.match(/meet\.google\.com\/[a-zA-Z0-9_-]+/i);
          if (match) {
            const fullUrl = match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
            setGoogleMeetLink(fullUrl);
            setPastedStatus(true);
            setTimeout(() => setPastedStatus(false), 3000);
          } else {
            setGoogleMeetLink(trimmed);
            setPastedStatus(true);
            setTimeout(() => setPastedStatus(false), 3000);
          }
        }
      }
    } catch {
      alert('Clipboard access denied. Please paste manually into the textbox.');
    }
  };

  const loadMeetings = async () => {
    try {
      const res = await apiFetch('/meetings');
      if (res.success && res.data) {
        setMeetings(res.data);
      }
    } catch {
      // Ignore
    }
  };

  // Real-time IST Status Calculation
  const computeMeetingStatus = (m: Meeting): 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' => {
    if (m.status === 'CANCELLED') return 'CANCELLED';
    if (m.status === 'COMPLETED') return 'COMPLETED';

    const now = new Date();
    const meetingDate = new Date(m.date);
    const [hours, minutes] = (m.startTime || '00:00').split(':').map(Number);
    const y = meetingDate.getFullYear();
    const mon = meetingDate.getMonth();
    const d = meetingDate.getDate();

    // IST is UTC + 5:30 -> UTC timestamp = Date.UTC(...) - 5.5 hours
    const startUtc = Date.UTC(y, mon, d, hours, minutes) - (5.5 * 60 * 60 * 1000);
    const endUtc = startUtc + (m.durationMinutes || 60) * 60 * 1000;
    const nowTime = now.getTime();

    if (nowTime > endUtc) return 'COMPLETED';
    if (nowTime >= startUtc && nowTime <= endUtc) return 'IN_PROGRESS';
    return 'SCHEDULED';
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleMeetLink.trim()) {
      alert('Please produce and paste your Google Meet link.');
      return;
    }
    if (targetRoles.length === 0) {
      alert('Please select at least one recipient role scope (e.g. Faculty).');
      return;
    }
    try {
      const res = await apiFetch('/meetings', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          date,
          startTime,
          durationMinutes,
          googleMeetLink,
          targetRoles
        })
      });

      if (res.success) {
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        setGoogleMeetLink('');
        setTargetRoles(['FACULTY']);
        loadMeetings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create meeting');
    }
  };

  const handleEditMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;
    try {
      const res = await apiFetch(`/meetings/${editingMeeting._id}/edit`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          description,
          date,
          startTime,
          durationMinutes,
          googleMeetLink
        })
      });

      if (res.success) {
        setEditingMeeting(null);
        loadMeetings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update meeting');
    }
  };

  const handleCancelMeeting = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this meeting? All participants will be notified.')) return;
    try {
      const res = await apiFetch(`/meetings/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        loadMeetings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel meeting');
    }
  };

  const openEditModal = (m: Meeting) => {
    setEditingMeeting(m);
    setTitle(m.title);
    setDescription(m.description || '');
    setDate(new Date(m.date).toISOString().split('T')[0]);
    setStartTime(m.startTime);
    setDurationMinutes(m.durationMinutes);
    setGoogleMeetLink(m.googleMeetLink || '');
  };

  // Filtered meetings list
  const filteredMeetings = meetings.filter((m) => {
    const status = computeMeetingStatus(m);
    if (activeFilter === 'ALL') return true;
    return status === activeFilter;
  });

  const scheduledCount = meetings.filter((m) => computeMeetingStatus(m) === 'SCHEDULED').length;
  const inProgressCount = meetings.filter((m) => computeMeetingStatus(m) === 'IN_PROGRESS').length;
  const completedCount = meetings.filter((m) => computeMeetingStatus(m) === 'COMPLETED').length;
  const cancelledCount = meetings.filter((m) => computeMeetingStatus(m) === 'CANCELLED').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[#24232B] flex items-center space-x-2">
            <Video className="w-5 h-5 text-[#7051C8]" />
            <span>Academic Meetings & Google Meet</span>
          </h1>
          <p className="text-xs text-[#737784]">
            Department of CSE | Real-time Indian Standard Time (IST) schedule with automated status tracking
          </p>
        </div>

        {(user?.role === 'HOD' || user?.role === 'COORDINATOR') && (
          <button
            onClick={() => {
              setTitle('');
              setDescription('');
              setDate(todayIST);
              setStartTime('14:30');
              setDurationMinutes(60);
              setGoogleMeetLink('');
              setTargetRoles(['FACULTY']);
              setShowAddModal(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        )}
      </div>

      {/* Visual Color Legend Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-[#737784] font-medium">
          <Filter className="w-3.5 h-3.5 text-[#7051C8]" />
          <span>Meeting Status Legend:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#219653]"></span>
            <span className="text-[#219653]">Green: Upcoming / Scheduled</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#3578D4] animate-pulse"></span>
            <span className="text-[#3578D4]">Blue: In Progress (Live)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#D94B4B]"></span>
            <span className="text-[#D94B4B]">Red: Completed</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-400"></span>
            <span className="text-gray-500">Gray: Cancelled</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E6E8ED] pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeFilter === 'ALL'
              ? 'bg-[#7051C8] text-white shadow-sm'
              : 'text-[#737784] hover:bg-gray-100'
          }`}
        >
          All Meetings ({meetings.length})
        </button>
        <button
          onClick={() => setActiveFilter('SCHEDULED')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
            activeFilter === 'SCHEDULED'
              ? 'bg-[#219653] text-white shadow-sm'
              : 'text-[#219653] hover:bg-green-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>Upcoming ({scheduledCount})</span>
        </button>
        <button
          onClick={() => setActiveFilter('IN_PROGRESS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
            activeFilter === 'IN_PROGRESS'
              ? 'bg-[#3578D4] text-white shadow-sm'
              : 'text-[#3578D4] hover:bg-blue-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
          <span>In Progress ({inProgressCount})</span>
        </button>
        <button
          onClick={() => setActiveFilter('COMPLETED')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
            activeFilter === 'COMPLETED'
              ? 'bg-[#D94B4B] text-white shadow-sm'
              : 'text-[#D94B4B] hover:bg-red-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>Completed ({completedCount})</span>
        </button>
        <button
          onClick={() => setActiveFilter('CANCELLED')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
            activeFilter === 'CANCELLED'
              ? 'bg-gray-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>Cancelled ({cancelledCount})</span>
        </button>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeetings.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-xs text-[#737784] rounded-xl border border-[#E6E8ED]">
            No meetings found in this category.
          </div>
        ) : (
          filteredMeetings.map((m) => {
            const status = computeMeetingStatus(m);
            const isOrganizerOrAdmin =
              user?.role === 'HOD' ||
              user?.role === 'COORDINATOR' ||
              (m.organizerId && (m.organizerId as any)._id === (user?._id || (user as any)?.id));

            // Card styling by status
            const cardTheme = {
              SCHEDULED: {
                border: 'border-l-4 border-l-[#219653] border-green-200 bg-white hover:border-green-400',
                badge: 'bg-green-100 text-[#219653] border border-green-300',
                label: 'Scheduled (Upcoming)'
              },
              IN_PROGRESS: {
                border: 'border-l-4 border-l-[#3578D4] border-blue-200 bg-blue-50/40 hover:border-blue-400',
                badge: 'bg-blue-100 text-[#3578D4] border border-blue-300 animate-pulse font-bold',
                label: '● Live In Progress'
              },
              COMPLETED: {
                border: 'border-l-4 border-l-[#D94B4B] border-red-200 bg-red-50/30 text-gray-700 hover:border-red-400',
                badge: 'bg-red-100 text-[#D94B4B] border border-red-300 font-bold',
                label: 'Completed'
              },
              CANCELLED: {
                border: 'border-l-4 border-l-gray-400 border-gray-300 bg-gray-100/70 text-gray-500 opacity-80',
                badge: 'bg-gray-200 text-gray-600 border border-gray-300',
                label: 'Cancelled'
              }
            }[status];

            return (
              <div
                key={m._id}
                className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between transition-all ${cardTheme.border}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cardTheme.badge}`}>
                      {cardTheme.label}
                    </span>
                    <span className="text-xs text-[#737784] flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{m.durationMinutes} mins (IST)</span>
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold ${status === 'COMPLETED' ? 'text-[#D94B4B]' : 'text-[#24232B]'}`}>
                    {m.title}
                  </h3>
                  <p className="text-xs text-[#737784] mt-1 line-clamp-2">{m.description}</p>

                  <div className="mt-4 p-3 bg-[#F7F8FA] rounded-lg text-xs space-y-1.5 border border-[#E6E8ED]">
                    <div className="flex items-center space-x-2 text-[#24232B]">
                      <Calendar className="w-3.5 h-3.5 text-[#7051C8]" />
                      <span className="font-semibold">
                        {new Date(m.date).toLocaleDateString()} at {m.startTime} IST
                      </span>
                    </div>
                    <div className="text-[11px] text-[#737784] pt-1">
                      <span className="font-semibold text-gray-600">Organizer:</span>{' '}
                      {(m.organizerId as any)?.fullName || 'Academic Leadership'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#737784]">
                    {m.participants?.length || 0} Participants
                  </span>

                  <div className="flex items-center space-x-2">
                    {/* Authorized Edit/Cancel Buttons */}
                    {isOrganizerOrAdmin && status !== 'CANCELLED' && status !== 'COMPLETED' && (
                      <>
                        <button
                          onClick={() => openEditModal(m)}
                          title="Edit Meeting"
                          className="p-1.5 text-gray-600 hover:text-[#7051C8] hover:bg-purple-50 rounded transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCancelMeeting(m._id)}
                          title="Cancel Meeting"
                          className="p-1.5 text-gray-600 hover:text-[#D94B4B] hover:bg-red-50 rounded transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {/* Join Google Meet Button */}
                    {m.googleMeetLink && status !== 'CANCELLED' && (
                      <a
                        href={m.googleMeetLink}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-white rounded text-xs font-semibold shadow-sm transition-colors ${
                          status === 'IN_PROGRESS'
                            ? 'bg-[#3578D4] hover:bg-[#2860ab] animate-bounce'
                            : status === 'COMPLETED'
                            ? 'bg-gray-500 hover:bg-gray-600'
                            : 'bg-[#219653] hover:bg-[#197541]'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{status === 'IN_PROGRESS' ? 'Join Live Now' : 'Join Google Meet'}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E6E8ED] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#24232B]">Schedule Academic Meeting</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#24232B]">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. NBA Accreditation Preparedness"
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24232B]">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief meeting scope..."
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Date (IST)</label>
                  <input
                    type="date"
                    required
                    min={todayIST}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md focus:ring-1 focus:ring-[#7051C8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Start Time (IST)</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md focus:ring-1 focus:ring-[#7051C8]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-[#24232B]">Google Meet URL</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#219653] hover:text-[#197541] hover:underline"
                    >
                      <Clipboard className="w-3 h-3" />
                      <span>Paste from Clipboard</span>
                    </button>
                    <span className="text-gray-300">|</span>
                    <a
                      href="https://meet.google.com/new"
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setIsListeningForClipboard(true)}
                      className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#7051C8] hover:text-[#50305F] hover:underline"
                    >
                      <span>Generate on Google Meet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={googleMeetLink}
                    onChange={(e) => setGoogleMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className={`w-full text-xs p-2 pr-24 border rounded-md focus:ring-1 focus:ring-[#7051C8] focus:border-[#7051C8] transition-colors ${
                      pastedStatus ? 'border-[#219653] bg-green-50/50' : 'border-[#E6E8ED]'
                    }`}
                  />
                  {pastedStatus && (
                    <span className="absolute right-2.5 top-2 text-[10px] text-[#219653] font-semibold flex items-center space-x-1 bg-green-100 px-1.5 py-0.5 rounded">
                      <Check className="w-3 h-3" />
                      <span>Link Detected!</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Target Scope Checkboxes */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-semibold text-[#24232B] mb-1.5">
                  Send Meeting Reminders & Invitations To:
                </label>
                <div className="flex items-center space-x-4 bg-[#F7F8FA] p-2.5 rounded-lg border border-[#E6E8ED]">
                  {/* Faculty Checkbox */}
                  <label className="flex items-center space-x-2 text-xs text-[#24232B] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={targetRoles.includes('FACULTY')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetRoles([...targetRoles, 'FACULTY']);
                        } else {
                          setTargetRoles(targetRoles.filter((r) => r !== 'FACULTY'));
                        }
                      }}
                      className="rounded text-[#7051C8] focus:ring-[#7051C8]"
                    />
                    <span className="font-medium">Faculty Members</span>
                  </label>

                  {/* For Dean (HOD): Academic Coordinator checkbox */}
                  {user?.role === 'HOD' && (
                    <label className="flex items-center space-x-2 text-xs text-[#24232B] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={targetRoles.includes('COORDINATOR')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTargetRoles([...targetRoles, 'COORDINATOR']);
                          } else {
                            setTargetRoles(targetRoles.filter((r) => r !== 'COORDINATOR'));
                          }
                        }}
                        className="rounded text-[#7051C8] focus:ring-[#7051C8]"
                      />
                      <span className="font-medium">Academic Coordinator</span>
                    </label>
                  )}

                  {/* For Academic Coordinator: Dean checkbox */}
                  {user?.role === 'COORDINATOR' && (
                    <label className="flex items-center space-x-2 text-xs text-[#24232B] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={targetRoles.includes('HOD')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTargetRoles([...targetRoles, 'HOD']);
                          } else {
                            setTargetRoles(targetRoles.filter((r) => r !== 'HOD'));
                          }
                        }}
                        className="rounded text-[#7051C8] focus:ring-[#7051C8]"
                      />
                      <span className="font-medium">Dean, CSE</span>
                    </label>
                  )}
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
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Meeting Modal */}
      {editingMeeting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E6E8ED] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#24232B]">Edit Academic Meeting</h2>
              <button onClick={() => setEditingMeeting(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditMeeting} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#24232B]">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24232B]">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Date (IST)</label>
                  <input
                    type="date"
                    required
                    min={todayIST}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md focus:ring-1 focus:ring-[#7051C8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Start Time (IST)</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md focus:ring-1 focus:ring-[#7051C8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24232B]">Google Meet URL</label>
                <input
                  type="url"
                  required
                  value={googleMeetLink}
                  onChange={(e) => setGoogleMeetLink(e.target.value)}
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingMeeting(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7051C8] text-white rounded text-xs font-semibold hover:bg-[#50305F]"
                >
                  Update Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
