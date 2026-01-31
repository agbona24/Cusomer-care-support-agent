'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Calendar from '@/components/Calendar';

interface Appointment {
  id: number;
  phoneNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  status: string;
  notes?: string;
}

type ViewMode = 'list' | 'calendar';

// Sidebar Component (shared)
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
              ${item.href === `/${activePage}` || (activePage === 'appointments' && item.href === '/appointments')
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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [appointmentsByDate, setAppointmentsByDate] = useState<Record<string, Appointment[]>>({});

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      const allAppointments = data.appointments || [];
      setAppointments(allAppointments);
      
      const grouped = allAppointments.reduce((acc: Record<string, Appointment[]>, apt: Appointment) => {
        if (!acc[apt.appointmentDate]) {
          acc[apt.appointmentDate] = [];
        }
        acc[apt.appointmentDate].push(apt);
        return acc;
      }, {});
      setAppointmentsByDate(grouped);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkAvailability(date: string) {
    if (!date) return;
    setSelectedDate(date);
    
    try {
      const res = await fetch(`/api/appointments?date=${date}`);
      const data = await res.json();
      setAvailableSlots(data.availableSlots || []);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  }

  async function cancelAppointment(id: number) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
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

  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus === 'all') return true;
    return apt.status === filterStatus;
  });

  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
  const todayDate = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter(a => a.appointmentDate === todayDate && a.status === 'scheduled').length;

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar activePage="appointments" />
        <main className="ml-72 flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-xl w-48" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
            </div>
            <div className="h-96 bg-gray-200 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="appointments" />
      
      <main className="ml-72 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">📅 Appointments</h1>
            <p className="text-slate-500 mt-1">Manage your clinic schedule</p>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'calendar' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              📅 Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'list' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              📋 List
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 card-hover">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{todayCount}</p>
                <p className="text-sm text-slate-500">Today</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 card-hover">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{scheduledCount}</p>
                <p className="text-sm text-slate-500">Scheduled</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 card-hover">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/25">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{cancelledCount}</p>
                <p className="text-sm text-slate-500">Cancelled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Checker */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">🔍</span>
            Check Availability
          </h2>
          <div className="flex gap-6 items-start flex-wrap">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Select Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="input-modern w-48"
                onChange={(e) => checkAvailability(e.target.value)}
              />
            </div>
            {selectedDate && (
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Available slots for {formatDate(selectedDate)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <span
                        key={slot}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-200"
                      >
                        {formatTime(slot)}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">
                      No available slots (clinic may be closed)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <Calendar
            appointmentsByDate={appointmentsByDate}
            onDateClick={(date) => checkAvailability(date)}
          />
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">All Appointments</h2>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-modern w-40 py-2"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📅</span>
                </div>
                <p className="text-slate-600 font-medium">No appointments found</p>
                <p className="text-sm text-slate-400 mt-1">Appointments booked via phone will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date & Time</th>
                      <th>Phone</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((apt) => (
                      <tr key={apt.id}>
                        <td>
                          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">#{apt.id}</span>
                        </td>
                        <td>
                          <div>
                            <p className="font-medium text-slate-800">{formatDate(apt.appointmentDate)}</p>
                            <p className="text-xs text-slate-400">{formatTime(apt.appointmentTime)}</p>
                          </div>
                        </td>
                        <td>{apt.phoneNumber}</td>
                        <td>
                          <span className={`badge capitalize ${getServiceColor(apt.serviceType)}`}>
                            {apt.serviceType}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            apt.status === 'scheduled' ? 'badge-success' :
                            apt.status === 'cancelled' ? 'badge-danger' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td>
                          {apt.status === 'scheduled' && (
                            <button
                              onClick={() => cancelAppointment(apt.id)}
                              className="text-rose-600 hover:text-rose-700 font-medium text-sm hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
