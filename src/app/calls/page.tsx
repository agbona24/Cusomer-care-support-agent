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

export default function CallsPage() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchCalls();
    
    // Auto-refresh every 3 seconds to see live transcripts
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
      
      // Update selected call if viewing one
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

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">📞 Call Transcripts</h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (live)
            </label>
            {autoRefresh && (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold">Recent Calls</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : calls.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="mb-2">No calls yet.</p>
                <p className="text-sm">Call your Twilio number to see transcripts here!</p>
              </div>
            ) : (
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {calls.map((call) => (
                  <div
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedCall?.id === call.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{call.phoneNumber}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          call.direction === 'inbound'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {call.direction === 'inbound' ? '📥 In' : '📤 Out'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(call.createdAt)}</span>
                      <span className="flex items-center gap-2">
                        <span>{formatDuration(call.duration)}</span>
                        {call.transcript && (
                          <span className="text-green-600">💬</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transcript Viewer */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold">
                {selectedCall ? `Transcript - ${selectedCall.phoneNumber}` : 'Select a call'}
              </h2>
            </div>

            {selectedCall ? (
              <div className="p-6">
                {/* Call Info */}
                <div className="mb-4 pb-4 border-b">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                        selectedCall.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : selectedCall.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedCall.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2">{formatDuration(selectedCall.duration)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Direction:</span>
                      <span className="ml-2">{selectedCall.direction}</span>
                    </div>
                  </div>
                </div>

                {/* Transcript */}
                <div className="space-y-4 max-h-[450px] overflow-y-auto">
                  {selectedCall.transcript ? (
                    selectedCall.transcript.split('\n\n').map((line, i) => {
                      const isCaller = line.startsWith('👤');
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-lg ${
                            isCaller
                              ? 'bg-gray-100 mr-8'
                              : 'bg-blue-100 ml-8'
                          }`}
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {isCaller ? '👤 Caller' : '🤖 Sarah (AI)'}
                          </div>
                          <div className="text-sm">
                            {line.replace(/^(👤 Caller|🤖 Sarah): /, '')}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No transcript available yet.</p>
                      {selectedCall.status !== 'completed' && (
                        <p className="text-sm mt-2">
                          Transcript will appear as the call progresses...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>👈 Select a call to view the transcript</p>
                <p className="text-sm mt-2">
                  You'll see what the caller said and how Sarah responded
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
