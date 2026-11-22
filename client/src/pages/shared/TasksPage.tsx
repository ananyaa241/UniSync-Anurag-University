import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, getFileUrl } from '../../services/api';
import { Task } from '../../types';
import {
  CheckSquare,
  Plus,
  Upload,
  FileCheck,
  AlertCircle,
  FileText,
  Clock,
  Filter,
  Check,
  X,
  Edit,
  Trash2,
  Calendar,
  User,
  Search,
  Paperclip,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Eye,
  ExternalLink,
  CheckCircle2,
  ListTodo,
  Users,
  Bell,
  Send
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'OVERDUE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // User Directories & Coordinator Faculty Monitoring
  const [coordinatorsList, setCoordinatorsList] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [facultyPerformance, setFacultyPerformance] = useState<any[]>([]);
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>('ALL');
  const [selectedFacultyDossier, setSelectedFacultyDossier] = useState<any | null>(null);

  // Send Reminder State
  const [reminderFaculty, setReminderFaculty] = useState<any | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string>('');
  const [sendingReminder, setSendingReminder] = useState<boolean>(false);
  const [reminderToast, setReminderToast] = useState<string>('');

  // Create Task Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Accreditation');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [newCoordinatorId, setNewCoordinatorId] = useState('');
  const [singleFacultyId, setSingleFacultyId] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('17:00');
  const [newInstructions, setNewInstructions] = useState('');
  const [newDeliverables, setNewDeliverables] = useState('');
  const [newAttachmentFile, setNewAttachmentFile] = useState<File | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [editCoordinatorId, setEditCoordinatorId] = useState('');
  const [editFacultyId, setEditFacultyId] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('17:00');
  const [editInstructions, setEditInstructions] = useState('');
  const [editDeliverables, setEditDeliverables] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Dean / Coordinator Review Modal State
  const [reviewingTask, setReviewingTask] = useState<Task | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Faculty Submission Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditingSubmission, setIsEditingSubmission] = useState(false);
  const [submitTargetTask, setSubmitTargetTask] = useState<Task | null>(null);

  // Dedicated Faculty Task Detail & Progress Update Modals
  const [facultyDetailTask, setFacultyDetailTask] = useState<Task | null>(null);
  const [showProgressUpdateModal, setShowProgressUpdateModal] = useState(false);
  const [progressTargetTask, setProgressTargetTask] = useState<Task | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressNotes, setProgressNotes] = useState('');
  const [savingProgress, setSavingProgress] = useState(false);

  // Today in IST format YYYY-MM-DD
  const todayIST = (() => {
    const d = new Date();
    const istMs = d.getTime() + 5.5 * 60 * 60 * 1000;
    const istDate = new Date(istMs);
    const yyyy = istDate.getUTCFullYear();
    const mm = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(istDate.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const isDean = user?.role === 'HOD' || (user as any)?.role === 'DEAN';
  const isCoordinator = user?.role === 'COORDINATOR';
  const isFaculty = user?.role === 'FACULTY';

  useEffect(() => {
    loadTasks();
    loadUsersDirectory();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const taskQuery = isCoordinator
        ? '/tasks?scope=faculty_tasks'
        : isDean
        ? '/tasks?scope=dean_tasks'
        : '/tasks';

      const [res, dashRes] = await Promise.all([
        apiFetch(taskQuery),
        apiFetch('/analytics/dashboard')
      ]);

      if (res.success && res.data) {
        setTasks(res.data);
        if (res.data.length > 0 && !selectedTaskId) {
          setSelectedTaskId(res.data[0]._id);
        }
      }

      if (dashRes.success && dashRes.data?.facultyPerformance) {
        setFacultyPerformance(dashRes.data.facultyPerformance);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const loadUsersDirectory = async () => {
    try {
      const res = await apiFetch('/users/faculty');
      if (res.success && res.data) {
        const coords = res.data.filter((u: any) => u.role === 'COORDINATOR');
        const facs = res.data.filter((u: any) => u.role === 'FACULTY');
        setCoordinatorsList(coords);
        setFacultyList(facs);
        if (coords.length > 0 && !newCoordinatorId) {
          setNewCoordinatorId(coords[0]._id);
        }
        if (facs.length > 0 && !singleFacultyId) {
          setSingleFacultyId(facs[0]._id);
        }
      }
    } catch {
      // Ignore
    }
  };

  // Helper to test if a task is overdue
  const isTaskOverdue = (task: Task) => {
    if (task.overallStatus === 'COMPLETED') return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    return now.getTime() > due.getTime();
  };

  // Faculty task helpers
  const getFacultyAssignee = (task: Task) => {
    if (!task.assignees || task.assignees.length === 0) return null;
    const currentUserId = user?._id || (user as any)?.id;
    const found = task.assignees.find(
      (a: any) =>
        (a.facultyId?._id && a.facultyId._id.toString() === currentUserId?.toString()) ||
        (a.facultyId && a.facultyId.toString() === currentUserId?.toString())
    );
    return found || task.assignees[0];
  };

  const getFacultyTaskStatus = (task: Task) => {
    const assignee = getFacultyAssignee(task);
    const status = assignee?.status || task.overallStatus;
    const overdue = isTaskOverdue(task);
    if (status === 'COMPLETED') {
      return { key: 'COMPLETED', label: 'Completed', color: 'text-[#16A34A] bg-green-50 border-green-200 ring-green-600/20' };
    }
    if (status === 'SUBMITTED' || status === 'UNDER_REVIEW') {
      return { key: 'UNDER_REVIEW', label: 'Under Review', color: 'text-[#7051C8] bg-purple-50 border-purple-200 ring-purple-600/20' };
    }
    if (status === 'REVISION_REQUESTED') {
      return { key: 'REVISION_REQUESTED', label: 'Revision Needed', color: 'text-[#D97706] bg-amber-50 border-amber-200 ring-amber-600/20' };
    }
    if (overdue) {
      return { key: 'OVERDUE', label: 'Overdue', color: 'text-[#DC2626] bg-red-50 border-red-200 ring-red-600/20' };
    }
    if (status === 'IN_PROGRESS') {
      return { key: 'IN_PROGRESS', label: 'In Progress', color: 'text-[#2563EB] bg-blue-50 border-blue-200 ring-blue-600/20' };
    }
    return { key: 'PENDING', label: 'Pending', color: 'text-[#D97706] bg-amber-50 border-amber-200 ring-amber-600/20' };
  };

  const getFacultyProgressVal = (task: Task) => {
    const assignee = getFacultyAssignee(task);
    if (assignee?.status === 'COMPLETED' || task.overallStatus === 'COMPLETED') return 100;
    if (assignee?.progressPercentage !== undefined) return assignee.progressPercentage;
    if (task.progressPercentage !== undefined) return task.progressPercentage;
    if (assignee?.status === 'SUBMITTED' || assignee?.status === 'UNDER_REVIEW') return 90;
    if (assignee?.status === 'IN_PROGRESS') return 30;
    return 0;
  };

  // Filter tasks based on activeFilter, faculty member filter, and searchQuery
  const filteredTasks = tasks.filter((task) => {
    // 1. Coordinator faculty member filter
    if (isCoordinator && selectedFacultyFilter !== 'ALL') {
      const isAssigned = (task.assignees || []).some(
        (a: any) =>
          a.facultyId?._id?.toString() === selectedFacultyFilter ||
          a.facultyId?.toString() === selectedFacultyFilter
      );
      if (!isAssigned) return false;
    }

    // 2. Search query check
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.assignees || []).some((a: any) =>
        (a.facultyId?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      ((task.createdBy as any)?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const overdue = isTaskOverdue(task);

    if (isFaculty) {
      const statusObj = getFacultyTaskStatus(task);
      if (activeFilter === 'OVERDUE') return overdue;
      if (activeFilter === 'COMPLETED') return statusObj.key === 'COMPLETED';
      if (activeFilter === 'UNDER_REVIEW') return statusObj.key === 'UNDER_REVIEW';
      if (activeFilter === 'IN_PROGRESS') return statusObj.key === 'IN_PROGRESS';
      if (activeFilter === 'PENDING') return statusObj.key === 'PENDING' || statusObj.key === 'REVISION_REQUESTED';
      return true; // ALL
    }

    if (activeFilter === 'OVERDUE') return overdue;
    if (activeFilter === 'COMPLETED') return task.overallStatus === 'COMPLETED';
    if (activeFilter === 'UNDER_REVIEW') return task.overallStatus === 'SUBMITTED' || task.overallStatus === 'UNDER_REVIEW';
    if (activeFilter === 'IN_PROGRESS') return task.overallStatus === 'IN_PROGRESS';
    if (activeFilter === 'PENDING') return task.overallStatus === 'NOT_STARTED' && !overdue;

    return true; // ALL
  });

  const selectedTask = tasks.find((t) => t._id === selectedTaskId) || filteredTasks[0] || tasks[0] || null;

  // Handle Create Task by Dean or Coordinator
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate) {
      alert('Task title and submission deadline are required.');
      return;
    }

    setCreatingTask(true);
    try {
      let attachments: any[] = [];
      if (newAttachmentFile) {
        const formData = new FormData();
        formData.append('file', newAttachmentFile);
        const uploadRes = await apiFetch('/upload', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.success && uploadRes.data) {
          attachments.push(uploadRes.data);
        }
      }

      const assigneeIds = isDean
        ? (newCoordinatorId ? [newCoordinatorId] : coordinatorsList.length > 0 ? [coordinatorsList[0]._id] : [])
        : (singleFacultyId ? [singleFacultyId] : facultyList.length > 0 ? [facultyList[0]._id] : []);

      const res = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          priority: newPriority,
          startDate: newStartDate || todayIST,
          dueDate: newDueDate,
          dueTime: newDueTime,
          instructions: newInstructions,
          expectedDeliverables: newDeliverables,
          attachments,
          assigneeIds
        })
      });

      if (res.success && res.data) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewInstructions('');
        setNewDeliverables('');
        setNewAttachmentFile(null);
        await loadTasks();
        setSelectedTaskId(res.data._id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create and assign task.');
    } finally {
      setCreatingTask(false);
    }
  };

  // Open Edit Task Modal
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditCategory(task.category);
    setEditPriority(task.priority);
    setEditStartDate(task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : todayIST);
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setEditDueTime(task.dueTime || '17:00');
    setEditInstructions(task.instructions || '');
    setEditDeliverables(task.expectedDeliverables || '');
    if (task.assignees?.length > 0) {
      const firstAssignee = task.assignees[0].facultyId as any;
      const aid = firstAssignee?._id || firstAssignee || '';
      if (isDean) setEditCoordinatorId(aid);
      else setEditFacultyId(aid);
    }
  };

  // Handle Save Edited Task
  const handleSaveEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setSavingEdit(true);

    try {
      const assigneeIds = isDean
        ? (editCoordinatorId ? [editCoordinatorId] : undefined)
        : (editFacultyId ? [editFacultyId] : undefined);

      const res = await apiFetch(`/tasks/${editingTask._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          category: editCategory,
          priority: editPriority,
          startDate: editStartDate,
          dueDate: editDueDate,
          dueTime: editDueTime,
          instructions: editInstructions,
          expectedDeliverables: editDeliverables,
          assigneeIds
        })
      });

      if (res.success) {
        setEditingTask(null);
        await loadTasks();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update task.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Delete Task with Confirmation
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
      if (res.success) {
        const remaining = tasks.filter((t) => t._id !== taskId);
        setTasks(remaining);
        if (selectedTaskId === taskId && remaining.length > 0) {
          setSelectedTaskId(remaining[0]._id);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete task.');
    }
  };

  // Handle Send Reminder to Faculty Member
  const handleOpenReminderModal = (faculty: any) => {
    setReminderFaculty(faculty);
    setReminderMessage('Please complete and submit your pending departmental deliverables.');
  };

  const handleSendReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderFaculty) return;
    setSendingReminder(true);
    try {
      const res = await apiFetch('/notifications/reminder', {
        method: 'POST',
        body: JSON.stringify({
          facultyId: reminderFaculty.id || reminderFaculty._id,
          message: reminderMessage
        })
      });
      if (res.success) {
        setReminderToast(
          `Reminder sent successfully to ${reminderFaculty.fullName}. They can view it under their notification bell.`
        );
        setReminderFaculty(null);
        setTimeout(() => setReminderToast(''), 4500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send reminder.');
    } finally {
      setSendingReminder(false);
    }
  };

  // Handle Review & Approval by Dean / Coordinator
  const handleReviewSubmission = async (action: 'APPROVE' | 'REVISE') => {
    if (!reviewingTask) return;
    setReviewSubmitting(true);

    try {
      const res = await apiFetch(`/tasks/${reviewingTask._id}/review`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          remarks: reviewRemarks
        })
      });

      if (res.success) {
        setReviewingTask(null);
        setReviewRemarks('');
        await loadTasks();
        if (res.data) {
          setSelectedTaskId(res.data._id);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Faculty Quick Start Task
  const handleStartTask = async (task: Task) => {
    try {
      const res = await apiFetch(`/tasks/${task._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'IN_PROGRESS',
          progressPercentage: 15,
          notes: 'Task started by faculty'
        })
      });
      if (res.success) {
        await loadTasks();
        if (facultyDetailTask && facultyDetailTask._id === task._id) {
          setFacultyDetailTask(res.data);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start task.');
    }
  };

  // Faculty Update Progress Handler
  const handleSaveFacultyProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetTask = progressTargetTask || facultyDetailTask || selectedTask;
    if (!targetTask) return;
    setSavingProgress(true);
    try {
      const newStatus = progressPercent >= 100 ? 'COMPLETED' : progressPercent > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
      const res = await apiFetch(`/tasks/${targetTask._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          progressPercentage: progressPercent,
          notes: progressNotes
        })
      });
      if (res.success) {
        setShowProgressUpdateModal(false);
        setProgressNotes('');
        await loadTasks();
        if (facultyDetailTask && facultyDetailTask._id === targetTask._id) {
          setFacultyDetailTask(res.data);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update progress.');
    } finally {
      setSavingProgress(false);
    }
  };

  // Handle Faculty Submit Work
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetTask = submitTargetTask || facultyDetailTask || selectedTask;
    if (!targetTask) return;
    setSubmitting(true);

    try {
      let uploadedFiles: any[] = [];
      if (uploadingFile) {
        const formData = new FormData();
        formData.append('file', uploadingFile);
        const uploadRes = await apiFetch('/upload', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.success) {
          uploadedFiles.push(uploadRes.data);
        }
      }

      const res = await apiFetch(`/tasks/${targetTask._id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          notes: submissionNotes,
          files: uploadedFiles
        })
      });

      if (res.success) {
        setShowSubmitModal(false);
        setSubmissionNotes('');
        setUploadingFile(null);
        await loadTasks();
        if (res.data) {
          if (facultyDetailTask && facultyDetailTask._id === res.data._id) {
            setFacultyDetailTask(res.data);
          }
          setSelectedTaskId(res.data._id);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Counts for filter pills
  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => {
      if (isFaculty) {
        const s = getFacultyTaskStatus(t);
        return s.key === 'PENDING' || s.key === 'REVISION_REQUESTED';
      }
      return t.overallStatus === 'NOT_STARTED' && !isTaskOverdue(t);
    }).length,
    inProgress: tasks.filter((t) => {
      if (isFaculty) {
        const s = getFacultyTaskStatus(t);
        return s.key === 'IN_PROGRESS';
      }
      return t.overallStatus === 'IN_PROGRESS';
    }).length,
    underReview: tasks.filter((t) => {
      if (isFaculty) {
        const s = getFacultyTaskStatus(t);
        return s.key === 'UNDER_REVIEW';
      }
      return t.overallStatus === 'SUBMITTED' || t.overallStatus === 'UNDER_REVIEW';
    }).length,
    completed: tasks.filter((t) => {
      if (isFaculty) {
        const s = getFacultyTaskStatus(t);
        return s.key === 'COMPLETED';
      }
      return t.overallStatus === 'COMPLETED';
    }).length,
    overdue: tasks.filter((t) => isTaskOverdue(t)).length
  };

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-7.5rem)] flex flex-col space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER & PROMINENT CREATE TASK ACTION */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#24232B] flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-[#7051C8]" />
            <span>{isFaculty ? 'My Assigned Tasks' : 'Department Progress'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#737784] mt-0.5">
            {isFaculty
              ? 'View your assigned responsibilities, track progress, and submit your work.'
              : 'Monitor faculty workload, track completion rates with horizontal progress bars, view tasks, and send reminders.'}
          </p>
        </div>

        {/* Prominent + Create Task Button */}
        {(isDean || isCoordinator) && (
          <button
            onClick={() => {
              setNewStartDate(todayIST);
              const future = new Date(Date.now() + 7 * 86400000);
              const y = future.getFullYear();
              const m = String(future.getMonth() + 1).padStart(2, '0');
              const d = String(future.getDate()).padStart(2, '0');
              setNewDueDate(`${y}-${m}-${d}`);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 shrink-0 hover:shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create Task</span>
          </button>
        )}
      </div>

      {/* 1B. COMPACT STATUS SUMMARY CARDS (FOR FACULTY ROLE) */}
      {isFaculty && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total Tasks */}
          <div
            onClick={() => setActiveFilter('ALL')}
            className={`p-3.5 rounded-xl border bg-white shadow-xs cursor-pointer transition-all hover:shadow-sm ${
              activeFilter === 'ALL'
                ? 'border-[#7051C8] ring-2 ring-[#7051C8]/20 bg-purple-50/20'
                : 'border-[#E6E8ED] hover:border-gray-300'
            }`}
          >
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Total Tasks
            </span>
            <span className="text-xl font-bold text-gray-900 mt-1 block">{counts.all}</span>
          </div>

          {/* Pending */}
          <div
            onClick={() => setActiveFilter('PENDING')}
            className={`p-3.5 rounded-xl border bg-white shadow-xs cursor-pointer transition-all hover:shadow-sm ${
              activeFilter === 'PENDING'
                ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
                : 'border-[#E6E8ED] hover:border-amber-300'
            }`}
          >
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
              Pending
            </span>
            <span className="text-xl font-bold text-amber-600 mt-1 block">{counts.pending}</span>
          </div>

          {/* In Progress */}
          <div
            onClick={() => setActiveFilter('IN_PROGRESS')}
            className={`p-3.5 rounded-xl border bg-white shadow-xs cursor-pointer transition-all hover:shadow-sm ${
              activeFilter === 'IN_PROGRESS'
                ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                : 'border-[#E6E8ED] hover:border-blue-300'
            }`}
          >
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
              In Progress
            </span>
            <span className="text-xl font-bold text-blue-600 mt-1 block">{counts.inProgress}</span>
          </div>

          {/* Under Review */}
          <div
            onClick={() => setActiveFilter('UNDER_REVIEW')}
            className={`p-3.5 rounded-xl border bg-white shadow-xs cursor-pointer transition-all hover:shadow-sm ${
              activeFilter === 'UNDER_REVIEW'
                ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20'
                : 'border-[#E6E8ED] hover:border-purple-300'
            }`}
          >
            <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">
              Under Review
            </span>
            <span className="text-xl font-bold text-purple-600 mt-1 block">{counts.underReview}</span>
          </div>

          {/* Completed */}
          <div
            onClick={() => setActiveFilter('COMPLETED')}
            className={`p-3.5 rounded-xl border bg-white shadow-xs cursor-pointer transition-all hover:shadow-sm ${
              activeFilter === 'COMPLETED'
                ? 'border-green-500 ring-2 ring-green-500/20 bg-green-50/20'
                : 'border-[#E6E8ED] hover:border-green-300'
            }`}
          >
            <span className="text-[11px] font-semibold text-green-600 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-xl font-bold text-green-600 mt-1 block">{counts.completed}</span>
          </div>
        </div>
      )}

      {/* Reminder Sent Alert Toast */}
      {reminderToast && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span className="font-semibold">{reminderToast}</span>
          </div>
          <button onClick={() => setReminderToast('')} className="text-green-700 hover:text-green-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. MAIN SECTION: FACULTY-WISE PROGRESS LIST (One after another with horizontal bars) */}
      {!isFaculty ? (
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {facultyPerformance.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E6E8ED] p-12 text-center text-xs text-gray-500 shadow-sm space-y-2">
              <Users className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-700">No faculty members found.</p>
              <p className="text-[11px] text-gray-400">Department faculty records will appear here.</p>
            </div>
          ) : (
            facultyPerformance.map((fac: any) => (
              <div
                key={fac.id}
                className="bg-white rounded-xl border border-[#E6E8ED] shadow-sm p-4 sm:p-5 hover:border-[#7051C8]/60 transition-all space-y-3.5"
              >
                {/* Faculty Identity and Completion Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-full bg-purple-100 text-[#7051C8] font-bold text-sm flex items-center justify-center shrink-0">
                      {fac.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'FA'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#24232B]">{fac.fullName}</h3>
                      <p className="text-xs text-[#737784]">
                        {fac.designation || 'Faculty Member'} &bull; {fac.email} &bull; ID: {fac.employeeId || 'AU-CSE'}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#219653] bg-green-50 px-3 py-1 rounded-full border border-green-200 self-start sm:self-auto shrink-0">
                    {fac.completionRate}% Completed
                  </span>
                </div>

                {/* Horizontal Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-[#737784]">
                    <span className="font-medium">Task Completion</span>
                    <span className="font-semibold text-[#24232B]">
                      {fac.completed} of {fac.totalAssigned} tasks completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200">
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, fac.completionRate))}%` }}
                      className="bg-[#219653] h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Task Numbers & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-gray-100 text-xs">
                  <div className="flex items-center flex-wrap gap-4 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-gray-500 font-medium">Total Tasks:</span>
                      <span className="font-bold text-[#24232B]">{fac.totalAssigned}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-green-600 font-medium">Completed:</span>
                      <span className="font-bold text-green-700">{fac.completed}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-blue-600 font-medium">In-Progress:</span>
                      <span className="font-bold text-blue-700">{fac.inProgress}</span>
                    </div>
                    {fac.pending > 0 && (
                      <div className="flex items-center space-x-1.5">
                        <span className="text-amber-600 font-medium">Pending:</span>
                        <span className="font-bold text-amber-700">{fac.pending}</span>
                      </div>
                    )}
                    {fac.overdue > 0 && (
                      <div className="flex items-center space-x-1.5">
                        <span className="text-red-600 font-medium">Overdue:</span>
                        <span className="font-bold text-red-700">{fac.overdue}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setSelectedFacultyDossier(fac)}
                      className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#7051C8] border border-purple-200 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Tasks</span>
                    </button>

                    <button
                      onClick={() => handleOpenReminderModal(fac)}
                      className="px-3.5 py-1.5 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-xs"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Send Reminder</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {/* 3. FACULTY PERSONAL TASK WORKSPACE (FOR FACULTY ROLE ONLY) */}
      {isFaculty && (
        <div className="flex-1 flex flex-col space-y-4">
          {/* Navigation & Search Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E6E8ED] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, category, coordinator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-8 py-2 bg-[#F7F8FA] border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs no-scrollbar">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                  activeFilter === 'ALL'
                    ? 'bg-[#7051C8] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({counts.all})
              </button>
              <button
                onClick={() => setActiveFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                  activeFilter === 'PENDING'
                    ? 'bg-[#E47B32] text-white shadow-xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Pending ({counts.pending})
              </button>
              <button
                onClick={() => setActiveFilter('IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                  activeFilter === 'IN_PROGRESS'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                In Progress ({counts.inProgress})
              </button>
              <button
                onClick={() => setActiveFilter('UNDER_REVIEW')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                  activeFilter === 'UNDER_REVIEW'
                    ? 'bg-[#7051C8] text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                Under Review ({counts.underReview})
              </button>
              <button
                onClick={() => setActiveFilter('COMPLETED')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                  activeFilter === 'COMPLETED'
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                }`}
              >
                Completed ({counts.completed})
              </button>
              {counts.overdue > 0 && (
                <button
                  onClick={() => setActiveFilter('OVERDUE')}
                  className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                    activeFilter === 'OVERDUE'
                      ? 'bg-[#DC2626] text-white shadow-xs'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  Overdue ({counts.overdue})
                </button>
              )}
            </div>
          </div>

          {/* Task Cards Responsive Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="bg-white rounded-xl border border-[#E6E8ED] p-12 text-center text-xs text-[#737784] space-y-2 shadow-xs">
                <div className="w-6 h-6 border-2 border-[#7051C8] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p>Loading your assigned academic tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E6E8ED] p-12 text-center text-xs text-[#737784] space-y-2 shadow-xs">
                <CheckSquare className="w-10 h-10 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-gray-700">No tasks found</h3>
                <p className="text-gray-400">
                  {searchQuery
                    ? `No tasks match "${searchQuery}". Try clearing search.`
                    : 'You have no assigned academic tasks in this status filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                {filteredTasks.map((task) => {
                  const statusInfo = getFacultyTaskStatus(task);
                  const progressVal = getFacultyProgressVal(task);
                  const assignee = getFacultyAssignee(task);
                  const isOverdue = isTaskOverdue(task);
                  const isCompleted = statusInfo.key === 'COMPLETED';
                  const isUnderReview = statusInfo.key === 'UNDER_REVIEW';
                  const isRevision = statusInfo.key === 'REVISION_REQUESTED';
                  const isStarted = statusInfo.key === 'IN_PROGRESS';

                  return (
                    <div
                      key={task._id}
                      onClick={() => setFacultyDetailTask(task)}
                      className="bg-white rounded-xl border border-[#E6E8ED] shadow-xs hover:border-[#7051C8]/60 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer space-y-3.5 group"
                    >
                      {/* Top Row: Category + Priority on Left, Status Badge on Right */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-[#7051C8] border border-purple-100">
                            {task.category}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              task.priority === 'URGENT'
                                ? 'bg-red-50 text-[#DC2626] border border-red-200'
                                : task.priority === 'HIGH'
                                ? 'bg-amber-50 text-[#D97706] border border-amber-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Status Badge with Required Exact Colors:
                            Pending: Orange | In Progress: Blue | Under Review: Purple | Completed: Green | Overdue: Red */}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Middle: Title & Description */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-[#24232B] group-hover:text-[#7051C8] transition-colors line-clamp-2">
                          {task.title}
                        </h3>
                        <p className="text-xs text-[#737784] line-clamp-2 leading-relaxed">
                          {task.description || 'No additional description provided.'}
                        </p>
                      </div>

                      {/* Metadata: Assigned By & Deadline */}
                      <div className="pt-1 text-xs text-[#737784] space-y-1 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-1 text-gray-600 font-medium truncate">
                            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">
                              {(task.createdBy as any)?.fullName || 'Academic Coordinator'}
                            </span>
                          </span>
                          <span
                            className={`text-[11px] font-semibold flex items-center space-x-1 shrink-0 ${
                              isOverdue ? 'text-[#DC2626]' : 'text-gray-500'
                            }`}
                          >
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>
                              {isOverdue ? 'Overdue: ' : 'Due: '}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500 font-medium">Progress</span>
                          <span className="font-bold text-[#16A34A]">{progressVal}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${progressVal}%` }}
                            className="bg-[#16A34A] h-full rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Bottom Contextual Action */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] text-[#7051C8] font-semibold group-hover:underline flex items-center space-x-1">
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>

                        {/* Obvious Contextual Actions */}
                        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          {!isStarted && !isUnderReview && !isCompleted && !isRevision && (
                            <button
                              onClick={() => handleStartTask(task)}
                              className="px-3 py-1 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                            >
                              Start Task
                            </button>
                          )}

                          {isStarted && (
                            <>
                              <button
                                onClick={() => {
                                  setProgressTargetTask(task);
                                  setProgressPercent(progressVal);
                                  setProgressNotes(assignee?.submissionNotes || '');
                                  setShowProgressUpdateModal(true);
                                }}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                                title="Update task progress percentage"
                              >
                                Update %
                              </button>
                              <button
                                onClick={() => {
                                  setSubmitTargetTask(task);
                                  setSubmissionNotes(assignee?.submissionNotes || '');
                                  setIsEditingSubmission(false);
                                  setShowSubmitModal(true);
                                }}
                                className="px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Submit</span>
                              </button>
                            </>
                          )}

                          {isRevision && (
                            <button
                              onClick={() => {
                                setSubmitTargetTask(task);
                                setSubmissionNotes(assignee?.submissionNotes || '');
                                setIsEditingSubmission(true);
                                setShowSubmitModal(true);
                              }}
                              className="px-3 py-1 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Resubmit</span>
                            </button>
                          )}

                          {isUnderReview && (
                            <span className="text-[11px] font-semibold text-[#7051C8] bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Under Review</span>
                            </span>
                          )}

                          {isCompleted && (
                            <span className="text-[11px] font-semibold text-[#16A34A] bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>Approved</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEDICATED FACULTY TASK DETAIL MODAL (5 Clearly Separated Sections) */}
      {isFaculty && facultyDetailTask && (() => {
        const detailAssignee = getFacultyAssignee(facultyDetailTask);
        const detailStatus = getFacultyTaskStatus(facultyDetailTask);
        const detailProgressVal = getFacultyProgressVal(facultyDetailTask);
        const isDetailOverdue = isTaskOverdue(facultyDetailTask);

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E6E8ED] flex flex-col">
              {/* Modal Top Header */}
              <div className="p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-purple-50 text-[#7051C8] border border-purple-100">
                      {facultyDetailTask.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        facultyDetailTask.priority === 'URGENT'
                          ? 'bg-red-50 text-[#DC2626] border border-red-200'
                          : facultyDetailTask.priority === 'HIGH'
                          ? 'bg-amber-50 text-[#D97706] border border-amber-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {facultyDetailTask.priority} Priority
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${detailStatus.color}`}
                    >
                      {detailStatus.label}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#24232B]">{facultyDetailTask.title}</h2>
                </div>
                <button
                  onClick={() => setFacultyDetailTask(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: 5 Sections */}
              <div className="p-5 sm:p-6 space-y-6 flex-1">
                {/* 1. TASK OVERVIEW */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7051C8] flex items-center space-x-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Task Overview</span>
                  </h3>
                  <div className="bg-[#F7F8FA] rounded-xl p-4 border border-[#E6E8ED] space-y-2">
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {facultyDetailTask.description || 'No detailed description provided.'}
                    </p>
                    <div className="text-[11px] text-gray-400 pt-1 border-t border-gray-200/60">
                      Task Created: {new Date(facultyDetailTask.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 2. ASSIGNMENT DETAILS */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7051C8] flex items-center space-x-1.5">
                    <User className="w-4 h-4" />
                    <span>Assignment Details</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E6E8ED]">
                      <span className="text-[11px] text-gray-400 block font-medium">Assigned By:</span>
                      <span className="font-bold text-[#24232B] text-xs block mt-0.5">
                        {(facultyDetailTask.createdBy as any)?.fullName || 'Academic Coordinator'}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {(facultyDetailTask.createdBy as any)?.designation || 'Department Administration'}
                      </span>
                    </div>

                    <div className="bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E6E8ED]">
                      <span className="text-[11px] text-gray-400 block font-medium">Assigned Faculty Member:</span>
                      <span className="font-bold text-[#24232B] text-xs block mt-0.5">
                        {user.fullName}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Employee ID: {user.employeeId || 'AU-CSE'} &bull; {user.designation || 'Faculty Member'}
                      </span>
                    </div>

                    <div className="bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E6E8ED]">
                      <span className="text-[11px] text-gray-400 block font-medium">Assignment Start Date:</span>
                      <span className="font-bold text-gray-800 text-xs block mt-0.5">
                        {facultyDetailTask.startDate
                          ? new Date(facultyDetailTask.startDate).toLocaleDateString()
                          : 'Immediate'}
                      </span>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${
                      isDetailOverdue ? 'bg-red-50/60 border-red-200' : 'bg-[#F7F8FA] border-[#E6E8ED]'
                    }`}>
                      <span className={`text-[11px] block font-medium ${isDetailOverdue ? 'text-red-600' : 'text-gray-400'}`}>
                        Official Deadline:
                      </span>
                      <span className={`font-bold text-xs block mt-0.5 ${isDetailOverdue ? 'text-[#DC2626]' : 'text-gray-800'}`}>
                        {new Date(facultyDetailTask.dueDate).toLocaleDateString()} at {facultyDetailTask.dueTime || '17:00'}
                        {isDetailOverdue && ' (Overdue)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. TASK INSTRUCTIONS & DELIVERABLES */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7051C8] flex items-center space-x-1.5">
                    <ListTodo className="w-4 h-4" />
                    <span>Task Instructions & Deliverables</span>
                  </h3>
                  <div className="space-y-3">
                    {facultyDetailTask.expectedDeliverables && (
                      <div className="bg-green-50/40 p-4 rounded-xl border border-green-200 text-xs">
                        <span className="font-bold text-[#16A34A] block mb-1 uppercase tracking-wider text-[11px]">
                          Expected Deliverables:
                        </span>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                          {facultyDetailTask.expectedDeliverables}
                        </p>
                      </div>
                    )}

                    {facultyDetailTask.instructions && (
                      <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-200 text-xs">
                        <span className="font-bold text-[#7051C8] block mb-1 uppercase tracking-wider text-[11px]">
                          Specific Guidelines & Objectives:
                        </span>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                          {facultyDetailTask.instructions}
                        </p>
                      </div>
                    )}

                    {/* Supporting Documents / Attachments */}
                    {facultyDetailTask.attachments && facultyDetailTask.attachments.length > 0 && (
                      <div className="bg-[#F7F8FA] p-4 rounded-xl border border-[#E6E8ED] space-y-2 text-xs">
                        <span className="font-semibold text-gray-700 block">
                          Supporting Department Guidelines / Template Files:
                        </span>
                        <div className="space-y-1.5">
                          {facultyDetailTask.attachments.map((att: any, idx: number) => (
                            <a
                              key={idx}
                              href={getFileUrl(att.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 bg-white rounded-lg border border-gray-200 hover:border-[#7051C8] hover:text-[#7051C8] transition-colors flex items-center justify-between text-xs font-medium"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="truncate">{att.fileName || 'Department Guideline Document'}</span>
                              </div>
                              <span className="text-[11px] text-[#7051C8] shrink-0 font-semibold">Download &rarr;</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. PROGRESS AND SUBMISSION */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7051C8] flex items-center space-x-1.5">
                    <CheckSquare className="w-4 h-4" />
                    <span>Progress and Submission</span>
                  </h3>
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E6E8ED] space-y-4">
                    {/* Horizontal Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700">Execution Progress</span>
                        <span className="font-bold text-[#16A34A]">{detailProgressVal}% Completed</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${detailProgressVal}%` }}
                          className="bg-[#16A34A] h-full rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Submission History / Feedback */}
                    {detailAssignee?.submissionNotes ||
                    (detailAssignee?.submissionFiles && detailAssignee.submissionFiles.length > 0) ? (
                      <div className="bg-[#F7F8FA] p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                          <span className="font-bold text-gray-800">Your Submitted Work</span>
                          <span className="text-[11px] text-gray-500">
                            {detailAssignee.submittedAt
                              ? new Date(detailAssignee.submittedAt).toLocaleString()
                              : 'Submitted'}
                          </span>
                        </div>

                        {detailAssignee.submissionNotes && (
                          <div>
                            <span className="text-[11px] font-semibold text-gray-500 block mb-0.5">Notes:</span>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                              {detailAssignee.submissionNotes}
                            </p>
                          </div>
                        )}

                        {detailAssignee.submissionFiles && detailAssignee.submissionFiles.length > 0 && (
                          <div>
                            <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                              Uploaded Documents:
                            </span>
                            <div className="space-y-1.5">
                              {detailAssignee.submissionFiles.map((f: any, fIdx: number) => (
                                <a
                                  key={fIdx}
                                  href={getFileUrl(f.fileUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2.5 bg-white rounded-lg border border-gray-200 hover:border-[#7051C8] hover:text-[#7051C8] transition-colors flex items-center justify-between font-medium"
                                >
                                  <div className="flex items-center space-x-2 truncate">
                                    <FileCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                                    <span className="truncate">{f.fileName}</span>
                                  </div>
                                  <span className="text-[11px] text-gray-400 shrink-0">View Document</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-dashed text-center text-xs text-gray-500">
                        No submissions uploaded yet. Update progress or upload your deliverable below.
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. APPROVAL INFORMATION */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7051C8] flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approval Information</span>
                  </h3>
                  <div className="bg-[#F7F8FA] p-4 sm:p-5 rounded-xl border border-[#E6E8ED] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-600">Review Decision:</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          detailStatus.key === 'COMPLETED'
                            ? 'bg-green-50 text-[#16A34A] border-green-200'
                            : detailStatus.key === 'REVISION_REQUESTED'
                            ? 'bg-amber-50 text-[#D97706] border-amber-200'
                            : detailStatus.key === 'UNDER_REVIEW'
                            ? 'bg-purple-50 text-[#7051C8] border-purple-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {detailStatus.key === 'COMPLETED'
                          ? '✓ Approved by Academic Coordinator'
                          : detailStatus.key === 'REVISION_REQUESTED'
                          ? '⚠ Revision Requested'
                          : detailStatus.key === 'UNDER_REVIEW'
                          ? 'Under Review'
                          : 'Awaiting Submission'}
                      </span>
                    </div>

                    {detailAssignee?.reviewerRemarks && (
                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-purple-900 space-y-1">
                        <span className="font-bold text-[11px] text-[#7051C8] block uppercase">
                          Coordinator / Reviewer Comments:
                        </span>
                        <p className="text-xs leading-relaxed">{detailAssignee.reviewerRemarks}</p>
                      </div>
                    )}

                    {detailAssignee?.reviewedAt && (
                      <div className="text-[11px] text-gray-400 pt-1">
                        Reviewed on: {new Date(detailAssignee.reviewedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer: Obvious Contextual Actions */}
              <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/70 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setFacultyDetailTask(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors w-full sm:w-auto"
                >
                  Close
                </button>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  {detailStatus.key === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleStartTask(facultyDetailTask)}
                      className="px-4 py-2 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      Start Task
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setProgressTargetTask(facultyDetailTask);
                      setProgressPercent(detailProgressVal);
                      setProgressNotes(detailAssignee?.submissionNotes || '');
                      setShowProgressUpdateModal(true);
                    }}
                    className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Update Progress
                  </button>

                  {detailStatus.key === 'REVISION_REQUESTED' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitTargetTask(facultyDetailTask);
                        setSubmissionNotes(detailAssignee?.submissionNotes || '');
                        setIsEditingSubmission(true);
                        setShowSubmitModal(true);
                      }}
                      className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resubmit After Revision</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitTargetTask(facultyDetailTask);
                        setSubmissionNotes(detailAssignee?.submissionNotes || '');
                        setIsEditingSubmission(false);
                        setShowSubmitModal(true);
                      }}
                      className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{detailStatus.key === 'UNDER_REVIEW' || detailStatus.key === 'COMPLETED' ? 'Update Submission' : 'Submit Task'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* QUICK PROGRESS UPDATE MODAL (SLIDER & NOTES) */}
      {showProgressUpdateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E6E8ED] space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#24232B]">Update Task Progress</h3>
                <p className="text-[11px] text-[#737784] truncate max-w-[320px]">
                  {(progressTargetTask || facultyDetailTask || selectedTask)?.title}
                </p>
              </div>
              <button
                onClick={() => setShowProgressUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFacultyProgress} className="space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-gray-700">Completion Percentage:</label>
                  <span className="text-sm font-bold text-[#16A34A] bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                    {progressPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(Number(e.target.value))}
                  className="w-full accent-[#7051C8] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                  <span>0% (Not Started)</span>
                  <span>50% (Halfway)</span>
                  <span>100% (Completed)</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Progress Notes / Milestone Summary
                </label>
                <textarea
                  rows={3}
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="e.g. Completed module 2 rubrics; drafting lab outcome sheets..."
                  className="w-full p-2.5 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowProgressUpdateModal(false)}
                  className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProgress}
                  className="px-4 py-2 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {savingProgress ? 'Saving...' : 'Save Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEND REMINDER TO FACULTY */}
      {reminderFaculty && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E6E8ED] space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-[#7051C8] flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#24232B]">Send Task Reminder</h2>
                  <p className="text-[11px] text-[#737784]">
                    To: <span className="font-semibold text-gray-800">{reminderFaculty.fullName}</span> ({reminderFaculty.designation || 'Faculty'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReminderFaculty(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendReminder} className="space-y-3.5 text-xs">
              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100 text-[11px] text-[#7051C8]">
                This reminder will be delivered directly to <strong>{reminderFaculty.fullName}</strong> and will instantly appear under their notification bell.
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24232B] mb-1.5">
                  Quick Message Templates:
                </label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setReminderMessage('Please complete and submit your pending departmental deliverables.')}
                    className="w-full text-left p-2 rounded border border-gray-200 hover:border-[#7051C8] hover:bg-purple-50/40 text-[11px] text-gray-700 transition-colors"
                  >
                    &bull; General: Please complete and submit your pending deliverables.
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setReminderMessage(
                        'Upcoming Deadline Reminder: Kindly submit your course files and lab rubrics before the scheduled deadline.'
                      )
                    }
                    className="w-full text-left p-2 rounded border border-gray-200 hover:border-[#7051C8] hover:bg-purple-50/40 text-[11px] text-gray-700 transition-colors"
                  >
                    &bull; Deadline: Kindly submit your course files and lab rubrics.
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setReminderMessage(
                        'Urgent Notice: Your academic deliverable submission is pending. Please upload the required documentation today.'
                      )
                    }
                    className="w-full text-left p-2 rounded border border-gray-200 hover:border-[#7051C8] hover:bg-purple-50/40 text-[11px] text-gray-700 transition-colors"
                  >
                    &bull; Urgent: Submission is pending. Please upload today.
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24232B] mb-1">
                  Reminder Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReminderFaculty(null)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReminder}
                  className="px-4 py-1.5 bg-[#7051C8] text-white rounded-lg text-xs font-semibold hover:bg-[#50305F] shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingReminder ? 'Sending...' : 'Send Reminder'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CREATE TASK MODAL (Dean to Coordinator)          */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-[#E6E8ED] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#7051C8] text-white flex items-center justify-center font-bold text-xs">
                  +
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#24232B]">
                    {isDean ? 'Create & Assign Task to Academic Coordinator' : 'Create & Assign Academic Task'}
                  </h2>
                  <p className="text-xs text-[#737784]">
                    {isDean
                      ? 'Establish departmental responsibility, define deadline, and attach guidelines.'
                      : 'Assign course tasks to faculty members.'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              {/* Task Title */}
              <div>
                <label className="block font-semibold text-[#24232B] mb-1">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. NBA Preparedness & Criteria 3 Dossier Compilation"
                  className="w-full p-2.5 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block font-semibold text-[#24232B] mb-1">
                  Detailed Description & Objective <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe scope, objectives, institutional requirements..."
                  className="w-full p-2.5 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#24232B] mb-1">Academic Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 border border-[#E6E8ED] rounded-lg bg-white"
                  >
                    <option value="Accreditation">Accreditation</option>
                    <option value="Examination">Examination</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Curriculum">Curriculum</option>
                    <option value="Audit">Audit & Review</option>
                    <option value="Research">Research & Publications</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#24232B] mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 border border-[#E6E8ED] rounded-lg bg-white"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              {/* Assigned Academic Coordinator (or Faculty if coordinator) */}
              <div>
                <label className="block font-semibold text-[#24232B] mb-1">
                  {isDean ? 'Assign to Academic Coordinator' : 'Assign to Faculty Member'} <span className="text-red-500">*</span>
                </label>
                {isDean ? (
                  <select
                    value={newCoordinatorId}
                    onChange={(e) => setNewCoordinatorId(e.target.value)}
                    className="w-full p-2.5 border border-[#E6E8ED] rounded-lg bg-white"
                  >
                    {coordinatorsList.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.fullName} ({c.designation || 'Academic Coordinator'}) • {c.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={singleFacultyId}
                    onChange={(e) => setSingleFacultyId(e.target.value)}
                    className="w-full p-2.5 border border-[#E6E8ED] rounded-lg bg-white"
                  >
                    {facultyList.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.fullName || f.name} ({f.designation || 'Faculty'}) • {f.employeeId || f.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Start Date, Deadline Date & Due Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#24232B] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full p-2 border border-[#E6E8ED] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#24232B] mb-1">
                    Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayIST}
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2 border border-[#E6E8ED] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#24232B] mb-1">Due Time</label>
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="w-full p-2 border border-[#E6E8ED] rounded-lg"
                  />
                </div>
              </div>

              {/* Expected Deliverables */}
              <div>
                <label className="block font-semibold text-[#24232B] mb-1">
                  Expected Deliverables & Specific Formats
                </label>
                <textarea
                  rows={2}
                  value={newDeliverables}
                  onChange={(e) => setNewDeliverables(e.target.value)}
                  placeholder="e.g. Compiled Excel dossier, PDF report signed by committee..."
                  className="w-full p-2 border border-[#E6E8ED] rounded-lg"
                />
              </div>

              {/* Supporting Document Attachment */}
              <div>
                <label className="block font-semibold text-[#24232B] mb-1">
                  Attach Reference Guidelines / Template
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewAttachmentFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs p-1.5 border border-dashed border-gray-300 rounded-lg"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="px-4 py-2 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg font-semibold transition-colors shadow-sm flex items-center space-x-1"
                >
                  {creatingTask ? (
                    <span>Assigning...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Assign Responsibility</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT TASK MODAL                                 */}
      {/* ======================================================== */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#E6E8ED] max-h-[85vh] overflow-y-auto space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b">
              <h2 className="text-base font-bold text-[#24232B]">Edit Task Details & Deadline</h2>
              <button onClick={() => setEditingTask(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Due Time</label>
                  <input
                    type="time"
                    value={editDueTime}
                    onChange={(e) => setEditDueTime(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              {isDean && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Coordinator</label>
                  <select
                    value={editCoordinatorId}
                    onChange={(e) => setEditCoordinatorId(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    {coordinatorsList.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.fullName} ({c.designation})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isCoordinator && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Faculty Member</label>
                  <select
                    value={editFacultyId}
                    onChange={(e) => setEditFacultyId(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    {facultyList.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.fullName || f.name} ({f.designation || 'Faculty'}) • {f.employeeId || f.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Expected Deliverables</label>
                <textarea
                  rows={2}
                  value={editDeliverables}
                  onChange={(e) => setEditDeliverables(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-3.5 py-1.5 border rounded-lg font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-1.5 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg font-semibold"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DEAN REVIEW & APPROVAL MODAL                    */}
      {/* ======================================================== */}
      {reviewingTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#E6E8ED] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#7051C8]" />
                <h2 className="text-base font-bold text-[#24232B]">Review & Decision Center</h2>
              </div>
              <button onClick={() => setReviewingTask(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F7F8FA] rounded-lg border space-y-1">
                <h3 className="text-sm font-bold text-[#24232B]">{reviewingTask.title}</h3>
                <div className="text-gray-600">
                  <span>Coordinated by: </span>
                  <strong className="text-gray-800">
                    {(reviewingTask.assignees?.[0]?.facultyId as any)?.fullName || 'Academic Coordinator'}
                  </strong>
                </div>
                <div className="text-gray-500 text-[11px]">
                  Official Deadline: {new Date(reviewingTask.dueDate).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24232B] mb-1">
                  Dean Decision Remarks / Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Enter approval congratulations or specific revision directives..."
                  rows={3}
                  className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  disabled={reviewSubmitting}
                  onClick={() => handleReviewSubmission('REVISE')}
                  className="px-3.5 py-2 border border-orange-300 text-[#E47B32] hover:bg-orange-50 rounded-lg font-semibold text-xs transition-colors flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Revision</span>
                </button>
                <button
                  type="button"
                  disabled={reviewSubmitting}
                  onClick={() => handleReviewSubmission('APPROVE')}
                  className="px-4 py-2 bg-[#219653] hover:bg-[#1a7d44] text-white rounded-lg font-semibold text-xs transition-colors shadow-sm flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Completed Task</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: FACULTY / COORDINATOR SUBMIT WORK MODAL         */}
      {/* ======================================================== */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E6E8ED]">
            <h2 className="text-base font-bold text-[#24232B] mb-1">
              {isEditingSubmission ? 'Edit / Update Submission' : 'Upload Deliverable Submission'}
            </h2>
            <p className="text-xs text-[#737784] mb-3">Task: {selectedTask?.title}</p>
            <form onSubmit={handleSubmitWork} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#24232B]">Submission Notes</label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Notes regarding documents, compiled internal marks, or completion summary..."
                  className="mt-1 w-full p-2 border border-[#E6E8ED] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-[#24232B]">
                  {isEditingSubmission ? 'Upload Replacement Document' : 'Upload Document'}
                </label>
                <input
                  type="file"
                  required={!isEditingSubmission}
                  onChange={(e) => setUploadingFile(e.target.files ? e.target.files[0] : null)}
                  className="mt-1 w-full"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#219653] hover:bg-[#197541] text-white rounded-lg font-semibold"
                >
                  {submitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: FACULTY DOSSIER & WORKLOAD HISTORY MODAL         */}
      {/* ======================================================== */}
      {selectedFacultyDossier && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#E6E8ED] max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#7051C8] flex items-center justify-center font-bold text-lg">
                  {(selectedFacultyDossier.fullName || 'Faculty').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#24232B]">{selectedFacultyDossier.fullName}</h2>
                  <p className="text-xs text-[#737784]">
                    {selectedFacultyDossier.designation || 'Assistant Professor'} • Emp ID: {selectedFacultyDossier.employeeId || 'AU-CSE'}
                  </p>
                  <p className="text-[11px] text-gray-400">{selectedFacultyDossier.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedFacultyDossier(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance KPI summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-gray-50 rounded-lg text-center border">
                <span className="text-[10px] text-gray-500 font-semibold block uppercase">Total Assigned</span>
                <span className="text-base font-bold text-gray-800">{selectedFacultyDossier.totalAssigned}</span>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center border border-green-200">
                <span className="text-[10px] text-[#219653] font-semibold block uppercase">Completed</span>
                <span className="text-base font-bold text-[#219653]">{selectedFacultyDossier.completed}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-200">
                <span className="text-[10px] text-[#3578D4] font-semibold block uppercase">In-Progress</span>
                <span className="text-base font-bold text-[#3578D4]">{selectedFacultyDossier.inProgress}</span>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center border border-red-200">
                <span className="text-[10px] text-[#D94B4B] font-semibold block uppercase">Overdue</span>
                <span className="text-base font-bold text-[#D94B4B]">{selectedFacultyDossier.overdue}</span>
              </div>
            </div>

            {/* Overall Completion Progress */}
            <div className="space-y-1.5 p-3.5 bg-[#F7F8FA] rounded-xl border border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Overall Task Completion Level:</span>
                <span className="font-bold text-[#219653]">{selectedFacultyDossier.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(0, selectedFacultyDossier.completionRate))}%` }}
                  className="bg-[#219653] h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Task Dossiers List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#737784] flex items-center space-x-1.5">
                <ListTodo className="w-4 h-4 text-[#7051C8]" />
                <span>Assigned Tasks & Submission Dossiers</span>
              </h3>

              {(!selectedFacultyDossier.tasks || selectedFacultyDossier.tasks.length === 0) ? (
                <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  No tasks currently assigned to this faculty member.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedFacultyDossier.tasks.map((task: any) => (
                    <div key={task.id} className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-[#7051C8]/40 transition-colors space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-[#7051C8] mr-2">
                            {task.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            task.status === 'COMPLETED' ? 'bg-green-100 text-[#219653]' : task.isOverdue ? 'bg-red-100 text-[#D94B4B]' : 'bg-blue-100 text-[#3578D4]'
                          }`}>
                            {task.status}
                          </span>
                          <h4 className="font-bold text-gray-800 text-xs mt-1">{task.title}</h4>
                        </div>
                        <span className="text-[11px] text-gray-500 shrink-0">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      {task.submissionNotes && (
                        <div className="p-2.5 bg-gray-50 rounded text-xs text-gray-700">
                          <span className="text-[10px] font-bold text-gray-500 block uppercase mb-0.5">Faculty Notes:</span>
                          <p>{task.submissionNotes}</p>
                        </div>
                      )}

                      {task.submittedFiles && task.submittedFiles.length > 0 && (
                        <div className="space-y-1">
                          {task.submittedFiles.map((file: any, fIdx: number) => (
                            <a
                              key={fIdx}
                              href={getFileUrl(file.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-[#7051C8] hover:underline flex items-center space-x-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{file.fileName}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {task.reviewerRemarks && (
                        <div className="p-2 bg-purple-50 rounded text-[11px] text-purple-900 border border-purple-200">
                          <span className="font-bold block">Reviewer Feedback:</span>
                          <p>{task.reviewerRemarks}</p>
                        </div>
                      )}

                      {/* Coordinator Task Management Actions */}
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                        {(task.status === 'SUBMITTED' || task.status === 'UNDER_REVIEW') && (
                          <button
                            onClick={() => {
                              const found = tasks.find((t) => t._id === task.id || t._id === task._id) || (task as any);
                              setReviewingTask(found);
                              setSelectedFacultyDossier(null);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-[#7051C8] hover:bg-[#50305F] rounded-md transition-colors flex items-center space-x-1"
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>Review & Approve</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const found = tasks.find((t) => t._id === task.id || t._id === task._id) || (task as any);
                            handleOpenEditModal(found);
                            setSelectedFacultyDossier(null);
                          }}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-[#7051C8] hover:bg-purple-50 rounded flex items-center space-x-1 font-medium"
                          title="Edit Task"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteTask(task.id || task._id);
                            setSelectedFacultyDossier(null);
                          }}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded flex items-center space-x-1 font-medium"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  handleOpenReminderModal(selectedFacultyDossier);
                  setSelectedFacultyDossier(null);
                }}
                className="px-3.5 py-2 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Send Reminder to {selectedFacultyDossier.fullName}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFacultyDossier(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
