import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ClipboardList,
  Users,
  CheckSquare,
  FileCheck,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  FileText
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#24232B] flex flex-col font-sans selection:bg-[#7051C8] selection:text-white">
      {/* A. Minimal Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E6E8ED]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            <img
              src="/unisync-logo.png"
              alt="UniSync CSE"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-sm sm:text-base text-[#24232B] tracking-tight truncate">
                  UniSync CSE
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-purple-50 text-[#7051C8] rounded border border-purple-200 shrink-0">
                  Department Portal
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium truncate hidden sm:block">
                Anurag University &bull; Dept. of Computer Science & Engineering
              </p>
              <p className="text-[10px] text-gray-500 font-medium truncate sm:hidden">
                Anurag University &bull; CSE
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            <Link
              to="/login"
              className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-[#7051C8] hover:bg-purple-50/50 rounded-lg transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1 sm:space-x-1.5 shrink-0 whitespace-nowrap"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>
        </div>
      </header>

      {/* B. Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white border-b border-[#E6E8ED]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] sm:text-xs font-medium text-[#7051C8] max-w-full">
            <span className="w-2 h-2 rounded-full bg-[#7051C8] shrink-0"></span>
            <span className="hidden sm:inline">Official Academic Management System &bull; CSE Department</span>
            <span className="sm:hidden">Academic Management &bull; CSE Department</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#24232B] tracking-tight leading-tight">
            Simplifying Academic Coordination.{' '}
            <span className="text-[#7051C8]">Connecting Every Role.</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            UniSync CSE brings the Dean, Academic Coordinators, and Faculty together through centralized academic task management, document workflows, progress monitoring, and departmental communication.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#7051C8] hover:bg-[#50305F] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-[#E6E8ED] text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors text-center"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* C. Three-Role Overview */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 bg-[#F8F9FA] border-b border-[#E6E8ED]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7051C8]">Department Hierarchy</span>
            <h2 className="text-2xl font-bold text-[#24232B]">Structured for Collaborative Accountability</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Clear responsibilities mapped across three unified academic roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Dean */}
            <div className="bg-white p-6 rounded-xl border border-[#E6E8ED] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#7051C8]/50 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#7051C8] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7051C8] border border-purple-200">
                    Oversight
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#24232B]">Dean</h3>
                  <p className="text-xs text-[#7051C8] font-semibold mt-0.5">Departmental Oversight</p>
                </div>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#7051C8] font-bold">&bull;</span>
                    <span>Department-wide academic oversight</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#7051C8] font-bold">&bull;</span>
                    <span>Faculty performance and task monitoring</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#7051C8] font-bold">&bull;</span>
                    <span>Academic supervision and departmental coordination</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 2. Academic Coordinator */}
            <div className="bg-white p-6 rounded-xl border border-[#E6E8ED] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#7051C8]/50 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-[#2563EB] border border-blue-200">
                    Coordination
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#24232B]">Academic Coordinator</h3>
                  <p className="text-xs text-[#2563EB] font-semibold mt-0.5">Academic Task Coordination</p>
                </div>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#2563EB] font-bold">&bull;</span>
                    <span>Academic task creation and assignment</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#2563EB] font-bold">&bull;</span>
                    <span>Faculty progress and deadline monitoring</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#2563EB] font-bold">&bull;</span>
                    <span>Document review, feedback, and revision management</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. Faculty Member */}
            <div className="bg-white p-6 rounded-xl border border-[#E6E8ED] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#7051C8]/50 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-green-50 text-[#16A34A] flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-green-100 text-[#16A34A] border border-green-200">
                    Execution
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#24232B]">Faculty Member</h3>
                  <p className="text-xs text-[#16A34A] font-semibold mt-0.5">Task Execution and Submissions</p>
                </div>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#16A34A] font-bold">&bull;</span>
                    <span>Viewing and managing assigned tasks</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#16A34A] font-bold">&bull;</span>
                    <span>Uploading academic deliverables</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#16A34A] font-bold">&bull;</span>
                    <span>Tracking submissions and feedback</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#16A34A] font-bold">&bull;</span>
                    <span>Accessing authorized communication and departmental updates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D. Core Capabilities */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 bg-white border-b border-[#E6E8ED]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7051C8]">Key Workflows</span>
            <h2 className="text-2xl font-bold text-[#24232B]">Core Capabilities</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Essential departmental operations consolidated into one accessible workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Academic Task Assignment and Tracking */}
            <div className="bg-[#F8F9FA] p-5 rounded-xl border border-[#E6E8ED] space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-[#7051C8] flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#24232B]">Academic Task Assignment & Tracking</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Define deliverables, instructions, and official deadlines with structured assignment workflows.
              </p>
            </div>

            {/* 2. Document Submission and Review */}
            <div className="bg-[#F8F9FA] p-5 rounded-xl border border-[#E6E8ED] space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-[#7051C8] flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#24232B]">Document Submission & Review</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Direct file uploads, multi-version dossier tracking, coordinator feedback, and revision cycles.
              </p>
            </div>

            {/* 3. Faculty Progress Monitoring */}
            <div className="bg-[#F8F9FA] p-5 rounded-xl border border-[#E6E8ED] space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-[#7051C8] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#24232B]">Faculty Progress Monitoring</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Real-time completion percentage tracking with horizontal progress bars and timely reminder alerts.
              </p>
            </div>

            {/* 4. Departmental Communication */}
            <div className="bg-[#F8F9FA] p-5 rounded-xl border border-[#E6E8ED] space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-[#7051C8] flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#24232B]">Departmental Communication</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Role-authorized messaging, official circular announcements, and council meeting scheduling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1921] text-gray-300 text-xs mt-auto">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-6">
            <div className="flex items-center space-x-3">
              <img
                src="/unisync-logo.png"
                alt="UniSync Logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <span className="font-bold text-white text-sm">UniSync CSE</span>
                <p className="text-[11px] text-gray-400">
                  Department of Computer Science & Engineering &bull; Anurag University
                </p>
              </div>
            </div>

            <div className="text-center md:text-right text-[11px] text-gray-400 space-y-0.5">
              <p>Developed by: <strong className="text-white">Sai Ananya Gajjala</strong> (HT No: <span className="font-mono text-gray-300">24EG105Q08</span>)</p>
              <p>Contact: <a href="mailto:24eg105q08@anurag.edu.in" className="text-gray-300 hover:text-white underline">24eg105q08@anurag.edu.in</a></p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-500 text-[11px]">
            <p>&copy; {new Date().getFullYear()} Department of Computer Science & Engineering, Anurag University.</p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-gray-400 hover:text-white underline"
              >
                Institutional Terms & Compliance
              </button>
              <Link to="/login" className="text-gray-400 hover:text-white">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-[#E6E8ED] max-h-[85vh] flex flex-col text-[#24232B]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E8ED]">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#7051C8]" />
                <h3 className="text-base font-bold">Terms of Service & Department Policies</h3>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 text-xs text-[#737784] leading-relaxed">
              <h4 className="font-bold text-[#24232B]">1. Scope of Application</h4>
              <p>
                UniSync is developed specifically for academic collaboration, document verification, and task coordination within the Computer Science and Engineering (CSE) Department at Anurag University. It is restricted to authorized departmental accounts.
              </p>

              <h4 className="font-bold text-[#24232B]">2. Account Verification & Approval</h4>
              <p>
                Staff registrations require authorization by the Dean. Pending accounts remain inactive until approved by departmental administration.
              </p>

              <h4 className="font-bold text-[#24232B]">3. Academic Deliverables & Confidentiality</h4>
              <p>
                All course files, laboratory rubrics, marks dossiers, and academic documentation submitted through this workspace are official departmental records governed by Anurag University academic standards.
              </p>

              <h4 className="font-bold text-[#24232B]">4. Technical Support & Attribution</h4>
              <p>
                Developed by: <strong>Sai Ananya Gajjala</strong> (HT No: <strong>24EG105Q08</strong>). For software inquiries or support, contact <strong>24eg105q08@anurag.edu.in</strong>.
              </p>
            </div>

            <div className="pt-3 border-t border-[#E6E8ED] flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-[#7051C8] hover:bg-[#50305F] text-white rounded text-xs font-semibold"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
