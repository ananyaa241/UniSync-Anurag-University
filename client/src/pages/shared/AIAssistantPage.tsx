import React, { useState } from 'react';
import { apiFetch } from '../../services/api';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  CheckCircle2,
  HeartHandshake,
  Clock,
  Briefcase,
  ShieldCheck,
  Send
} from 'lucide-react';

interface ToneMeta {
  name: string;
  description: string;
  badges: string[];
  color: string;
  border: string;
  bg: string;
  accent: string;
}

const TONE_CRITERIA_UI: Record<string, ToneMeta> = {
  friendly: {
    name: 'Polite & Encouraging',
    description: 'Warm appreciation, supportive tone, courteous requests, and proactive assistance offers.',
    badges: [
      'Warm appreciation for faculty & student efforts',
      'Polite phrasing ("Kindly", "We would deeply appreciate")',
      'Supportive framing with proactive offer of help'
    ],
    color: 'text-emerald-800',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/70',
    accent: '#059669'
  },
  urgent: {
    name: 'Urgent & Deadline-Driven',
    description: 'High-priority, time-sensitive directive with explicit non-negotiable submission deadlines.',
    badges: [
      'Prominent [URGENT: TIME-SENSITIVE] marker',
      'Non-negotiable deadlines (Date & Time IST)',
      'Crisp numbered immediate action items'
    ],
    color: 'text-amber-800',
    border: 'border-amber-200',
    bg: 'bg-amber-50/70',
    accent: '#D97706'
  },
  professional: {
    name: 'Professional & Direct',
    description: 'Concise executive summary, structured bullet points, and objective deliverables.',
    badges: [
      'Objective, concise executive overview',
      'Structured bullet points for deliverables',
      'Clear milestones & single point-of-contact'
    ],
    color: 'text-blue-800',
    border: 'border-blue-200',
    bg: 'bg-blue-50/70',
    accent: '#2563EB'
  },
  formal: {
    name: 'Formal & Institutional',
    description: 'Official Anurag University CSE protocol, administrative circular structure, and institutional authority.',
    badges: [
      'Anurag University CSE governance protocol',
      'Formal academic salutations & circular styling',
      'References official regulatory & quality standards'
    ],
    color: 'text-purple-800',
    border: 'border-purple-200',
    bg: 'bg-purple-50/70',
    accent: '#7051C8'
  }
};

interface ReadyPrompt {
  title: string;
  badge: string;
  type: string;
  tone: string;
  prompt: string;
}

const READY_TO_USE_PROMPTS: ReadyPrompt[] = [
  {
    title: 'NBA Criteria 3 Dossier Preparation',
    badge: 'Polite & Encouraging',
    type: 'task',
    tone: 'friendly',
    prompt:
      'Kindly guide all CSE module faculty to compile their NBA Criteria 3 course dossiers, including Course Outcome (CO) attainment calculations, sample student answer scripts, and continuous internal evaluation rubrics.'
  },
  {
    title: 'Student Attendance Defaulters Mentoring',
    badge: 'Polite & Encouraging',
    type: 'email',
    tone: 'friendly',
    prompt:
      'Politely request all faculty mentors to review students having attendance shortage below 75%, reach out to parents with supportive counseling, and update their student mentoring logbooks on UniSync.'
  },
  {
    title: 'Mid-term Lab Logbooks Verification',
    badge: 'Urgent & Deadline-Driven',
    type: 'email',
    tone: 'urgent',
    prompt:
      'URGENT: All laboratory faculty coordinators must complete verification of student programming lab logbooks, continuous assessment rubrics, and day-to-day evaluation marks by 5:00 PM today.'
  },
  {
    title: 'Immediate Internal Marks Upload',
    badge: 'Urgent & Deadline-Driven',
    type: 'task',
    tone: 'urgent',
    prompt:
      'URGENT: Upload verified Continuous Internal Assessment (CIE) marks and attendance percentages to the Dean academic examination portal ahead of the university lock deadline.'
  },
  {
    title: 'Board of Studies (BoS) Meeting Notice',
    badge: 'Formal & Institutional',
    type: 'meeting',
    tone: 'formal',
    prompt:
      'Formal circular and meeting notice for the CSE Board of Studies (BoS) session to review emerging AI/ML curriculum electives, industry feedback, and laboratory infrastructure improvements.'
  },
  {
    title: 'Question Paper Moderation Directive',
    badge: 'Professional & Direct',
    type: 'task',
    tone: 'professional',
    prompt:
      'Direct all subject leads to submit two sets of moderated Mid-term question papers along with Blooms taxonomy mapping and comprehensive scheme of evaluation to the examination cell.'
  }
];

