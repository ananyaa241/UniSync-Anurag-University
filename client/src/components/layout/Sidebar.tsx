import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  MessageSquare,
  Video,
  Bell,
  Sparkles,
  HelpCircle,
  Settings,
  ShieldCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  // Streamlined navigation focusing on core academic responsibilities
  const navLinks = [
    // Common Dashboard
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['HOD', 'COORDINATOR', 'FACULTY'],
    },
    // Faculty Directory
    {
      to: '/faculty',
      label: role === 'HOD' || role === 'COORDINATOR' ? 'Faculty Directory' : 'CSE Colleagues',
      icon: Users,
      roles: ['HOD', 'COORDINATOR', 'FACULTY'],
    },
    // Department Tasks (Primary action area for faculty submission & coordinator review)
    {
      to: '/tasks',
      label: role === 'FACULTY' ? 'My Assigned Tasks' : 'Department Progress',
      icon: CheckSquare,
      roles: ['HOD', 'COORDINATOR', 'FACULTY'],
    },
    // Academic Calendar for Coordinator and Faculty (hidden for Dean per requirement: Academic Deadlines & Meeting Deadlines removed for Dean)
    {
      to: '/calendar',
      label: 'Academic Deadlines',
      icon: Calendar,
      roles: ['COORDINATOR', 'FACULTY'],
    },
    // Confidential Realtime Chats
    {
      to: '/messages',
      label: 'Private Chats & Lounge',
      icon: MessageSquare,
      roles: ['HOD', 'COORDINATOR', 'FACULTY'],
    },
    // Meetings
    {
      to: '/meetings',
      label: 'Meetings & Meet',
      icon: Video,
      roles: ['HOD', 'COORDINATOR', 'FACULTY'],
    },
    // Department Announcements
    {
      to: '/announcements',
      label: 'Announcements',
      icon: Bell,
      roles: ['HOD', 'COORDINATOR', 'FACULTY'],
    },
    // Faculty Requests / Feedback (Requisitions, deadline extensions)
    {
      to: '/requests',
      label: role === 'HOD' ? 'Department Approvals' : role === 'COORDINATOR' ? 'Faculty Requests' : 'Requests & Feedback',
      icon: HelpCircle,
      roles: ['HOD', 'COORDINATOR', 'FACULTY'],
    },
    // AI Assistant (Helps faculty & coordinators draft circulars, task details, & reports)
    {
      to: '/ai-assistant',
      label: 'AI Draft Assistant',
      icon: Sparkles,
      roles: ['HOD', 'COORDINATOR', 'FACULTY'],
    },
    // Dean Role Registration Approvals
    {
      to: '/registration-approvals',
      label: 'Staff Approvals',
      icon: ShieldCheck,
      roles: ['HOD'],
    },
    // Settings & Sessions
    {
      to: '/settings',
      label: 'Account & Devices',
      icon: Settings,
      roles: ['HOD', 'COORDINATOR', 'FACULTY'],
    },
  ];

  const filteredLinks = navLinks.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-full md:w-64 bg-[#382044] text-white flex flex-col h-full select-none border-r border-[#50305F]/50">
      {/* Workspace Brand Header */}
      <div className="p-4 border-b border-[#50305F] flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <NavLink
            to="/"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity min-w-0 flex-1"
            title="Go to UniSync Landing Page"
          >
            <img
              src="/unisync-logo.png"
              alt="UniSync Anurag University CSE"
              className="w-9 h-9 object-contain shadow-sm shrink-0 cursor-pointer"
            />
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-sm leading-tight text-white tracking-wide truncate">UniSync CSE</h1>
              <p className="text-xs text-gray-300 font-medium truncate">Anurag University</p>
            </div>
          </NavLink>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#50305F] transition-colors shrink-0"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="pt-0.5">
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-[#7051C8]/80 text-white border border-[#7051C8] tracking-wide shadow-xs">
            {role === 'HOD' ? 'Dean, CSE' : role === 'COORDINATOR' ? 'Academic Coordinator' : 'Faculty Member'}
          </span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Academic Workspace
        </div>
        {filteredLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#7051C8] text-white shadow-sm'
                    : 'text-gray-200 hover:bg-[#50305F] hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-gray-300" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-3 border-t border-[#50305F] bg-[#301a3b]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#7051C8] flex items-center justify-center font-bold text-xs text-white uppercase shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
            <p className="text-[11px] text-gray-300 truncate">
              {role === 'HOD' ? 'Dean' : user.designation || 'Faculty'} • {user.department || 'CSE'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
