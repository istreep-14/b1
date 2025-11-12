import React from 'react';
import { Shift } from '../types';
import { formatCurrency } from '../utils/time';
import { ArrowTrendingUpIcon, BanknotesIcon, CalendarDaysIcon, ClockIcon } from './Icons';

interface DashboardStatsProps {
  shifts: Shift[];
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => (
  <div className="bg-dark-card p-4 rounded-lg flex items-center shadow-lg">
    <div className={`p-3 rounded-full ${colorClass} mr-4`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-dark-text-secondary font-medium">{title}</p>
      <p className="text-xl font-bold text-dark-text">{value}</p>
    </div>
  </div>
);


const DashboardStats: React.FC<DashboardStatsProps> = ({ shifts }) => {
  if (shifts.length === 0) {
    return null;
  }

  // Filter out shifts where tips are not yet collected for accurate financial stats
  const shiftsWithTips = shifts.filter(shift => shift.tips != null);

  const totalShifts = shifts.length;
  const totalHours = shifts.reduce((acc, shift) => acc + shift.duration, 0);
  const totalTips = shiftsWithTips.reduce((acc, shift) => acc + shift.tips!, 0);
  
  // Calculate average tips per hour based only on hours from shifts where tips were collected
  const hoursWithTips = shiftsWithTips.reduce((acc, shift) => acc + shift.duration, 0);
  const avgTipsPerHour = hoursWithTips > 0 ? totalTips / hoursWithTips : 0;


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        title="Total Shifts" 
        value={totalShifts.toString()} 
        icon={<CalendarDaysIcon className="w-6 h-6" />}
        colorClass="bg-indigo-500/10 text-indigo-400"
      />
      <StatCard 
        title="Total Hours" 
        value={totalHours.toFixed(2)} 
        icon={<ClockIcon className="w-6 h-6" />}
        colorClass="bg-violet-500/10 text-violet-400"
      />
      <StatCard 
        title="Total Tips" 
        value={formatCurrency(totalTips)} 
        icon={<BanknotesIcon className="w-6 h-6" />}
        colorClass="bg-emerald-500/10 text-emerald-400"
      />
      <StatCard 
        title="Avg. Tips/Hour" 
        value={formatCurrency(avgTipsPerHour)} 
        icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
        colorClass="bg-amber-500/10 text-amber-400"
      />
    </div>
  );
};

export default DashboardStats;