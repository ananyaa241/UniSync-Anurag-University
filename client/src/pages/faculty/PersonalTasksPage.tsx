import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { CheckSquare, Plus, Trash2, CheckCircle } from 'lucide-react';

export const PersonalTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await apiFetch('/personal-tasks');
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await apiFetch('/personal-tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          priority: newPriority
        })
      });

      if (res.success) {
        setNewTitle('');
        loadTasks();
      }
    } catch {
      // Ignore
    }
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    try {
      await apiFetch(`/personal-tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isCompleted: !currentStatus })
      });
      loadTasks();
    } catch {
      // Ignore
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await apiFetch(`/personal-tasks/${id}`, { method: 'DELETE' });
      loadTasks();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm">
        <h1 className="text-lg font-bold text-[#24232B] flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-[#7051C8]" />
          <span>Faculty Personal To-Do & Task Manager</span>
        </h1>
        <p className="text-xs text-[#737784] mt-0.5">
          Keep track of your private preparation, lecture slide revisions, research notes, and daily student evaluations
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm space-y-4">
        {/* Quick add */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new private task (e.g. Prepare lab quiz questions)..."
            className="flex-1 text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="text-xs p-2 border border-[#E6E8ED] rounded-lg bg-white"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Add
          </button>
        </form>

        <div className="divide-y divide-[#E6E8ED] pt-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#737784]">No personal tasks yet.</div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => toggleTask(task._id, task.isCompleted)}
                    className="w-4 h-4 text-[#7051C8] rounded cursor-pointer"
                  />
                  <span
                    className={`text-xs ${
                      task.isCompleted ? 'line-through text-gray-400 font-normal' : 'text-[#24232B] font-medium'
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      task.priority === 'HIGH' ? 'bg-orange-100 text-[#E47B32]' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>

                <button
                  onClick={() => deleteTask(task._id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
