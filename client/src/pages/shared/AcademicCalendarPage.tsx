import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, CheckSquare, Video } from 'lucide-react';

export const AcademicCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        apiFetch('/tasks'),
        apiFetch('/meetings')
      ]);
      if (tRes.success) setTasks(tRes.data);
      if (mRes.success) setMeetings(mRes.data);
    } catch {
      // Ignore
    }
  };

  // Filter meetings: Do not show meetings that are over in real-world Indian Standard Time (IST)
  const now = new Date();
  const activeMeetings = meetings.filter((m) => {
    if (m.status === 'COMPLETED' || m.status === 'CANCELLED') return false;
    // Calculate meeting end time in UTC/IST
    const meetingDate = new Date(m.date);
    const [hours, minutes] = (m.startTime || '00:00').split(':').map(Number);
    const y = meetingDate.getFullYear();
    const mon = meetingDate.getMonth();
    const d = meetingDate.getDate();
    // IST offset is +5:30 -> UTC = IST - 5:30
    const meetingStartUtc = Date.UTC(y, mon, d, hours, minutes) - (5.5 * 60 * 60 * 1000);
    const meetingEndUtc = meetingStartUtc + (m.durationMinutes || 60) * 60 * 1000;
    return now.getTime() <= meetingEndUtc;
  });

  // Filter tasks: Hide tasks where submission is done (SUBMITTED, UNDER_REVIEW, COMPLETED)
  const currentUserId = user?._id || (user as any)?.id;
  const activeAcademicTasks = tasks.filter((t) => {
    if (user?.role === 'FACULTY') {
      const myAssignee =
        t.assignees?.find(
          (a: any) =>
            (a.facultyId?._id && a.facultyId._id.toString() === currentUserId?.toString()) ||
            (a.facultyId && a.facultyId.toString() === currentUserId?.toString())
        ) || t.assignees?.[0];

      if (!myAssignee) return false;
      const isDone =
        myAssignee.status === 'SUBMITTED' ||
        myAssignee.status === 'UNDER_REVIEW' ||
        myAssignee.status === 'COMPLETED' ||
        Boolean(myAssignee.submittedAt);
      return !isDone;
    }
    return t.overallStatus !== 'COMPLETED';
  });

  const isDean = user?.role === 'HOD' || (user as any)?.role === 'DEAN';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[#24232B] flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-[#7051C8]" />
            <span>{isDean ? 'Department Meeting Deadlines' : 'Academic Deadlines & Department Events Calendar'}</span>
          </h1>
          <p className="text-xs text-[#737784]">
            {isDean
              ? 'Real-time timeline of active departmental council meetings and scheduled sessions'
              : 'Unified timeline of academic task submission deadlines, audit dates, and departmental meetings'}
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isDean ? 'max-w-2xl mx-auto' : 'md:grid-cols-2'} gap-6`}>
        {/* Task Deadlines - Hidden for Dean per requirement: Academic Deadlines Shouldn't be shown to the Dean, only meeting deadlines */}
        {!isDean && (
          <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-[#24232B] flex items-center space-x-2 pb-2 border-b border-gray-100">
              <CheckSquare className="w-4 h-4 text-[#E47B32]" />
              <span>Academic Submission Deadlines</span>
            </h2>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {activeAcademicTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#737784]">No pending submission deadlines. All caught up!</div>
              ) : (
                activeAcademicTasks.map((t) => (
                  <div key={t._id} className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E6E8ED] text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[#D94B4B]">
                        Due: {new Date(t.dueDate).toLocaleDateString()} at {t.dueTime || '17:00'}
                      </span>
                      <span className="text-[10px] bg-orange-100 text-[#E47B32] font-semibold px-1.5 py-0.5 rounded">
                        {t.priority}
                      </span>
                    </div>
                    <h4 className="font-semibold text-[#24232B] mt-1">{t.title}</h4>
                    <p className="text-[#737784] text-[11px] mt-0.5 line-clamp-1">{t.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Department Meetings */}
        <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#24232B] flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Video className="w-4 h-4 text-[#7051C8]" />
            <span>Council & Academic Meetings</span>
          </h2>
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
            {activeMeetings.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#737784]">No scheduled active meetings.</div>
            ) : (
              activeMeetings.map((m) => (
                <div key={m._id} className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E6E8ED] text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#7051C8]">
                      {new Date(m.date).toLocaleDateString()} at {m.startTime}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {m.durationMinutes} mins
                    </span>
                  </div>
                  <h4 className="font-semibold text-[#24232B] mt-1">{m.title}</h4>
                  {m.googleMeetLink && (
                    <a
                      href={m.googleMeetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-[11px] font-semibold text-[#7051C8] hover:underline"
                    >
                      Open Google Meet Link &rarr;
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
