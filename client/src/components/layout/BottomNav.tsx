import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, CheckSquare, Calendar, MessageSquare, Menu } from 'lucide-react';

interface BottomNavProps {
  onOpenMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMenu }) => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6E8ED] h-14 flex items-center justify-around z-40 px-2 shadow-lg">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-[#7051C8]' : 'text-[#737784]'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/tasks"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-[#7051C8]' : 'text-[#737784]'
          }`
        }
      >
        <CheckSquare className="w-5 h-5 mb-0.5" />
        <span>Tasks</span>
      </NavLink>

      <NavLink
        to="/calendar"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-[#7051C8]' : 'text-[#737784]'
          }`
        }
      >
        <Calendar className="w-5 h-5 mb-0.5" />
        <span>Calendar</span>
      </NavLink>

      <NavLink
        to="/messages"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-[#7051C8]' : 'text-[#737784]'
          }`
        }
      >
        <MessageSquare className="w-5 h-5 mb-0.5" />
        <span>Chats</span>
      </NavLink>

      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium text-[#737784] hover:text-[#7051C8]"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span>More</span>
      </button>
    </nav>
  );
};
