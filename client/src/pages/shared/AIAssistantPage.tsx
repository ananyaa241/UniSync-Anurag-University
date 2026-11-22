import React, { useState } from 'react';
import { apiFetch } from '../../services/api';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('formal');
  const [type, setType] = useState('email');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState('');

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
        setProvider(res.data.provider);
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
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm">
        <h1 className="text-lg font-bold text-[#24232B] flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#7051C8]" />
          <span>AI Academic Assistant</span>
        </h1>
        <p className="text-xs text-[#737784] mt-0.5">
          Powered by Groq Llama-3 & Built-in Academic Models | Generate formal notices, emails, circulars, and task specifications
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#E6E8ED] shadow-sm space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#24232B] mb-1">
              What would you like to draft or communicate?
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
                className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg"
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
                className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg"
              >
                <option value="formal">Formal & Institutional</option>
                <option value="professional">Professional & Direct</option>
                <option value="urgent">Urgent & Deadline-Driven</option>
                <option value="friendly">Polite & Encouraging</option>
              </select>
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
                  <span>Generating AI Draft...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Draft</span>
                </>
              )}
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-6 pt-5 border-t border-[#E6E8ED] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#24232B]">Generated Academic Draft:</span>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-[#737784] bg-gray-100 px-2 py-0.5 rounded">
                  {provider}
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-purple-50 text-[#7051C8] hover:bg-purple-100 rounded text-xs font-medium flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="bg-[#F7F8FA] p-4 rounded-lg border border-[#E6E8ED] text-xs text-[#24232B] whitespace-pre-line leading-relaxed font-mono">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
