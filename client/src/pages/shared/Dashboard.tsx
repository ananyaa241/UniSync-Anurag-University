import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, getFileUrl } from '../../services/api';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Bell,
  BarChart2,
  PieChart as PieIcon,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Filter,
  X,
  FileCheck,
  RotateCcw,
  Calendar,
  Eye,
  Check,
  CheckSquare,
  ChevronRight,
  Upload,
  UserCheck,
  Lock,
  Edit3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Coordinator Personal Info & Password State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Modals state
  const [statusDrilldownModal, setStatusDrilldownModal] = useState<string | null>(null);
  const [selectedCoordinator, setSelectedCoordinator] = useState<any | null>(null);
  const [reviewingTask, setReviewingTask] = useState<any | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Dean Assign Task Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Accreditation');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [newCoordinatorId, setNewCoordinatorId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('17:00');
  const [newInstructions, setNewInstructions] = useState('');
  const [newDeliverables, setNewDeliverables] = useState('');

  // Dean Edit Task Modal
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState('HIGH');
  const [editDueDate, setEditDueDate] = useState('');

  // Coordinator Update Progress Modal State
  const [updatingTaskProgress, setUpdatingTaskProgress] = useState<any | null>(null);
  const [coordProgressVal, setCoordProgressVal] = useState<number>(0);
  const [coordProgressNotes, setCoordProgressNotes] = useState<string>('');
  const [savingProgress, setSavingProgress] = useState(false);

  // Coordinator Submit Completed Work to Dean Modal State
  const [submittingDeanTask, setSubmittingDeanTask] = useState<any | null>(null);
  const [coordSubmitNotes, setCoordSubmitNotes] = useState<string>('');
  const [coordSubmitFile, setCoordSubmitFile] = useState<File | null>(null);
  const [submittingToDean, setSubmittingToDean] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setDesignation(user.designation || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ fullName, designation, phone })
      });
      if (res.success && res.data) {
        if (updateUser) updateUser(res.data);
        setIsEditingProfile(false);
        setProfileMsg('Personal details updated successfully.');
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update personal details.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErr('');
    setPasswordMsg('');
    if (newPassword !== confirmPassword) {
      setPasswordErr('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErr('New password must be at least 6 characters.');
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.success) {
        setPasswordMsg('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMsg(''), 4000);
      }
    } catch (err: any) {
      setPasswordErr(err.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const taskQuery = user?.role === 'COORDINATOR' ? '/tasks?scope=dean_tasks' : '/tasks';
      const [statsRes, tasksRes, annRes] = await Promise.all([
        apiFetch('/analytics/dashboard'),
        apiFetch(taskQuery),
        apiFetch('/announcements')
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
        if (statsRes.data?.coordinatorPerformance?.length > 0 && !newCoordinatorId) {
          setNewCoordinatorId(statsRes.data.coordinatorPerformance[0].id);
        }
      }
      if (tasksRes.success) setTasks(tasksRes.data);
      if (annRes.success) setAnnouncements(annRes.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingTaskProgress) return;
    setSavingProgress(true);
    try {
      const res = await apiFetch(`/tasks/${updatingTaskProgress._id || updatingTaskProgress.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: coordProgressVal === 100 ? 'COMPLETED' : coordProgressVal > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
          progressPercentage: coordProgressVal,
          notes: coordProgressNotes
        })
      });
      if (res.success) {
        setUpdatingTaskProgress(null);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update task progress.');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSubmitDeliverableToDean = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingDeanTask) return;
    setSubmittingToDean(true);
    try {
      let uploadedFiles: any[] = [];
      if (coordSubmitFile) {
        const formData = new FormData();
        formData.append('file', coordSubmitFile);
        const uploadRes = await apiFetch('/upload', { method: 'POST', body: formData });
        if (uploadRes.success && uploadRes.data) {
          uploadedFiles.push(uploadRes.data);
        }
      }

      const res = await apiFetch(`/tasks/${submittingDeanTask._id || submittingDeanTask.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          notes: coordSubmitNotes,
          files: uploadedFiles
        })
      });

      if (res.success) {
        setSubmittingDeanTask(null);
        setCoordSubmitNotes('');
        setCoordSubmitFile(null);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit deliverable.');
    } finally {
      setSubmittingToDean(false);
    }
  };

  const handleCreateDeanTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Task title is required.');
      return;
    }
    const finalDueDate = newDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    try {
      const res = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc ? newDesc.trim() : '',
          category: newCategory,
          priority: newPriority,
          dueDate: finalDueDate,
          dueTime: newDueTime || '17:00',
          instructions: newInstructions ? newInstructions.trim() : '',
          expectedDeliverables: newDeliverables ? newDeliverables.trim() : '',
          assigneeIds: newCoordinatorId ? [newCoordinatorId] : []
        })
      });

      if (res.success) {
        setShowAssignModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewInstructions('');
        setNewDeliverables('');
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to assign task');
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      const res = await apiFetch(`/tasks/${editingTask._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          category: editCategory,
          priority: editPriority,
          dueDate: editDueDate
        })
      });

      if (res.success) {
        setEditingTask(null);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const handleReviewSubmission = async (action: 'APPROVE' | 'REVISE') => {
    if (!reviewingTask) return;
    setReviewSubmitting(true);
    try {
      const res = await apiFetch(`/tasks/${reviewingTask._id || reviewingTask.id}/review`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          remarks: reviewRemarks
        })
      });

      if (res.success) {
        setReviewingTask(null);
        setReviewRemarks('');
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message || 'Review action failed');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department notice?')) return;
    try {
      const res = await apiFetch(`/announcements/${id}`, { method: 'DELETE' });
      if (res.success) {
        setAnnouncements(announcements.filter((a) => a._id !== id));
      }
    } catch {
      alert('Failed to delete announcement.');
    }
  };

  if (!user) return null;

  const currentUserId = user._id || (user as any).id;
  const isDean = user.role === 'HOD' || (user as any).role === 'DEAN';
  const isCoordinator = user.role === 'COORDINATOR';
  const isFaculty = user.role === 'FACULTY';

  // Filter tasks for faculty: hide tasks where submission is already done (SUBMITTED, UNDER_REVIEW, COMPLETED, or submittedAt)
  const displayTasks = tasks.filter((task) => {
    if (user.role === 'FACULTY') {
      const myAssignee =
        task.assignees?.find(
          (a: any) =>
            (a.facultyId?._id && a.facultyId._id.toString() === currentUserId?.toString()) ||
            (a.facultyId && a.facultyId.toString() === currentUserId?.toString())
        ) || task.assignees?.[0];

      if (!myAssignee) return false;
      const isDone =
        myAssignee.status === 'SUBMITTED' ||
        myAssignee.status === 'UNDER_REVIEW' ||
        myAssignee.status === 'COMPLETED' ||
        Boolean(myAssignee.submittedAt);
      return !isDone;
    }
    return true;
  });

  // Calculate dynamic chart distribution from actual DB tasks
  const completedCount = stats?.completedTasksCount ?? 0;
  const inProgressCount = stats?.inProgressTasksCount ?? 0;
  const pendingCount = stats?.pendingTasksCount ?? 0;
  const overdueCount = stats?.overdueTasksCount ?? 0;
  const awaitingCount = stats?.awaitingApprovalCount ?? 0;
  const totalCalculated = completedCount + inProgressCount + pendingCount + overdueCount + awaitingCount || tasks.length || 1;

  const donutData = [
    { name: 'Completed', value: completedCount, color: '#219653' },
    { name: 'In Progress', value: inProgressCount, color: '#3578D4' },
    { name: 'Pending', value: pendingCount, color: '#E47B32' },
    { name: 'Overdue', value: overdueCount, color: '#D94B4B' },
    { name: 'Awaiting Approval', value: awaitingCount, color: '#7051C8' }
  ];

  // Filter tasks for Status Drilldown Modal
  const drilldownTasks = tasks.filter((t) => {
    if (!statusDrilldownModal) return false;
    if (statusDrilldownModal === 'Completed') return t.overallStatus === 'COMPLETED';
    if (statusDrilldownModal === 'In Progress') return t.overallStatus === 'IN_PROGRESS';
    if (statusDrilldownModal === 'Pending') return t.overallStatus === 'NOT_STARTED';
    if (statusDrilldownModal === 'Overdue') return t.overallStatus !== 'COMPLETED' && new Date(t.dueDate) < new Date();
    if (statusDrilldownModal === 'Awaiting Approval') {
      return (
        t.overallStatus === 'SUBMITTED' ||
        t.overallStatus === 'UNDER_REVIEW' ||
        t.assignees?.some((a: any) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW')
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-[#7051C8]">
              {isDean ? 'Dean, CSE' : user.role === 'COORDINATOR' ? 'Academic Coordinator' : 'Faculty'} Workspace
            </span>
            <span className="text-xs text-[#737784]">| Department of Computer Science & Engineering</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#24232B] mt-1">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-[#737784] mt-0.5">
            {isDean
              ? 'Institutional oversight, Academic Coordinator accountability, and faculty performance monitoring.'
              : isCoordinator
              ? 'Personal executive workspace — Dean-assigned responsibilities, execution milestones, and department progress oversight.'
              : 'Assigned academic tasks, document submissions, and peer collaboration.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {isDean && (
            <button
              onClick={() => {
                setNewDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
                setShowAssignModal(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#7051C8] hover:bg-[#50305F] rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Task to Coordinator</span>
            </button>
          )}
          <Link
            to="/tasks"
            className="px-3 py-2 text-xs font-semibold text-[#7051C8] bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center space-x-1"
          >
            <span>{isDean ? 'Department Progress' : isCoordinator ? 'Department Progress & Faculty Tasks' : 'My Assigned Tasks'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* DASHBOARD KPI CARDS (6 Key Indicators) */}
      {isDean ? (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#737784] flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7051C8]" />
              <span>Departmental KPI Overview</span>
            </h2>
            <span className="text-[11px] font-semibold text-[#219653] flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#219653] animate-pulse"></span>
              <span>6 Key Indicators</span>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* 1. Total Tasks Assigned */}
            <div className="bg-white p-4 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col justify-between">
              <span className="text-xs font-medium text-[#737784]">Total Assigned</span>
              <div className="my-1.5 text-2xl font-bold text-[#24232B]">{stats?.totalTasksAssigned ?? 0}</div>
              <span className="text-[11px] text-gray-500">All Deliverables</span>
            </div>

            {/* 2. Completed Tasks */}
            <div className="bg-white p-4 rounded-xl border border-green-200 bg-green-50/20 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-medium text-[#219653]">Completed Tasks</span>
              <div className="my-1.5 text-2xl font-bold text-[#219653]">{stats?.completedTasksCount ?? 0}</div>
              <span className="text-[11px] text-[#219653] font-semibold">Approved</span>
            </div>

            {/* 3. In-Progress Tasks */}
            <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-medium text-[#3578D4]">In-Progress</span>
              <div className="my-1.5 text-2xl font-bold text-[#3578D4]">{stats?.inProgressTasksCount ?? 0}</div>
              <span className="text-[11px] text-[#3578D4] font-semibold">Active Execution</span>
            </div>

            {/* 4. Overall Department Performance */}
            <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-medium text-[#7051C8]">Department Performance</span>
              <div className="my-1.5 text-2xl font-bold text-[#7051C8]">{stats?.completionRate ?? 0}%</div>
              <span className="text-[11px] text-[#7051C8] font-semibold">Target: 95%</span>
            </div>

            {/* 5. Tasks Awaiting Approval */}
            <div
              onClick={() => setStatusDrilldownModal('Awaiting Approval')}
              className="bg-white p-4 rounded-xl border border-purple-300 bg-purple-50/30 shadow-sm flex flex-col justify-between cursor-pointer hover:border-[#7051C8] transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7051C8]">Awaiting Approval</span>
                <span className="w-2 h-2 rounded-full bg-[#7051C8] animate-ping"></span>
              </div>
              <div className="my-1.5 text-2xl font-bold text-[#7051C8]">{stats?.awaitingApprovalCount ?? 0}</div>
              <span className="text-[11px] text-[#7051C8] font-semibold">Click to Review &rarr;</span>
            </div>

            {/* 6. At-Risk Tasks */}
            <div
              onClick={() => setStatusDrilldownModal('Overdue')}
              className="bg-white p-4 rounded-xl border border-amber-300 bg-amber-50/30 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-500 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E47B32]">At-Risk Tasks</span>
                <AlertTriangle className="w-4 h-4 text-[#E47B32]" />
              </div>
              <div className="my-1.5 text-2xl font-bold text-[#E47B32]">{stats?.atRiskTasksCount ?? 0}</div>
              <span className="text-[11px] text-[#E47B32] font-semibold">Due in &lt; 48 hours</span>
            </div>
          </div>
        </div>
      ) : isCoordinator ? (
        /* Coordinator Personal KPI Cards (Dean-Assigned Responsibilities ONLY) */
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#737784] flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7051C8]" />
              <span>Coordinator Responsibilities Overview</span>
            </h2>
            <span className="text-[11px] font-semibold text-[#219653] flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#219653] animate-pulse"></span>
              <span>Personal Executive KPIs</span>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* 1. Total Assigned */}
            <div className="bg-white p-4 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col justify-between">
              <span className="text-xs font-medium text-[#737784]">Total Assigned</span>
              <div className="my-1.5 text-2xl font-bold text-[#24232B]">{stats?.totalTasksAssigned ?? 0}</div>
              <span className="text-[11px] text-gray-500">From Dean</span>
            </div>

            {/* 2. Completed Tasks */}
            <div className="bg-white p-4 rounded-xl border border-green-200 bg-green-50/20 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-medium text-[#219653]">Completed Tasks</span>
              <div className="my-1.5 text-2xl font-bold text-[#219653]">{stats?.completedTasksCount ?? 0}</div>
              <span className="text-[11px] text-[#219653] font-semibold">Dean Approved</span>
            </div>

            {/* 3. In-Progress */}
            <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-medium text-[#3578D4]">In-Progress</span>
              <div className="my-1.5 text-2xl font-bold text-[#3578D4]">{stats?.inProgressTasksCount ?? 0}</div>
              <span className="text-[11px] text-[#3578D4] font-semibold">Active Execution</span>
            </div>

            {/* 4. Pending */}
            <div className="bg-white p-4 rounded-xl border border-orange-200 bg-orange-50/20 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-medium text-[#E47B32]">Pending Tasks</span>
              <div className="my-1.5 text-2xl font-bold text-[#E47B32]">{stats?.pendingTasksCount ?? 0}</div>
              <span className="text-[11px] text-[#E47B32] font-semibold">Not Started</span>
            </div>

            {/* 5. Awaiting Dean Approval */}
            <div className="bg-white p-4 rounded-xl border border-purple-300 bg-purple-50/30 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-[#7051C8]">Awaiting Approval</span>
              <div className="my-1.5 text-2xl font-bold text-[#7051C8]">{stats?.awaitingApprovalCount ?? 0}</div>
              <span className="text-[11px] text-[#7051C8] font-semibold">Submitted to Dean</span>
            </div>

            {/* 6. Completion Rate */}
            <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-medium text-[#7051C8]">Completion Rate</span>
              <div className="my-1.5 text-2xl font-bold text-[#7051C8]">{stats?.completionRate ?? 0}%</div>
              <span className="text-[11px] text-[#7051C8] font-semibold">Dean Deliverables</span>
            </div>
          </div>
        </div>
      ) : (
        /* Faculty View */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E6E8ED] shadow-sm">
            <span className="text-xs font-medium text-[#737784]">My Active Tasks</span>
            <div className="mt-2 text-2xl font-bold text-[#24232B]">{stats?.activeTasksCount ?? 0}</div>
            <span className="text-[11px] text-[#737784]">Pending submission</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E6E8ED] shadow-sm">
            <span className="text-xs font-medium text-[#737784]">Completed Tasks</span>
            <div className="mt-2 text-2xl font-bold text-[#219653]">{stats?.completedTasksCount ?? 0}</div>
            <span className="text-[11px] text-[#737784]">Approved submissions</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E6E8ED] shadow-sm">
            <span className="text-xs font-medium text-[#737784]">Overdue</span>
            <div className="mt-2 text-2xl font-bold text-[#D94B4B]">{stats?.overdueTasksCount ?? 0}</div>
            <span className="text-[11px] text-[#737784]">Past scheduled deadline</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E6E8ED] shadow-sm">
            <span className="text-xs font-medium text-[#737784]">Completion Rate</span>
            <div className="mt-2 text-2xl font-bold text-[#7051C8]">{stats?.completionRate ?? 0}%</div>
            <span className="text-[11px] text-[#737784]">Execution progress</span>
          </div>
        </div>
      )}

      {/* 5. NEEDS YOUR ATTENTION SECTION (Actionable Alert Section for Dean) */}
      {isDean && stats?.needsAttention && stats.needsAttention.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50/40 to-white shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#7051C8] text-white flex items-center justify-center font-bold text-xs">
                !
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#24232B]">Needs Your Attention</h2>
                <p className="text-[11px] text-[#737784]">
                  High-priority items requiring Dean review, deadline extension, or approval.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#7051C8] bg-purple-100 px-2.5 py-0.5 rounded-full">
              {stats.needsAttention.length} Action Items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {stats.needsAttention.slice(0, 6).map((item: any) => (
              <div
                key={item.id}
                className="p-3.5 bg-white rounded-lg border border-[#E6E8ED] hover:border-[#7051C8] transition-all shadow-xs flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.badgeText}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500">
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#24232B] line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-[#737784] line-clamp-1 mt-0.5">{item.notes}</p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-medium">
                    By: {item.coordinatorName}
                  </span>
                  <button
                    onClick={() => {
                      const fullTask = tasks.find((t) => t._id === item.id) || item;
                      setReviewingTask(fullTask);
                    }}
                    className="px-2.5 py-1 bg-[#7051C8] hover:bg-[#50305F] text-white text-[11px] font-semibold rounded shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TASK PROGRESS CHARTS (Clickable Donut Chart + Category Breakdown Bar Chart) */}
      {isDean && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut Chart: Clickable to Filter by Status */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-sm font-bold text-[#24232B] flex items-center space-x-2">
                  <PieIcon className="w-4 h-4 text-[#7051C8]" />
                  <span>Task Status Distribution</span>
                </h2>
                <span className="text-[11px] font-semibold text-[#7051C8]">Interactive Drilldown</span>
              </div>
              <p className="text-xs text-[#737784] mt-1.5">
                Exact count & percentages dynamically calculated from database records. Click any slice to inspect tasks.
              </p>
            </div>

            <div className="h-64 w-full my-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={(entry) => setStatusDrilldownModal(entry.name)}
                    cursor="pointer"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val} Deliverables (${Math.round((Number(val) / totalCalculated) * 100)}%)`,
                      name
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', cursor: 'pointer' }}
                    onClick={(entry) => setStatusDrilldownModal(entry.value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-2xl font-extrabold text-[#24232B]">{stats?.totalTasksAssigned ?? 0}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Tasks</span>
              </div>
            </div>

            {/* Clickable Quick Filter Chips */}
            <div className="pt-3 border-t border-gray-100 grid grid-cols-5 gap-1.5 text-center text-xs">
              {donutData.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setStatusDrilldownModal(item.name)}
                  className="p-1 rounded hover:bg-gray-50 transition-colors text-center"
                >
                  <span style={{ color: item.color }} className="font-bold text-sm block">
                    {item.value}
                  </span>
                  <span className="text-[9px] text-gray-500 uppercase block truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart: Category & Deliverables Progress */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-sm font-bold text-[#24232B] flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-[#7051C8]" />
                  <span>Department Progress by Academic Category</span>
                </h2>
                <span className="text-[11px] text-[#7051C8] font-medium bg-purple-50 px-2 py-0.5 rounded">
                  {stats?.completionRate || 0}% Overall Completion
                </span>
              </div>
              <p className="text-xs text-[#737784] mt-1.5">
                Completed vs. Ongoing deliverables mapped across accreditation & curriculum criteria.
              </p>
            </div>

            <div className="h-64 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      category: 'Examination',
                      Completed: tasks.filter((t) => t.category === 'Examination' && t.overallStatus === 'COMPLETED').length,
                      Ongoing: tasks.filter((t) => t.category === 'Examination' && t.overallStatus !== 'COMPLETED').length
                    },
                    {
                      category: 'Documentation',
                      Completed: tasks.filter((t) => t.category === 'Documentation' && t.overallStatus === 'COMPLETED').length,
                      Ongoing: tasks.filter((t) => t.category === 'Documentation' && t.overallStatus !== 'COMPLETED').length
                    },
                    {
                      category: 'Accreditation',
                      Completed: tasks.filter((t) => t.category === 'Accreditation' && t.overallStatus === 'COMPLETED').length,
                      Ongoing: tasks.filter((t) => t.category === 'Accreditation' && t.overallStatus !== 'COMPLETED').length
                    },
                    {
                      category: 'Curriculum',
                      Completed: tasks.filter((t) => t.category === 'Curriculum' && t.overallStatus === 'COMPLETED').length,
                      Ongoing: tasks.filter((t) => t.category === 'Curriculum' && t.overallStatus !== 'COMPLETED').length
                    },
                    {
                      category: 'Audit & Review',
                      Completed: tasks.filter((t) => (t.category === 'Audit' || t.category === 'Academic') && t.overallStatus === 'COMPLETED').length,
                      Ongoing: tasks.filter((t) => (t.category === 'Audit' || t.category === 'Academic') && t.overallStatus !== 'COMPLETED').length
                    }
                  ]}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Completed" fill="#219653" radius={[4, 4, 0, 0]} name="Completed Deliverables" />
                  <Bar dataKey="Ongoing" fill="#3578D4" radius={[4, 4, 0, 0]} name="Ongoing / Active" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 text-[11px] text-[#737784] flex items-center justify-between">
              <span>Automatically updates upon coordinator review approval</span>
              <Link to="/tasks" className="font-semibold text-[#7051C8] hover:underline">
                Inspect All Deliverables &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ACADEMIC COORDINATOR OVERVIEW */}
      {isDean && stats?.coordinatorPerformance && stats.coordinatorPerformance.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#24232B] flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#7051C8]" />
                <span>Academic Coordinator Overview</span>
              </h2>
              <p className="text-xs text-[#737784] mt-0.5">
                Executive supervisory overview — Faculty workload supervision, task completions, and Dean-assigned responsibilities.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#7051C8] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
              <Users className="w-4 h-4 text-[#7051C8]" />
              <span>{stats.coordinatorPerformance.length} {stats.coordinatorPerformance.length === 1 ? 'Coordinator' : 'Coordinators'} Active</span>
            </div>
          </div>

          {/* Dynamic Coordinator Cards Container:
              Adapts dynamically: 1 coordinator renders a clean, compact overview card;
              multiple coordinators in future automatically display in a responsive grid.
          */}
          <div className={`grid grid-cols-1 ${stats.coordinatorPerformance.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
            {stats.coordinatorPerformance.map((coord: any) => {
              const facTotal = coord.facultyTasksTotal || 0;
              const facComp = coord.facultyTasksCompleted || 0;
              const facInProg = (coord.facultyTasksInProgress || 0) + (coord.facultyTasksPending || 0);
              const facOverdue = coord.facultyTasksOverdue || 0;
              const facReqAttention = coord.facultyTasksRequiringAttention || 0;
              const facRate = coord.facultyCompletionRate ?? (facTotal > 0 ? Math.round((facComp / facTotal) * 100) : 0);

              const deanTotal = coord.deanTasksTotal || coord.tasks?.length || 0;
              const deanComp = coord.deanTasksCompleted || coord.completed || 0;
              const deanRate = coord.deanCompletionRate ?? (deanTotal > 0 ? Math.round((deanComp / deanTotal) * 100) : 0);

              return (
                <div
                  key={coord.id}
                  className="p-5 rounded-xl border border-[#E6E8ED] bg-[#F7F8FA] hover:border-[#7051C8]/60 transition-all space-y-4"
                >
                  {/* Coordinator Identity Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#7051C8] flex items-center justify-center font-bold text-lg shadow-xs">
                        {coord.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-[#24232B] text-base">{coord.fullName}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-[#7051C8]">
                            Academic Coordinator
                          </span>
                        </div>
                        <p className="text-xs text-[#737784] mt-0.5">
                          {coord.designation} • Department of {coord.department || 'Computer Science and Engineering'}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Emp ID: <strong className="text-gray-700">{coord.employeeId}</strong> • {coord.email}
                        </p>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedCoordinator(coord)}
                      className="px-3.5 py-2 text-xs font-semibold text-[#7051C8] bg-white hover:bg-purple-50 border border-purple-200 rounded-lg shadow-xs transition-colors flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Managed Faculty Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                    <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                      <span className="text-[11px] font-medium text-gray-500 block">Faculty Managed</span>
                      <span className="text-xl font-bold text-[#24232B] mt-0.5 block">
                        {coord.managedFacultyCount ?? stats.totalFaculty ?? 4}
                      </span>
                      <span className="text-[10px] text-gray-400">Department Staff</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                      <span className="text-[11px] font-medium text-gray-500 block">Total Faculty Tasks</span>
                      <span className="text-xl font-bold text-[#24232B] mt-0.5 block">{facTotal}</span>
                      <span className="text-[10px] text-gray-400">Assigned Deliverables</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-green-200 bg-green-50/20">
                      <span className="text-[11px] font-medium text-[#219653] block">Completed</span>
                      <span className="text-xl font-bold text-[#219653] mt-0.5 block">{facComp}</span>
                      <span className="text-[10px] text-[#219653]">Approved Work</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-blue-200 bg-blue-50/20">
                      <span className="text-[11px] font-medium text-[#3578D4] block">Pending / In-Progress</span>
                      <span className="text-xl font-bold text-[#3578D4] mt-0.5 block">{facInProg}</span>
                      <span className="text-[10px] text-[#3578D4]">In Execution</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-red-200 bg-red-50/20 col-span-2 sm:col-span-1">
                      <span className="text-[11px] font-medium text-[#D94B4B] block">Overdue Tasks</span>
                      <span className="text-xl font-bold text-[#D94B4B] mt-0.5 block">{facOverdue}</span>
                      <span className="text-[10px] text-[#D94B4B]">Past Deadline</span>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar for Overall Faculty Task Completion */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#219653]" />
                        <span>Overall Faculty Task Completion</span>
                      </span>
                      <span className="font-bold text-[#219653]">{facRate}% Complete</span>
                    </div>
                    {/* Single solid green horizontal progress bar */}
                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${facRate}%` }}
                        className="bg-[#219653] h-full rounded-full transition-all duration-500"
                        title={`Overall Faculty Task Completion: ${facRate}%`}
                      />
                    </div>
                  </div>

                  {/* Bottom Row: Tasks Requiring Attention & Separate Indication of Coordinator's Own Tasks from Dean */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-200/70">
                    {/* 7. Tasks Requiring Attention */}
                    <div className="p-3 bg-white rounded-lg border border-amber-200 bg-amber-50/20 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <AlertTriangle className="w-4 h-4 text-[#E47B32] shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-[#24232B] block">Tasks Requiring Attention</span>
                          <span className="text-[11px] text-[#737784]">Pending reviews, revisions & approaching deadlines</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        facReqAttention > 0 ? 'bg-orange-100 text-[#E47B32]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {facReqAttention} Items
                      </span>
                    </div>

                    {/* 8. Separate Indication of Coordinator's Own Tasks Assigned by Dean */}
                    <div className="p-3 bg-white rounded-lg border border-purple-200 bg-purple-50/20 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <ShieldCheck className="w-4 h-4 text-[#7051C8] shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-[#24232B] block">Dean-Assigned Responsibilities</span>
                          <span className="text-[11px] text-[#737784]">Executive tasks assigned directly by Dean</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#7051C8] block">
                          {deanComp} of {deanTotal} Completed
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">{deanRate}% Complete</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TASK MANAGEMENT & SIDEBAR */}
      <div className={`grid grid-cols-1 ${!isFaculty ? 'xl:grid-cols-3' : ''} gap-6`}>
        {/* Left / Main Task Management */}
        <div className={`${!isFaculty ? 'xl:col-span-2' : ''} space-y-4`}>
          {isCoordinator ? (
            /* Dedicated Coordinator View: Responsibilities Assigned by Dean */
            <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#24232B] flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-[#7051C8]" />
                    <span>Dean-Assigned Responsibilities</span>
                  </h2>
                  <p className="text-xs text-[#737784] mt-0.5">
                    Executive deliverables assigned directly to you by Dean Dr. G. Vishnu Murthy.
                  </p>
                </div>
                <Link
                  to="/tasks"
                  className="px-3.5 py-2 text-xs font-semibold text-[#7051C8] bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
                >
                  <Users className="w-4 h-4 text-[#7051C8]" />
                  <span>Department Progress & Faculty Tasks &rarr;</span>
                </Link>
              </div>

              {/* Tasks List */}
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#737784] bg-gray-50 rounded-lg border border-dashed">
                  No active deliverables assigned by the Dean at this time. All caught up!
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task: any) => {
                    const myAssignee =
                      task.assignees?.find(
                        (a: any) =>
                          (a.facultyId?._id && a.facultyId._id.toString() === currentUserId?.toString()) ||
                          (a.facultyId && a.facultyId.toString() === currentUserId?.toString())
                      ) || task.assignees?.[0];

                    const isCompleted = task.overallStatus === 'COMPLETED' || myAssignee?.status === 'COMPLETED';
                    const isSubmitted =
                      task.overallStatus === 'SUBMITTED' ||
                      task.overallStatus === 'UNDER_REVIEW' ||
                      myAssignee?.status === 'SUBMITTED' ||
                      myAssignee?.status === 'UNDER_REVIEW';
                    const progressVal = isCompleted
                      ? 100
                      : myAssignee?.progressPercentage ?? task.progressPercentage ?? (isSubmitted ? 85 : 0);
                    const isOverdue = !isCompleted && !isSubmitted && new Date(task.dueDate) < new Date();

                    return (
                      <div
                        key={task._id || task.id}
                        className="p-5 rounded-xl border border-[#E6E8ED] bg-[#F7F8FA] hover:border-[#7051C8]/60 transition-all space-y-3.5"
                      >
                        {/* Top Row: Priority, Category, Status & Deadline */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                                task.priority === 'URGENT'
                                  ? 'bg-red-100 text-[#D94B4B]'
                                  : task.priority === 'HIGH'
                                  ? 'bg-orange-100 text-[#E47B32]'
                                  : 'bg-blue-100 text-[#3578D4]'
                              }`}
                            >
                              {task.priority} Priority
                            </span>
                            <span className="text-[10px] font-medium text-gray-600 bg-gray-200/70 px-2 py-0.5 rounded">
                              {task.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isCompleted
                                  ? 'bg-green-100 text-[#219653]'
                                  : isSubmitted
                                  ? 'bg-purple-100 text-[#7051C8]'
                                  : isOverdue
                                  ? 'bg-red-100 text-[#D94B4B]'
                                  : 'bg-blue-100 text-[#3578D4]'
                              }`}
                            >
                              {isCompleted
                                ? '✓ Dean Approved'
                                : isSubmitted
                                ? 'Awaiting Dean Approval'
                                : isOverdue
                                ? '⚠ Overdue'
                                : 'In Progress'}
                            </span>
                          </div>

                          <span
                            className={`text-xs font-semibold flex items-center space-x-1 ${
                              isOverdue ? 'text-[#D94B4B]' : 'text-gray-500'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              Deadline: {new Date(task.dueDate).toLocaleDateString()} at {task.dueTime || '17:00'}
                            </span>
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-base font-bold text-[#24232B]">{task.title}</h3>
                          <p className="text-xs text-[#737784] mt-1 leading-relaxed whitespace-pre-line">
                            {task.description}
                          </p>
                        </div>

                        {/* Expected Deliverables & Dean Instructions */}
                        {(task.expectedDeliverables || task.instructions) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                            {task.expectedDeliverables && (
                              <div className="p-3 bg-white rounded-lg border border-green-200 bg-green-50/20">
                                <span className="text-[11px] font-bold text-[#219653] block mb-0.5">
                                  Expected Deliverables:
                                </span>
                                <p className="text-gray-700">{task.expectedDeliverables}</p>
                              </div>
                            )}
                            {task.instructions && (
                              <div className="p-3 bg-white rounded-lg border border-purple-200 bg-purple-50/20">
                                <span className="text-[11px] font-bold text-[#7051C8] block mb-0.5">
                                  Dean Instructions:
                                </span>
                                <p className="text-gray-700">{task.instructions}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Solid Green Progress Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-700">Execution Progress</span>
                            <span className="font-bold text-[#219653]">{progressVal}% Completed</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${progressVal}%` }}
                              className="bg-[#219653] h-full rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>

                        {/* Submissions & Dean Remarks */}
                        {(myAssignee?.submissionNotes ||
                          (myAssignee?.submissionFiles && myAssignee.submissionFiles.length > 0) ||
                          myAssignee?.reviewerRemarks) && (
                          <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-2 text-xs">
                            {myAssignee?.submissionNotes && (
                              <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase block">
                                  Your Submission Notes:
                                </span>
                                <p className="text-gray-800">{myAssignee.submissionNotes}</p>
                              </div>
                            )}
                            {myAssignee?.submissionFiles && myAssignee.submissionFiles.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Uploaded Files:</span>
                                {myAssignee.submissionFiles.map((f: any, fIdx: number) => (
                                  <a
                                    key={fIdx}
                                    href={getFileUrl(f.fileUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-[#7051C8] hover:underline flex items-center space-x-1"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{f.fileName}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                            {myAssignee?.reviewerRemarks && (
                              <div className="p-2.5 bg-purple-50 rounded border border-purple-200 text-purple-900 mt-2">
                                <span className="text-[10px] font-bold uppercase block text-[#7051C8]">
                                  Dean Decision Feedback:
                                </span>
                                <p className="text-xs mt-0.5">{myAssignee.reviewerRemarks}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Coordinator Action Buttons */}
                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200/80">
                          <button
                            onClick={() => {
                              setUpdatingTaskProgress(task);
                              setCoordProgressVal(myAssignee?.progressPercentage ?? task.progressPercentage ?? 0);
                              setCoordProgressNotes(myAssignee?.submissionNotes || '');
                            }}
                            className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
                          >
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            <span>Update Progress</span>
                          </button>

                          <button
                            onClick={() => {
                              setSubmittingDeanTask(task);
                              setCoordSubmitNotes(myAssignee?.submissionNotes || '');
                              setCoordSubmitFile(null);
                            }}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-[#219653] hover:bg-[#1b7a43] rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isSubmitted ? 'Update Deliverable' : 'Submit Completed Work to Dean'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Dean & Faculty Task View */
            <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#24232B] flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#7051C8]" />
                  <span>
                    {isDean
                      ? 'Academic Coordinator Tasks & Submissions'
                      : 'My Current Academic Tasks'}
                  </span>
                </h2>
                <Link to="/tasks" className="text-xs text-[#7051C8] hover:underline font-medium">
                  View all
                </Link>
              </div>

              {displayTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#737784]">
                  No pending tasks found. All caught up!
                </div>
              ) : (
                <div className="space-y-3">
                  {displayTasks.slice(0, 5).map((task) => (
                    <div
                      key={task._id}
                      className="p-3.5 rounded-lg border border-[#E6E8ED] hover:border-[#7051C8]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              task.priority === 'HIGH' || task.priority === 'URGENT'
                                ? 'bg-orange-100 text-[#E47B32]'
                                : 'bg-gray-100 text-[#77808D]'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-[#737784] font-medium">
                            {task.category}
                          </span>
                          {isDean && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                task.overallStatus === 'COMPLETED'
                                  ? 'bg-green-100 text-[#219653]'
                                  : task.overallStatus === 'SUBMITTED' || task.overallStatus === 'UNDER_REVIEW'
                                  ? 'bg-purple-100 text-[#7051C8]'
                                  : 'bg-blue-100 text-[#3578D4]'
                              }`}
                            >
                              {task.overallStatus === 'COMPLETED'
                                ? 'Completed'
                                : task.overallStatus === 'SUBMITTED'
                                ? 'Awaiting Review'
                                : 'In Progress'}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-[#24232B] truncate">
                          {task.title}
                        </h3>
                        <p className="text-xs text-[#737784] line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-2 shrink-0">
                        <div className="text-left sm:text-right mr-1">
                          <span className="text-[11px] font-medium text-[#D94B4B] block">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-[#737784]">
                            {isDean
                              ? `Coordinated by: ${(task.createdBy as any)?.fullName || 'Academic Coordinator'}`
                              : `${task.assignees?.length || 1} faculty assigned`}
                          </span>
                        </div>

                        {/* Dean Actions */}
                        {isDean && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setEditTitle(task.title);
                                setEditDesc(task.description);
                                setEditCategory(task.category);
                                setEditPriority(task.priority);
                                setEditDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
                              }}
                              title="Edit Task"
                              className="p-1.5 text-gray-500 hover:text-[#7051C8] hover:bg-purple-50 rounded"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              title="Delete Task"
                              className="p-1.5 text-gray-500 hover:text-[#D94B4B] hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setReviewingTask(task)}
                              className="px-2.5 py-1 text-xs font-medium text-[#7051C8] bg-purple-50 hover:bg-purple-100 rounded"
                            >
                              Review
                            </button>
                          </div>
                        )}

                        {!isDean && (
                          <Link
                            to={`/tasks`}
                            className="px-3 py-1.5 text-xs font-medium text-[#7051C8] bg-purple-50 hover:bg-purple-100 rounded-md"
                          >
                            {user.role === 'FACULTY' ? 'Submit Work' : 'Details'}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Coordinator Profile & Security OR Dean Recent Activity & Circulars (Hidden for Faculty) */}
        {isCoordinator ? (
          <div className="space-y-4">
            {/* Personal Information & Account Details */}
            <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-[#24232B] flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-[#7051C8]" />
                    <span>Personal Information</span>
                  </h2>
                  <p className="text-[11px] text-[#737784] mt-0.5">
                    View and update your profile details
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="inline-flex items-center space-x-1 text-xs text-[#7051C8] hover:underline font-semibold shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingProfile ? 'Cancel' : 'Edit Details'}</span>
                </button>
              </div>

              {profileMsg && (
                <div className="p-2.5 bg-green-50 text-green-700 text-xs rounded-md border border-green-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{profileMsg}</span>
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#24232B] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#24232B] mb-1">
                      Official Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#24232B] mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-3.5 py-1.5 bg-[#7051C8] text-white rounded-lg text-xs font-semibold hover:bg-[#50305F] shadow-xs disabled:opacity-50"
                    >
                      {profileSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 border-b border-gray-100 gap-1">
                    <span className="text-[#737784] font-medium shrink-0">Full Name</span>
                    <span className="font-semibold text-[#24232B] sm:text-right">{user.fullName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 border-b border-gray-100 gap-1">
                    <span className="text-[#737784] font-medium shrink-0">Email</span>
                    <span className="font-semibold text-[#24232B] sm:text-right break-all">{user.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 border-b border-gray-100 gap-1">
                    <span className="text-[#737784] font-medium shrink-0">Employee ID</span>
                    <span className="font-semibold text-[#24232B] sm:text-right">{user.employeeId}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 border-b border-gray-100 gap-1">
                    <span className="text-[#737784] font-medium shrink-0">Assigned Role</span>
                    <span className="font-bold text-[#7051C8] bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200 self-start sm:self-auto">
                      {user.role === 'COORDINATOR' ? 'Academic Coordinator' : user.role === 'HOD' ? 'Dean, CSE' : 'Faculty Member'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-1.5 border-b border-gray-100 gap-1">
                    <span className="text-[#737784] font-medium shrink-0">Department</span>
                    <span className="font-semibold text-[#24232B] sm:text-right">{user.department || 'Computer Science & Engineering'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 border-b border-gray-100 gap-1">
                    <span className="text-[#737784] font-medium shrink-0">Designation</span>
                    <span className="font-semibold text-[#24232B] sm:text-right">{user.designation || (user.role === 'COORDINATOR' ? 'Academic Coordinator' : 'Faculty Member')}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 gap-1">
                    <span className="text-[#737784] font-medium shrink-0">Phone</span>
                    <span className="font-semibold text-[#24232B] sm:text-right">{user.phone || 'Not specified'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Change / Reset Password Card */}
            <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm space-y-3">
              <div className="border-b border-gray-100 pb-2.5">
                <h2 className="text-sm font-bold text-[#24232B] flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#7051C8]" />
                  <span>Change / Reset Password</span>
                </h2>
                <p className="text-[11px] text-[#737784] mt-0.5">
                  Update your institutional credentials
                </p>
              </div>

              {passwordMsg && (
                <div className="p-2.5 bg-green-50 text-green-700 text-xs rounded-md border border-green-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordMsg}</span>
                </div>
              )}

              {passwordErr && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">
                  {passwordErr}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#24232B] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full text-xs p-2 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#24232B] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-xs p-2 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#24232B] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full text-xs p-2 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8] focus:outline-none"
                  />
                </div>

                <div className="pt-1.5">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="w-full py-2 bg-[#7051C8] text-white rounded-lg text-xs font-semibold hover:bg-[#50305F] shadow-xs disabled:opacity-50"
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : isDean ? (
          <div className="space-y-4">
            {/* Recent Department Activity Audit Trail */}
            <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <h2 className="text-sm font-bold text-[#24232B] flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#7051C8]" />
                  <span>Recent Department Activity</span>
                </h2>
                <span className="text-[10px] font-semibold text-[#219653]">Live Audit</span>
              </div>

              <div className="space-y-3">
                {(stats?.recentActivities || []).map((act: any) => (
                  <div key={act.id} className="flex items-start space-x-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#7051C8] mt-1.5 shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#24232B] line-clamp-1">{act.title}</p>
                      <p className="text-[11px] text-[#737784] line-clamp-1">
                        <span className="font-medium text-gray-700">{act.actor}</span> ({act.role})
                      </p>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Notices */}
            <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#24232B] flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-[#7654B8]" />
                  <span>Department Circulars</span>
                </h2>
                <Link to="/announcements" className="text-xs text-[#7051C8] hover:underline font-medium">
                  View all ({announcements.length})
                </Link>
              </div>

              {announcements.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#737784]">
                  No department circulars at this moment.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {announcements.slice(0, 3).map((a) => (
                    <div
                      key={a._id}
                      className="p-3 rounded-lg border-l-4 border-l-[#7654B8] border border-[#E6E8ED] bg-[#F7F8FA]"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-[#24232B]">{a.title}</h4>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-semibold text-[#7654B8] bg-purple-100/60 px-1.5 py-0.5 rounded">
                            {a.priority}
                          </span>
                          {isDean && (
                            <button
                              onClick={() => handleDeleteAnnouncement(a._id)}
                              title="Delete Notice (Dean)"
                              className="text-gray-400 hover:text-red-500 p-0.5 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#737784] mt-1 line-clamp-2">{a.message}</p>
                      <span className="inline-block mt-1.5 text-[10px] text-gray-400">
                        Issued {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* MODAL 1: STATUS DRILLDOWN MODAL (Triggered by clicking Donut chart / status chips) */}
      {statusDrilldownModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#E6E8ED] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#24232B] flex items-center space-x-2">
                <PieIcon className="w-4 h-4 text-[#7051C8]" />
                <span>Deliverables with Status: {statusDrilldownModal}</span>
              </h2>
              <button onClick={() => setStatusDrilldownModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {drilldownTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">
                  No deliverables currently match "{statusDrilldownModal}".
                </div>
              ) : (
                drilldownTasks.map((t) => (
                  <div key={t._id} className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E6E8ED] text-xs flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-[10px] bg-purple-100 text-[#7051C8] px-1.5 py-0.5 rounded">
                          {t.category}
                        </span>
                        <span className="font-bold text-[10px] bg-orange-100 text-[#E47B32] px-1.5 py-0.5 rounded">
                          {t.priority}
                        </span>
                        <span className="text-gray-500 text-[10px]">
                          Due: {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#24232B]">{t.title}</h4>
                      <p className="text-gray-600 text-[11px] line-clamp-1 mt-0.5">{t.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        setStatusDrilldownModal(null);
                        setReviewingTask(t);
                      }}
                      className="px-2.5 py-1 bg-[#7051C8] text-white rounded font-semibold text-[11px] shrink-0 ml-3"
                    >
                      Inspect
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: COORDINATOR DETAILS & OVERVIEW MODAL */}
      {selectedCoordinator && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-xl border border-[#E6E8ED] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7051C8] flex items-center justify-center font-bold text-base">
                  {selectedCoordinator.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#24232B] flex items-center space-x-2">
                    <span>{selectedCoordinator.fullName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-[#7051C8]">
                      Academic Coordinator
                    </span>
                  </h2>
                  <p className="text-xs text-[#737784] mt-0.5">
                    {selectedCoordinator.designation} • Department of {selectedCoordinator.department || 'Computer Science and Engineering'} • Emp ID: {selectedCoordinator.employeeId}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedCoordinator(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* Managed Faculty Workload & Department Progress Summary */}
              <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E6E8ED] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#24232B] uppercase tracking-wider flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-[#7051C8]" />
                    <span>Managed Faculty Workload & Execution Summary</span>
                  </span>
                  <span className="text-xs font-bold text-[#219653]">
                    {selectedCoordinator.facultyCompletionRate ?? selectedCoordinator.completionRate ?? 0}% Overall Completion
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-white rounded-lg border">
                    <span className="font-bold text-base text-[#24232B] block">
                      {selectedCoordinator.managedFacultyCount ?? stats.totalFaculty ?? 4}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase">Faculty Managed</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border">
                    <span className="font-bold text-base text-[#24232B] block">
                      {selectedCoordinator.facultyTasksTotal ?? selectedCoordinator.totalAssigned ?? 0}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase">Faculty Tasks</span>
                  </div>
                  <div className="p-2.5 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-bold text-base text-[#219653] block">
                      {selectedCoordinator.facultyTasksCompleted ?? selectedCoordinator.completed ?? 0}
                    </span>
                    <span className="text-[10px] text-green-700 uppercase">Completed</span>
                  </div>
                  <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="font-bold text-base text-[#3578D4] block">
                      {(selectedCoordinator.facultyTasksInProgress || 0) + (selectedCoordinator.facultyTasksPending || 0)}
                    </span>
                    <span className="text-[10px] text-blue-700 uppercase">Active / Pending</span>
                  </div>
                  <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 col-span-2 sm:col-span-1">
                    <span className="font-bold text-base text-[#D94B4B] block">
                      {selectedCoordinator.facultyTasksOverdue ?? selectedCoordinator.overdue ?? 0}
                    </span>
                    <span className="text-[10px] text-red-700 uppercase">Overdue</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${selectedCoordinator.facultyCompletionRate ?? selectedCoordinator.completionRate ?? 0}%`
                    }}
                    className="bg-[#219653] h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Coordinator's Own Tasks Assigned by Dean */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#24232B] uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#7051C8]" />
                    <span>Dean-Assigned Responsibilities</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-[#7051C8]">
                    {selectedCoordinator.deanTasksCompleted ?? selectedCoordinator.completed ?? 0} of{' '}
                    {selectedCoordinator.deanTasksTotal ?? (selectedCoordinator.tasks || []).length} Completed
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {(selectedCoordinator.tasks || []).length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 rounded-lg">
                      No direct responsibilities assigned by Dean yet.
                    </div>
                  ) : (
                    (selectedCoordinator.tasks || []).map((ct: any) => (
                      <div key={ct.id} className="p-3 bg-white rounded-lg border border-[#E6E8ED] text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[#24232B]">{ct.title}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              ct.overallStatus === 'COMPLETED'
                                ? 'bg-green-100 text-[#219653]'
                                : 'bg-blue-100 text-[#3578D4]'
                            }`}
                          >
                            {ct.overallStatus === 'COMPLETED' ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-gray-500 mt-1">
                          <span>Category: {ct.category} • Priority: {ct.priority}</span>
                          <span>Due: {new Date(ct.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Departmental Faculty Deliverables Overview */}
              {selectedCoordinator.facultyTaskItems && selectedCoordinator.facultyTaskItems.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-[#24232B] uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckSquare className="w-4 h-4 text-[#219653]" />
                    <span>Managed Departmental Deliverables ({selectedCoordinator.facultyTaskItems.length})</span>
                  </h3>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedCoordinator.facultyTaskItems.map((ft: any) => (
                      <div key={ft.id} className="p-2.5 bg-gray-50 rounded-lg border text-xs flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-gray-800">{ft.title}</span>
                          <span className="text-[10px] text-gray-500 ml-2">({ft.category} • Due: {new Date(ft.dueDate).toLocaleDateString()})</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ft.overallStatus === 'COMPLETED' ? 'bg-green-100 text-[#219653]' : 'bg-blue-100 text-[#3578D4]'
                        }`}>
                          {ft.overallStatus === 'COMPLETED' ? 'Completed' : 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REVIEW & APPROVAL MODAL FOR DEAN */}
      {reviewingTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-4 sm:p-6 shadow-xl border border-[#E6E8ED] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#24232B]">Review Deliverable Submission</h2>
              <button onClick={() => setReviewingTask(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold bg-purple-100 text-[#7051C8] px-2 py-0.5 rounded">
                  {reviewingTask.category}
                </span>
                <h3 className="text-sm font-bold text-[#24232B] mt-1.5">{reviewingTask.title}</h3>
                <p className="text-gray-600 mt-1">{reviewingTask.description}</p>
              </div>

              <div className="p-3 bg-[#F7F8FA] rounded-lg border space-y-1">
                <div><span className="font-semibold text-gray-700">Official Deadline:</span> {new Date(reviewingTask.dueDate).toLocaleDateString()}</div>
                <div><span className="font-semibold text-gray-700">Coordinated by:</span> {(reviewingTask.createdBy as any)?.fullName || 'Academic Coordinator'}</div>
              </div>

              {/* Remarks Textarea */}
              <div>
                <label className="block text-xs font-semibold text-[#24232B] mb-1">
                  Dean Review Remarks / Feedback
                </label>
                <textarea
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Enter approval comments or revision guidelines..."
                  rows={3}
                  className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8]"
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
                  <span>Approve Deliverable</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DEAN ASSIGN TASK TO ACADEMIC COORDINATOR */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#E6E8ED] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <h2 className="text-base font-bold text-[#24232B] flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#7051C8]" />
                <span>Assign Task to Academic Coordinator</span>
              </h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeanTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#24232B]">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. NBA Preparedness & Criteria 3 Dossier Review"
                  className="mt-1 w-full p-2 border border-[#E6E8ED] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24232B]">Assign to Academic Coordinator</label>
                <select
                  value={newCoordinatorId}
                  onChange={(e) => setNewCoordinatorId(e.target.value)}
                  className="mt-1 w-full p-2 border border-[#E6E8ED] rounded-lg bg-white"
                >
                  {(stats?.coordinatorPerformance || []).map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#24232B]">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 w-full p-2 border border-[#E6E8ED] rounded-lg bg-white"
                  >
                    <option value="Accreditation">Accreditation</option>
                    <option value="Examination">Examination</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Curriculum">Curriculum</option>
                    <option value="Audit">Audit & Review</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#24232B]">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="mt-1 w-full p-2 border border-[#E6E8ED] rounded-lg bg-white"
                  >
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#24232B]">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="mt-1 w-full p-2 border border-[#E6E8ED] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#24232B]">Due Time</label>
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="mt-1 w-full p-2 border border-[#E6E8ED] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#24232B]">
                  Description <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Task scope and context (optional)..."
                  rows={2}
                  className="mt-1 w-full p-2 border border-[#E6E8ED] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24232B]">
                  Instructions <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <textarea
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Specific guidelines for the Coordinator (optional)..."
                  rows={2}
                  className="mt-1 w-full p-2 border border-[#E6E8ED] rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7051C8] text-white rounded-lg font-semibold hover:bg-[#50305F]"
                >
                  Assign Responsibility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl border border-[#E6E8ED] max-h-[90vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <h2 className="text-sm font-bold text-[#24232B]">Edit Task Details</h2>
              <button onClick={() => setEditingTask(null)} className="text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="mt-1 w-full p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-3 py-1.5 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#7051C8] text-white rounded-lg font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: COORDINATOR UPDATE TASK PROGRESS MODAL */}
      {updatingTaskProgress && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl border border-[#E6E8ED] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#7051C8]" />
                <h2 className="text-sm font-bold text-[#24232B]">Update Execution Progress</h2>
              </div>
              <button onClick={() => setUpdatingTaskProgress(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="space-y-4 text-xs">
              <div className="p-3 bg-[#F7F8FA] rounded-lg border space-y-1">
                <h3 className="font-bold text-[#24232B]">{updatingTaskProgress.title}</h3>
                <span className="text-[11px] text-gray-500 block">
                  Category: {updatingTaskProgress.category} • Priority: {updatingTaskProgress.priority}
                </span>
              </div>

              {/* Progress Slider & Value */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-gray-700">Completion Percentage</label>
                  <span className="font-extrabold text-[#219653] text-sm">{coordProgressVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={coordProgressVal}
                  onChange={(e) => setCoordProgressVal(Number(e.target.value))}
                  className="w-full accent-[#219653] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Progress Notes */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Execution Progress Notes</label>
                <textarea
                  rows={3}
                  value={coordProgressNotes}
                  onChange={(e) => setCoordProgressNotes(e.target.value)}
                  placeholder="Summarize milestones achieved, documents collected, or current execution status..."
                  className="w-full p-2.5 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setUpdatingTaskProgress(null)}
                  className="px-3.5 py-1.5 border rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProgress}
                  className="px-4 py-1.5 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg font-semibold transition-colors shadow-xs"
                >
                  {savingProgress ? 'Saving...' : 'Save Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: COORDINATOR SUBMIT COMPLETED WORK TO DEAN */}
      {submittingDeanTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl border border-[#E6E8ED] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-[#219653]" />
                <h2 className="text-sm font-bold text-[#24232B]">Submit Completed Work to Dean</h2>
              </div>
              <button onClick={() => setSubmittingDeanTask(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDeliverableToDean} className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 space-y-1">
                <h3 className="font-bold text-[#24232B]">{submittingDeanTask.title}</h3>
                <span className="text-[11px] text-[#7051C8] block font-semibold">
                  Deliverable for Dean Dr. G. Vishnu Murthy
                </span>
              </div>

              {/* Submission Notes */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Submission Notes & Deliverable Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={coordSubmitNotes}
                  onChange={(e) => setCoordSubmitNotes(e.target.value)}
                  placeholder="Detail the completed work, compiled criteria, BoS resolutions, or relevant findings..."
                  className="w-full p-2.5 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Upload Deliverable Dossier
                </label>
                <input
                  type="file"
                  onChange={(e) => setCoordSubmitFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 border border-dashed border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSubmittingDeanTask(null)}
                  className="px-3.5 py-1.5 border rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingToDean}
                  className="px-4 py-1.5 bg-[#219653] hover:bg-[#1b7a43] text-white rounded-lg font-semibold transition-colors shadow-xs flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{submittingToDean ? 'Submitting...' : 'Confirm Submission to Dean'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
