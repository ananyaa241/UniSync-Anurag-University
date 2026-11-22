import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Users, Search, Mail, Phone, BookOpen, Shield } from 'lucide-react';

export const FacultyDirectoryPage: React.FC = () => {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      const res = await apiFetch('/users/faculty');
      if (res.success && res.data) {
        setFaculty(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const filteredFaculty = faculty.filter(
    (f) =>
      f.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[#24232B] flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#7051C8]" />
            <span>CSE Faculty & Academic Directory</span>
          </h1>
          <p className="text-xs text-[#737784]">
            Department of Computer Science & Engineering | Anurag University Faculty Roster
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name, emp ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaculty.map((f) => (
          <div
            key={f._id}
            className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col justify-between hover:border-[#7051C8]/40 transition-colors"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#382044] to-[#7051C8] text-white flex items-center justify-center font-bold text-sm">
                  {f.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#24232B]">{f.fullName}</h3>
                  <span className="text-[11px] text-[#7051C8] font-semibold">
                    {f.role === 'HOD' ? 'Dean' : f.role === 'COORDINATOR' ? 'Academic Coordinator' : 'Faculty'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#737784] border-t border-gray-100 pt-3">
                <div>
                  <span className="text-gray-400">Designation:</span>{' '}
                  <span className="font-medium text-[#24232B]">{f.designation}</span>
                </div>
                <div>
                  <span className="text-gray-400">Employee ID:</span>{' '}
                  <span className="font-mono text-gray-700">{f.employeeId}</span>
                </div>
                <div className="flex items-center space-x-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{f.email}</span>
                </div>
                {f.phone && (
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{f.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span className="text-gray-400">Department</span>
              <span className="font-semibold text-[#24232B]">CSE, Anurag University</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
