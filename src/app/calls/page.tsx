'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CallLog {
  id: number;
  callSid: string;
  phoneNumber: string;
  direction: string;
  status: string;
  duration?: number;
  transcript?: string;
  createdAt: string;
}

// Sidebar Component
function Sidebar({ activePage }: { activePage: string }) {
  const navItems = [
    { href: '/', icon: '📊', label: 'Dashboard' },
    { href: '/appointments', icon: '📅', label: 'Appointments' },
    { href: '/patients', icon: '👥', label: 'Patients' },
    { href: '/calls', icon: '📞', label: 'Call Logs' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex flex-col z-50">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-teal-500/30">
          🦷
        </div>
        <div>
          <h1 className="font-bold text-lg">Smile Dental</h1>
          <p className="text-xs text-slate-400">Clinic Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${item.href === `/${activePage}`
                ? 'bg-gradient-to-r from-primary-500/20 to-teal-500/20 text-white border border-white/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-2xl p-4 border border-teal-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <p className="font-semibold text-sm">Sarah AI</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchCalls();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchCalls, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  async function fetchCalls() {
    try {
      const res = await fetch('/api/calls');
      const data = await res.json();
      setCalls(data.calls || []);
      
      if (selectedCall) {
        const updated = data.calls?.find((c: CallLog) => c.id === selectedCall.id);
        if (updated) setSelectedCall(updated);
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const inboundCount = calls.filter(c => c.direction === 'inbound').length;
  const outboundCount = calls.filter(c => c.direction === 'outbound').length;
  const completedCount = calls.filter(c => c.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar activePage="calls" />
        <main className="ml-72 flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-xl w-48" />
            <div className="grid grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-2xl" />
              <div className="h-96 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="calls" />
      
      <main className="ml-72 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">📞 Call Logs</h1>
            <p className="text-slate-500 mt-1">View conversation transcripts</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-soft border border-gray-100/50 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-slate-600">Auto-refresh</span>
              {autoRefresh && (
                <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 card-hover">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <span className="text-2xl">📥</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{inboundCount}</p>
                <p className="text-sm text-slate-500">Inbound</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 card-hover">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-2xl">📤</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{outboundCount}</p>
                <p className="text-sm text-slate-500">Outbound</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 card-hover">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{completedCount}</p>
                <p className="text-sm text-slate-500">Completed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call List */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
              <h2 className="font-semibold text-slate-800">Recent Calls</h2>
            </div>

            {calls.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📞</span>
                </div>
                <p className="text-slate-600 font-medium mb-2">No calls yet</p>
                <p className="text-sm text-slate-400">Call your Twilio number to see transcripts here!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[550px] overflow-y-auto">
                {calls.map((call) => (
                  <div
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      selectedCall?.id === call.id 
                        ? 'bg-gradient-to-r from-primary-50 to-teal-50 border-l-4 border-primary-500' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          call.direction === 'inbound' 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {call.direction === 'inbound' ? '📥' : '📤'}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">{call.phoneNumber}</span>
                          <p className="text-xs text-slate-400">{formatDate(call.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {call.transcript && (
                          <span className="text-emerald-500">💬</span>
                        )}
                        <span className={`badge ${
                          call.status === 'completed' ? 'badge-success' :
                          call.status === 'in-progress' ? 'badge-warning' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {call.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 pl-13">
                      <span>Duration: {formatDuration(call.duration)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transcript Viewer */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
              <h2 className="font-semibold text-slate-800">
                {selectedCall ? `Transcript` : 'Select a call'}
              </h2>
              {selectedCall && (
                <p className="text-sm text-slate-400">{selectedCall.phoneNumber}</p>
              )}
            </div>

            {selectedCall ? (
              <div className="p-6">
                {/* Call Info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs mb-1">Status</span>
                      <span className={`badge ${
                        selectedCall.status === 'completed' ? 'badge-success' :
                        selectedCall.status === 'in-progress' ? 'badge-warning' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {selectedCall.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs mb-1">Duration</span>
                      <span className="font-semibold text-slate-700">{formatDuration(selectedCall.duration)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs mb-1">Direction</span>
                      <span className="font-semibold text-slate-700 capitalize">{selectedCall.direction}</span>
                    </div>
                  </div>
                </div>

                {/* Transcript */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {selectedCall.transcript ? (
                    selectedCall.transcript.split('\n\n').map((line, i) => {
                      const isCaller = line.startsWith('👤');
                      return (
                        <div
                          key={i}
                          className={`flex ${isCaller ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[85%] p-4 rounded-2xl ${
                            isCaller
                              ? 'bg-slate-100 rounded-tl-sm'
                              : 'bg-gradient-to-r from-primary-500 to-teal-500 text-white rounded-tr-sm'
                          }`}>
                            <div className={`text-xs mb-1 ${isCaller ? 'text-slate-500' : 'text-white/80'}`}>
                              {isCaller ? '👤 Caller' : '🤖 Sarah (AI)'}
                            </div>
                            <div className="text-sm">
                              {line.replace(/^(👤 Caller|🤖 Sarah): /, '')}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💬</span>
                      </div>
                      <p className="text-slate-500">No transcript available yet.</p>
                      {selectedCall.status !== 'completed' && (
                        <p className="text-sm text-slate-400 mt-2">
                          Transcript will appear as the call progresses...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">👈</span>
                </div>
                <p className="text-slate-600 font-medium mb-2">Select a call to view the transcript</p>
                <p className="text-sm text-slate-400">
                  You'll see what the caller said and how Sarah responded
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
