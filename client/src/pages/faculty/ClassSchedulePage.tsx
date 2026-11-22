import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { ClassSchedule } from '../../types';
import { Clock, Plus, Trash2, Calendar, MapPin, Bell } from 'lucide-react';

export const ClassSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [classSection, setClassSection] = useState('');
  const [classroom, setClassroom] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:50');
  const [reminderOffsetMinutes, setReminderOffsetMinutes] = useState(10);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const res = await apiFetch('/schedules');
      if (res.success && res.data) {
        setSchedules(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/schedules', {
        method: 'POST',
        body: JSON.stringify({
          subject,
          subjectCode,
          classSection,
          classroom,
          startTime,
          endTime,
          reminderOffsetMinutes,
          notes
        })
      });

      if (res.success) {
        setShowAddModal(false);
        setSubject('');
        setClassSection('');
        setClassroom('');
        setNotes('');
        loadSchedules();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save class schedule');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this scheduled lecture slot?')) return;
    try {
      await apiFetch(`/schedules/${id}`, { method: 'DELETE' });
      loadSchedules();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[#24232B] flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#159A91]" />
            <span>Daily Faculty Class Scheduler</span>
          </h1>
          <p className="text-xs text-[#737784]">
            Department of CSE | Classroom timetables, lab sessions, and automated start reminders
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#159A91] hover:bg-[#117c75] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Teaching Slot</span>
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-xs text-[#737784] rounded-xl border border-[#E6E8ED]">
            No teaching periods scheduled. Click "Add Teaching Slot" to schedule your classes.
          </div>
        ) : (
          schedules.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col justify-between hover:border-[#159A91]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#159A91] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {item.startTime} – {item.endTime}
                  </span>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-gray-400 hover:text-[#D94B4B] p-1"
                    title="Delete Slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-[#24232B]">{item.subject}</h3>
                {item.subjectCode && (
                  <span className="text-[10px] text-gray-500 font-medium">{item.subjectCode}</span>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-[#737784]">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{item.classSection}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-medium text-[#24232B]">{item.classroom}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-[#7051C8]">
                    <Bell className="w-3.5 h-3.5 text-[#7051C8]" />
                    <span>Reminder set {item.reminderOffsetMinutes} mins prior</span>
                  </div>
                </div>

                {item.notes && (
                  <div className="mt-3 p-2 bg-[#F7F8FA] rounded text-[11px] text-gray-600">
                    {item.notes}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E6E8ED]">
            <h2 className="text-base font-bold text-[#24232B] mb-4">Add Scheduled Class Slot</h2>
            <form onSubmit={handleAddSchedule} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#24232B]">Subject Name</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Database Management Systems"
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Subject Code</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="CS301PC"
                    className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Class & Section</label>
                  <input
                    type="text"
                    required
                    value={classSection}
                    onChange={(e) => setClassSection(e.target.value)}
                    placeholder="CSE - II Year - Sec A"
                    className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24232B]">Classroom / Lab Location</label>
                <input
                  type="text"
                  required
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  placeholder="e.g. Room C-204 / Lab 3"
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24232B]">Notification Reminder</label>
                <select
                  value={reminderOffsetMinutes}
                  onChange={(e) => setReminderOffsetMinutes(Number(e.target.value))}
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                >
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24232B]">Lecture Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Chapters to cover, lab apparatus required..."
                  className="mt-1 w-full text-xs p-2 border border-[#E6E8ED] rounded-md"
                />
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
                  className="px-4 py-2 bg-[#159A91] text-white rounded text-xs font-semibold hover:bg-[#117c75]"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
