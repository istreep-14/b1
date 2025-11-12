import React, { useState, useRef } from 'react';
import { Shift } from '../types';
import { useShifts } from '../hooks/useShifts';
import Dashboard from './Dashboard';
import ShiftForm from './ShiftForm';
import { PlusIcon, ClockIcon, BanknotesIcon, ArrowTrendingUpIcon } from './Icons';
import Button from './ui/Button';
import DashboardStats from './DashboardStats';
import { formatDateForHeader, formatTimeForDisplay, formatCurrency } from '../utils/time';

type View = 'DASHBOARD' | 'FORM';

interface HeaderData {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  tips?: number;
  tipsPerHour?: number;
}

const ShiftManager: React.FC = () => {
  const { shifts, addShift, updateShift, deleteShift, loading, error } = useShifts();
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [headerData, setHeaderData] = useState<HeaderData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleEdit = (shift: Shift) => {
    setFormError(null);
    setSelectedShift(shift);
    setCurrentView('FORM');
  };

  const handleAddNew = () => {
    setFormError(null);
    setSelectedShift(null);
    setCurrentView('FORM');
  };

  const handleCancelForm = () => {
    setSelectedShift(null);
    setCurrentView('DASHBOARD');
  };

  const handleSaveShift = async (shiftData: Omit<Shift, 'id'> | Shift) => {
    try {
        setFormError(null);
        if (selectedShift && 'id' in shiftData) {
            await updateShift(shiftData as Shift);
        } else {
            await addShift(shiftData as Omit<Shift, 'id'>);
        }
        setCurrentView('DASHBOARD');
        setSelectedShift(null);
    } catch (e) {
        setFormError(e instanceof Error ? e.message : 'An unknown error occurred.');
    }
  };

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit();
  };

  const renderHeaderContent = () => {
    if (currentView === 'FORM' && headerData) {
      const { dayOfWeek, formattedDate } = formatDateForHeader(headerData.date);
      const formattedStartTime = formatTimeForDisplay(headerData.startTime);
      const formattedEndTime = formatTimeForDisplay(headerData.endTime);
      
      return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-start w-full">
          <div>
            <p className="text-sm text-dark-text-secondary">{dayOfWeek}</p>
            <h1 className="text-xl sm:text-2xl font-bold text-dark-text -mt-1">{formattedDate}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-dark-text-secondary">
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1.5" />
                <span>{formattedStartTime || '...'} - {formattedEndTime || '...'}</span>
              </div>
              <div className="flex items-center font-mono">
                <span className="font-sans mr-1.5 font-semibold">Hours:</span>
                <span>{headerData.duration > 0 ? headerData.duration.toFixed(2) : '...'}</span>
              </div>
              
              <div className="border-l border-dark-border h-5 hidden sm:block"></div>

              <div className="flex items-center">
                <BanknotesIcon className="w-4 h-4 mr-1.5" />
                <span>
                  {headerData.tips != null ? formatCurrency(headerData.tips) : <span className="text-yellow-400">Pending</span>}
                </span>
              </div>
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1.5" />
                <span>
                  {headerData.tips != null ? `${formatCurrency(headerData.tipsPerHour ?? 0)}/hr` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0 flex-shrink-0">
            <Button type="button" variant="secondary" onClick={handleCancelForm}>Cancel</Button>
            <Button type="button" onClick={handleFormSubmit}>
              {selectedShift ? 'Update Shift' : 'Save Shift'}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-accent tracking-tight">
          Shifts Dashboard
        </h1>
        <Button onClick={handleAddNew}>
          <PlusIcon className="w-5 h-5 mr-0 sm:mr-2" />
          <span className="hidden sm:inline">New Shift</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full">
      <header className="sticky top-0 bg-dark-bg/80 backdrop-blur-sm z-20 py-4 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6 lg:mb-8 border-b border-dark-border shadow-md">
        <div className="flex items-center justify-between">
          {renderHeaderContent()}
        </div>
      </header>

      <main>
        {loading && <p className="text-center text-dark-text-secondary py-10">Loading shifts...</p>}
        {error && <p className="text-center text-red-400 py-10">{error}</p>}
        
        {!loading && !error && (
          <>
            {currentView === 'DASHBOARD' && (
              <>
                <DashboardStats shifts={shifts} />
                <Dashboard shifts={shifts} onEdit={handleEdit} onDelete={deleteShift} />
              </>
            )}
            {currentView === 'FORM' && (
              <ShiftForm
                ref={formRef}
                shift={selectedShift}
                onSave={handleSaveShift}
                onCancel={handleCancelForm}
                error={formError}
                onDataChange={setHeaderData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ShiftManager;