export const AIAssistantPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('friendly');
  const [type, setType] = useState('email');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState('');
  const [appliedToneLabel, setAppliedToneLabel] = useState('');
  const [appliedCriteria, setAppliedCriteria] = useState('');

  const currentToneMeta = TONE_CRITERIA_UI[tone] || TONE_CRITERIA_UI.friendly;

  const handleApplyPreset = (p: ReadyPrompt) => {
    setPrompt(p.prompt);
    setType(p.type);
    setTone(p.tone);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await apiFetch('/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, tone, type })
      });

      if (res.success && res.data) {
        setResult(res.data.draft);
        setProvider(res.data.provider || 'Groq AI');
        setAppliedToneLabel(res.data.toneLabel || currentToneMeta.name);
        setAppliedCriteria(res.data.criteriaSummary || currentToneMeta.description);
      }
    } catch (err: any) {
      alert(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm">
        <h1 className="text-lg font-bold text-[#24232B] flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#7051C8]" />
          <span>AI Academic Assistant</span>
        </h1>
        <p className="text-xs text-[#737784] mt-0.5">
          Generate tone-aligned, ready-to-use institutional communications, emails, notices, and task specifications for Anurag University CSE Department.
        </p>
      </div>

      {/* Ready-to-Use Prompt Starters */}
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4 text-[#7051C8]" />
            <span className="text-xs font-bold text-[#24232B]">Ready-to-Use Prompt Starters</span>
          </div>
          <span className="text-[11px] text-[#737784]">Click any prompt to load with configured tone criteria</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {READY_TO_USE_PROMPTS.map((item, idx) => {
            const itemMeta = TONE_CRITERIA_UI[item.tone] || TONE_CRITERIA_UI.friendly;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(item)}
                className="text-left p-3 rounded-lg border border-[#E6E8ED] hover:border-[#7051C8] hover:bg-purple-50/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#737784]">
                      {item.type}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${itemMeta.bg} ${itemMeta.color} border ${itemMeta.border}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#24232B] group-hover:text-[#7051C8] line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#737784] mt-1 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center text-[10px] text-[#7051C8] font-semibold">
                  <span>Use This Prompt</span>
                  <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Drafting Form */}
      <div className="bg-white p-6 rounded-xl border border-[#E6E8ED] shadow-sm space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#24232B] mb-1">
              What would you like to draft or communicate? <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Remind all CSE faculty to upload their internal marks reports and laboratory logbooks by this Friday."
              className="w-full text-xs p-3 border border-[#E6E8ED] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#24232B] mb-1">
                Draft Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg bg-white"
              >
                <option value="email">Formal Faculty / Student Email</option>
                <option value="task">Academic Task & Deliverables Breakdown</option>
                <option value="announcement">Department Notice & Circular</option>
                <option value="meeting">Meeting Agenda & Official Invitation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24232B] mb-1">
                Communication Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg bg-white"
              >
                <option value="friendly">Polite & Encouraging</option>
                <option value="urgent">Urgent & Deadline-Driven</option>
                <option value="professional">Professional & Direct</option>
                <option value="formal">Formal & Institutional</option>
              </select>
            </div>
          </div>

          {/* Active Tone Criteria Breakdown Card */}
          <div className={`p-3.5 rounded-lg border ${currentToneMeta.border} ${currentToneMeta.bg} space-y-2`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center space-x-1.5 ${currentToneMeta.color}`}>
                {tone === 'friendly' && <HeartHandshake className="w-4 h-4" />}
                {tone === 'urgent' && <Clock className="w-4 h-4" />}
                {tone === 'professional' && <Briefcase className="w-4 h-4" />}
                {tone === 'formal' && <ShieldCheck className="w-4 h-4" />}
                <span>Active Tone Criteria: {currentToneMeta.name}</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Applied to AI Generation</span>
            </div>
            <p className="text-[11px] text-gray-700 leading-relaxed">
              {currentToneMeta.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {currentToneMeta.badges.map((b, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-white/90 px-2 py-0.5 rounded border border-gray-200/80 text-gray-800 flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
                  <span>{b}</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#7051C8] hover:bg-[#50305F] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Applying Tone Criteria & Generating Draft...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Ready-to-Use Draft</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Result Container */}
        {result && (
          <div className="mt-6 pt-5 border-t border-[#E6E8ED] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#24232B]">Ready-to-Use Communication:</span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${currentToneMeta.bg} ${currentToneMeta.color} border ${currentToneMeta.border}`}
                >
                  Tone: {appliedToneLabel || currentToneMeta.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-[#737784] bg-gray-100 px-2 py-0.5 rounded">
                  {provider}
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-[#7051C8] text-white hover:bg-[#50305F] rounded text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Ready-to-Use Draft'}</span>
                </button>
              </div>
            </div>

            {/* Criteria Verified Banner */}
            {appliedCriteria && (
              <div className="text-[11px] bg-purple-50/60 p-2.5 rounded-lg border border-purple-200 text-[#50305F] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>
                  <strong>Criteria Applied:</strong> {appliedCriteria}
                </span>
              </div>
            )}

            <div className="bg-[#F7F8FA] p-4 rounded-lg border border-[#E6E8ED] text-xs text-[#24232B] whitespace-pre-line leading-relaxed font-sans">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
