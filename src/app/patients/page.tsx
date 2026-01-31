'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Patient {
  id: number;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt: string;
  appointmentStats: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
  };
  lastAppointment?: {
    appointmentDate: string;
    appointmentTime: string;
    serviceType: string;
    status: string;
  };
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

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'appointments'>('date');

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    return `${h > 12 ? h - 12 : h}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const getPatientName = (patient: Patient) => {
    if (patient.firstName || patient.lastName) {
      return `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
    }
    return 'Unknown';
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

  const filteredPatients = patients
    .filter(patient => {
      const name = getPatientName(patient).toLowerCase();
      const phone = patient.phoneNumber.toLowerCase();
      const search = searchTerm.toLowerCase();
      return name.includes(search) || phone.includes(search);
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return getPatientName(a).localeCompare(getPatientName(b));
      } else if (sortBy === 'appointments') {
        return b.appointmentStats.total - a.appointmentStats.total;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar activePage="patients" />
        <main className="ml-72 flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-xl w-48" />
            <div className="h-14 bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="patients" />
      
      <main className="ml-72 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">👥 Patients CRM</h1>
            <p className="text-slate-500 mt-1">Manage your patient records</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-primary-500 to-teal-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-primary-500/25">
              <p className="text-3xl font-bold">{patients.length}</p>
              <p className="text-xs text-white/80">Total Patients</p>
            </div>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-4 mb-8 flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-64 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Sort by:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[
                { value: 'date', label: 'Recent' },
                { value: 'name', label: 'Name' },
                { value: 'appointments', label: 'Most Active' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as 'name' | 'date' | 'appointments')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === option.value
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">👥</span>
            </div>
            <p className="text-xl font-semibold text-slate-700 mb-2">
              {searchTerm ? 'No patients match your search' : 'No patients yet'}
            </p>
            <p className="text-slate-500">
              {searchTerm ? 'Try a different search term' : 'When people call and book, they will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPatients.map((patient, index) => (
              <div 
                key={patient.id} 
                className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 card-hover"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  {/* Patient Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/25">
                      {(patient.firstName?.[0] || patient.phoneNumber[1] || '?').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {getPatientName(patient)}
                      </h3>
                      <p className="text-slate-600 flex items-center gap-2">
                        <span className="text-sm">📱</span>
                        {patient.phoneNumber}
                      </p>
                      {patient.email && (
                        <p className="text-sm text-slate-400 flex items-center gap-2">
                          <span>✉️</span>
                          {patient.email}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <span>📅</span>
                        Added {formatDate(patient.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4">
                    {[
                      { value: patient.appointmentStats.total, label: 'Total', color: 'text-slate-800' },
                      { value: patient.appointmentStats.scheduled, label: 'Scheduled', color: 'text-emerald-600' },
                      { value: patient.appointmentStats.completed, label: 'Completed', color: 'text-blue-600' },
                      { value: patient.appointmentStats.cancelled, label: 'Cancelled', color: 'text-rose-600' },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center bg-slate-50 rounded-xl px-4 py-3 min-w-16">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-slate-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Last Appointment */}
                {patient.lastAppointment && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Last/Next Appointment</p>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-700">
                            {formatDate(patient.lastAppointment.appointmentDate)} at {formatTime(patient.lastAppointment.appointmentTime)}
                          </span>
                          <span className={`badge capitalize ${getServiceColor(patient.lastAppointment.serviceType)}`}>
                            {patient.lastAppointment.serviceType}
                          </span>
                          <span className={`badge ${
                            patient.lastAppointment.status === 'scheduled' ? 'badge-success' :
                            patient.lastAppointment.status === 'cancelled' ? 'badge-danger' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {patient.lastAppointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
