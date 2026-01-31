'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Calendar from '@/components/Calendar';

interface Stats {
  totalPatients: number;
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  thisWeekAppointments: number;
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  todaysCount: number;
}

interface Appointment {
  id: number;
  phoneNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  status: string;
}

interface CallLog {
  id: number;
  callSid: string;
  phoneNumber: string;
  direction: string;
  status: string;
  duration?: number;
  createdAt: string;
}

interface DashboardData {
  stats: Stats;
  todaysAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  recentCalls: CallLog[];
  serviceBreakdown: Record<string, number>;
  appointmentsByDate: Record<string, Appointment[]>;
}

// Sidebar Navigation Component
function Sidebar() {
  const navItems = [
    { href: '/', icon: '📊', label: 'Dashboard', active: true },
    { href: '/appointments', icon: '📅', label: 'Appointments' },
    { href: '/patients', icon: '👥', label: 'Patients' },
    { href: '/calls', icon: '📞', label: 'Call Logs' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-teal-500/30">
          🦷
        </div>
        <div>
          <h1 className="font-bold text-lg">Smile Dental</h1>
          <p className="text-xs text-slate-400">Clinic Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${item.active 
                ? 'bg-gradient-to-r from-primary-500/20 to-teal-500/20 text-white border border-white/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <span className={`text-xl ${item.active ? 'animate-float' : 'group-hover:scale-110 transition-transform'}`}>
              {item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
            {item.active && (
              <div className="ml-auto w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      {/* AI Status Card */}
      <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-2xl p-4 border border-teal-500/30">
        <div className="flex items-center gap-3 mb-3">
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
        <p className="text-xs text-slate-400">Handling calls 24/7</p>
      </div>

      {/* Phone Number */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-slate-500 mb-1">Clinic Phone</p>
        <p className="font-mono text-sm text-teal-400">+1 (470) 491-1370</p>
      </div>
    </aside>
  );
}

// Stats Card Component
function StatsCard({ 
  icon, 
  label, 
  value, 
  trend, 
  color = 'primary' 
}: { 
  icon: string; 
  label: string; 
  value: number | string; 
  trend?: string;
  color?: 'primary' | 'teal' | 'amber' | 'rose';
}) {
  const colors = {
    primary: 'from-primary-500 to-primary-600 shadow-primary-500/25',
    teal: 'from-teal-500 to-emerald-600 shadow-teal-500/25',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/25',
    rose: 'from-rose-500 to-pink-600 shadow-rose-500/25',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft card-hover border border-gray-100/50">
      <div className="flex items-start justify-between">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/dashboard');
      const dashboardData = await res.json();
      if (!dashboardData.error) {
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    return `${h > 12 ? h - 12 : h}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      checkup: 'bg-blue-100 text-blue-700',
      cleaning: 'bg-emerald-100 text-emerald-700',
      filling: 'bg-amber-100 text-amber-700',
      extraction: 'bg-rose-100 text-rose-700',
      whitening: 'bg-purple-100 text-purple-700',
      emergency: 'bg-orange-100 text-orange-700',
      consultation: 'bg-teal-100 text-teal-700',
    };
    return colors[service] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-72 flex-1 p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-xl w-64" />
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  const stats = data?.stats;
  const todaysAppointments = data?.todaysAppointments || [];
  const upcomingAppointments = data?.upcomingAppointments || [];
  const recentCalls = data?.recentCalls || [];
  const appointmentsByDate = data?.appointmentsByDate || {};

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="ml-72 flex-1 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}! 👋
            </h1>
            <p className="text-slate-500 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="btn-secondary flex items-center gap-2">
              <span>📥</span> Export
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              A
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            icon="📅" 
            label="Today's Appointments" 
            value={stats?.todaysCount || 0}
            color="primary"
          />
          <StatsCard 
            icon="👥" 
            label="Total Patients" 
            value={stats?.totalPatients || 0}
            trend="+12%"
            color="teal"
          />
          <StatsCard 
            icon="✅" 
            label="Scheduled" 
            value={stats?.scheduledAppointments || 0}
            color="amber"
          />
          <StatsCard 
            icon="📞" 
            label="Total Calls" 
            value={stats?.totalCalls || 0}
            color="rose"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's Appointments Card */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-teal-500 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>📋</span> Today's Schedule
                </h2>
              </div>
              
              {todaysAppointments.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">😊</span>
                  </div>
                  <p className="text-slate-500">No appointments today</p>
                  <p className="text-sm text-slate-400 mt-1">Enjoy your free time!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {todaysAppointments.map((apt, i) => (
                    <div key={apt.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-teal-100 rounded-xl flex items-center justify-center font-semibold text-primary-600">
                          {formatTime(apt.appointmentTime).split(':')[0]}
                          <span className="text-xs ml-0.5">{formatTime(apt.appointmentTime).includes('PM') ? 'PM' : 'AM'}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 capitalize">{apt.serviceType}</p>
                          <p className="text-sm text-slate-500">{apt.phoneNumber}</p>
                        </div>
                        <span className={`badge ${getServiceColor(apt.serviceType)}`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Calls Card */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <span>📞</span> Recent Calls
                </h2>
                <Link href="/calls" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all →
                </Link>
              </div>
              
              {recentCalls.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No calls recorded yet
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentCalls.slice(0, 4).map((call) => (
                    <div key={call.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          call.direction === 'inbound' 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {call.direction === 'inbound' ? '📥' : '📤'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{call.phoneNumber}</p>
                          <p className="text-xs text-slate-400 capitalize">{call.direction}</p>
                        </div>
                        <span className={`badge ${
                          call.status === 'completed' ? 'badge-success' :
                          call.status === 'in-progress' ? 'badge-warning' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {call.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar 
              appointmentsByDate={appointmentsByDate}
              onDateClick={(date) => setSelectedDate(date)}
            />
          </div>
        </div>

        {/* Upcoming Appointments Table */}
        <div className="mt-8 bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <span>📆</span> Upcoming Appointments
            </h2>
            <Link href="/appointments" className="btn-secondary text-sm py-2">
              View Calendar →
            </Link>
          </div>
          
          {upcomingAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📅</span>
              </div>
              <p className="text-slate-600 font-medium">No upcoming appointments</p>
              <p className="text-sm text-slate-400 mt-1">Appointments booked via phone will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Patient</th>
                    <th>Service</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.slice(0, 8).map((apt) => (
                    <tr key={apt.id}>
                      <td>
                        <div>
                          <p className="font-medium text-slate-800">{formatDate(apt.appointmentDate)}</p>
                          <p className="text-xs text-slate-400">{formatTime(apt.appointmentTime)}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-teal-400 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {apt.phoneNumber.slice(-2)}
                          </div>
                          <span>{apt.phoneNumber}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge capitalize ${getServiceColor(apt.serviceType)}`}>
                          {apt.serviceType}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">{apt.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Date Detail Modal */}
        {selectedDate && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedDate(null)}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform transition-all" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{formatDate(selectedDate)}</h3>
                  <p className="text-sm text-slate-500">Appointments</p>
                </div>
                <button 
                  onClick={() => setSelectedDate(null)} 
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {appointmentsByDate[selectedDate]?.length > 0 ? (
                <div className="space-y-3">
                  {appointmentsByDate[selectedDate].map((apt) => (
                    <div key={apt.id} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{formatTime(apt.appointmentTime)}</span>
                        <span className={`badge capitalize ${getServiceColor(apt.serviceType)}`}>
                          {apt.serviceType}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">{apt.phoneNumber}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <p className="text-slate-500">No appointments on this date</p>
                </div>
              )}
              
              <Link href="/appointments" className="block mt-6">
                <button className="btn-primary w-full">
                  Manage Appointments
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
