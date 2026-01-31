'use client';

import { useState } from 'react';

interface Appointment {
  id: number;
  phoneNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  status: string;
}

interface CalendarProps {
  appointmentsByDate: Record<string, Appointment[]>;
  onDateClick?: (date: string) => void;
}

export default function Calendar({ appointmentsByDate, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    
    return { daysInMonth, firstDayOfWeek, year, month };
  };
  
  const { daysInMonth, firstDayOfWeek, year, month } = getDaysInMonth(currentDate);
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const formatDateKey = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };
  
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };
  
  const isWeekend = (dayOfWeek: number) => {
    return dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
  };
  
  const getServiceColor = (serviceType: string) => {
    const colors: Record<string, string> = {
      checkup: 'bg-blue-500',
      cleaning: 'bg-emerald-500',
      filling: 'bg-amber-500',
      extraction: 'bg-rose-500',
      whitening: 'bg-purple-500',
      emergency: 'bg-orange-500',
      consultation: 'bg-teal-500',
    };
    return colors[serviceType] || 'bg-slate-500';
  };
  
  const renderDays = () => {
    const days = [];
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-28 bg-slate-50/50 rounded-xl" />
      );
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(day);
      const appointments = appointmentsByDate[dateKey] || [];
      const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
      const closed = isWeekend(dayOfWeek);
      const today = isToday(day);
      
      days.push(
        <div
          key={day}
          onClick={() => !closed && onDateClick?.(dateKey)}
          className={`h-28 p-2 rounded-xl border transition-all duration-200 overflow-hidden
            ${today 
              ? 'bg-gradient-to-br from-primary-50 to-teal-50 border-primary-200 ring-2 ring-primary-500/20' 
              : closed 
                ? 'bg-slate-100/50 border-slate-100 cursor-not-allowed' 
                : 'bg-white border-slate-100 hover:border-primary-200 hover:shadow-lg cursor-pointer card-hover'
            }
          `}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-lg
              ${today 
                ? 'bg-gradient-to-br from-primary-500 to-teal-500 text-white shadow-lg' 
                : closed 
                  ? 'text-slate-400' 
                  : 'text-slate-700'
              }`}
            >
              {day}
            </span>
            {appointments.length > 0 && (
              <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {appointments.length}
              </span>
            )}
          </div>
          
          {closed ? (
            <p className="text-xs text-slate-400 mt-2">Closed</p>
          ) : (
            <div className="space-y-1 mt-1">
              {appointments.slice(0, 2).map((apt) => (
                <div
                  key={apt.id}
                  className={`text-[10px] font-medium text-white px-2 py-1 rounded-md truncate ${getServiceColor(apt.serviceType)} shadow-sm`}
                >
                  {apt.appointmentTime.slice(0, 5)} {apt.serviceType}
                </div>
              ))}
              {appointments.length > 2 && (
                <p className="text-[10px] text-slate-500 font-medium pl-1">
                  +{appointments.length - 2} more
                </p>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-600"
            >
              ←
            </button>
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-600"
            >
              →
            </button>
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {monthNames[month]} <span className="text-slate-400 font-normal">{year}</span>
          </h2>
        </div>
        <button
          onClick={goToToday}
          className="btn-secondary text-sm py-2"
        >
          Today
        </button>
      </div>
      
      {/* Day names */}
      <div className="grid grid-cols-7 bg-slate-50/80 border-b border-gray-100">
        {dayNames.map((day, i) => (
          <div
            key={day}
            className={`px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider
              ${isWeekend(i) ? 'text-slate-400' : 'text-slate-600'}`}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 p-4 bg-gradient-to-b from-white to-slate-50/30">
        {renderDays()}
      </div>
      
      {/* Legend */}
      <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50">
        <div className="flex flex-wrap gap-4 text-xs">
          {[
            { color: 'bg-blue-500', label: 'Checkup' },
            { color: 'bg-emerald-500', label: 'Cleaning' },
            { color: 'bg-amber-500', label: 'Filling' },
            { color: 'bg-rose-500', label: 'Extraction' },
            { color: 'bg-purple-500', label: 'Whitening' },
            { color: 'bg-teal-500', label: 'Consultation' },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 ${item.color} rounded-sm shadow-sm`}></span>
              <span className="text-slate-600">{item.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
