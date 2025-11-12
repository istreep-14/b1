import React from 'react';
import { Shift } from '../types';
import { formatCurrency, formatDateForDisplay, formatTimeForDisplay } from '../utils/time';
import { PencilIcon, TrashIcon } from './Icons';
import Button from './ui/Button';

interface DashboardProps {
  shifts: Shift[];
  onEdit: (shift: Shift) => void;
  onDelete: (shiftId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ shifts, onEdit, onDelete }) => {
  if (shifts.length === 0) {
    return (
      <div className="text-center py-16 bg-dark-card rounded-lg">
        <h2 className="text-xl font-semibold text-dark-text">No Shifts Logged</h2>
        <p className="text-dark-text-secondary mt-2">Click "New Shift" to add your first entry.</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-card shadow-lg rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-dark-border">
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Date</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Time</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Hours</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Tips</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Tips/Hour</th>
              <th scope="col" className="relative px-4 py-2"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => {
              const hasTips = shift.tips != null;
              const duration = shift.duration || 0;
              const tipsPerHour = shift.tipsPerHour || 0;
              const { dayOfWeek, formattedDate } = formatDateForDisplay(shift.date);
              const formattedStartTime = formatTimeForDisplay(shift.startTime);
              const formattedEndTime = formatTimeForDisplay(shift.endTime);
              return (
                <tr key={shift.id} className="border-b border-dark-border last:border-b-0 hover:bg-zinc-700/50 transition-colors duration-150">
                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <div>
                      <div className="text-xs text-dark-text-secondary">{dayOfWeek}</div>
                      <div className="text-lg font-semibold text-dark-text -mt-1">{formattedDate}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-dark-text-secondary align-middle">
                    <div>
                      <div>{formattedStartTime}</div>
                      <div>{formattedEndTime}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm align-middle">{duration.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-emerald-400 align-middle">
                    {hasTips ? formatCurrency(shift.tips!) : (
                      <span className="text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm align-middle">{hasTips ? formatCurrency(tipsPerHour) : 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2 align-middle">
                    <Button onClick={() => onEdit(shift)} variant="icon" size="sm" aria-label="Edit shift"><PencilIcon className="w-4 h-4" /></Button>
                    <Button onClick={() => onDelete(shift.id)} variant="icon" size="sm" aria-label="Delete shift"><TrashIcon className="w-4 h-4" /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 p-4">
        {shifts.map((shift) => {
          const hasTips = shift.tips != null;
          const duration = shift.duration || 0;
          const tipsPerHour = shift.tipsPerHour || 0;
          const { dayOfWeek, formattedDate } = formatDateForDisplay(shift.date);
          const formattedStartTime = formatTimeForDisplay(shift.startTime);
          const formattedEndTime = formatTimeForDisplay(shift.endTime);
          return (
            <div key={shift.id} className="bg-zinc-900/50 rounded-lg p-4 shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-dark-text-secondary">{dayOfWeek}</p>
                  <p className="font-bold text-lg -mt-1">{formattedDate}</p>
                  <p className="text-sm text-dark-text-secondary mt-1">{formattedStartTime} - {formattedEndTime} ({duration.toFixed(2)} hrs)</p>
                </div>
                <div className="flex space-x-2">
                   <Button onClick={() => onEdit(shift)} variant="icon" size="sm" aria-label="Edit shift"><PencilIcon className="w-4 h-4" /></Button>
                   <Button onClick={() => onDelete(shift.id)} variant="icon" size="sm" aria-label="Delete shift"><TrashIcon className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center border-t border-dark-border pt-3">
                <div className="text-center">
                  <p className="text-xs text-dark-text-secondary">Total Tips</p>
                  <p className="font-semibold text-emerald-400">
                     {hasTips ? formatCurrency(shift.tips!) : (
                      <span className="text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">Pending</span>
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-dark-text-secondary">Tips / Hour</p>
                  <p className="font-semibold">{hasTips ? formatCurrency(tipsPerHour) : 'N/A'}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;