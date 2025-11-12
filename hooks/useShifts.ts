
import { useState, useEffect, useCallback, useContext } from 'react';
import { Shift } from '../types';
import * as sheetService from '../services/googleSheetsService';
import { GoogleApiContext } from '../contexts/GoogleApiContext';

const MOCK_SHIFTS: Shift[] = [
  { 
    id: '2024-07-22', date: '2024-07-22', startTime: '18:00', endTime: '02:00', tips: 310.50, duration: 8.00, tipsPerHour: 38.81, 
    notes: 'Busy Tuesday night.', tipOut: 30, cashTips: 100, creditTips: 210.50, 
    teamOnShift: { 
      'Bartender': [
        { rowId: '1', coworkerId: '1444', name: 'Ian', startTime: '18:00', endTime: '02:00', location: 'main'}, 
        { rowId: '2', coworkerId: '1278', name: 'Jess', startTime: '18:00', endTime: '02:00', location: 'main' }
      ]
    }, 
    hourlyRate: 5, wageStartTime: '18:00', wageEndTime: '02:00', wage: 40,
    differentials: {
      consideration: { total: -10, events: [{id: 'c1', amount: -10, person: 'Jess', reason: 'Covered first 30 mins'}] },
      tip: { total: 20, events: [{id: 't1', amount: 20, note: 'Customer paid in cash for drink spill'}] },
      role: { hourlyBonus: 0, flatBonus: 15 },
      overtime: 25
    },
    differential: 50, 
    chump: 5.50, 
    chumpGame: { players: [{name: 'Ian', isUser: true}, {name: 'Jess', isUser: false}], pot: 5.50, coins: 1.50, cash: 4.00, winnerName: 'Ian' } 
  },
  { id: '2024-07-21', date: '2024-07-21', startTime: '17:00', endTime: '01:30', tips: 255.00, duration: 8.50, tipsPerHour: 30.00, tipOut: 25, 
    teamOnShift: {
      'Bartender': [
        { rowId: '1', coworkerId: '1278', name: 'Jess', startTime: '17:00', endTime: '01:30', location: 'deck' }
      ],
      'Server': [
        { rowId: '2', coworkerId: '1356', name: 'Zoe', startTime: '17:00', endTime: '01:30', location: '' }
      ]
    }, 
    hourlyRate: 5, wage: 42.5 
  },
  { id: '2024-07-20', date: '2024-07-20', startTime: '19:00', endTime: '03:00', tips: 420.75, duration: 8.00, tipsPerHour: 52.59, notes: 'Crazy Saturday, big party.', parties: [{ id: 'party_1721503200000', name: 'Johnson Wedding Reception', type: 'wedding', cutType: 'night', location: 'upstairs', time: {start: '18:00', end: '23:00', duration: 5.0}, size: 120, packages: { drink: 'Premium Open Bar', food: 'Buffet Dinner' } }], hourlyRate: 5, wage: 40 },
  { id: '2024-07-18', date: '2024-07-18', startTime: '20:00', endTime: '04:00', duration: 8.00, tipOut: 40, hourlyRate: 5, wage: 40 }, // Shift with pending tips
  { id: '2024-07-17', date: '2024-07-17', startTime: '18:30', endTime: '02:30', tips: 290.25, duration: 8.00, tipsPerHour: 36.28, hourlyRate: 5, wage: 40 },
];


export const useShifts = () => {
  const { isAuthenticated } = useContext(GoogleApiContext);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = useCallback(async () => {
    if (!isAuthenticated) {
      // Preview mode with mock data
      setShifts(MOCK_SHIFTS);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const fetchedShifts = await sheetService.getShifts();
      setShifts(fetchedShifts);
    } catch (err) {
      setError('Failed to fetch shifts from Google Sheet.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const addShift = async (shiftData: Omit<Shift, 'id'>) => {
    if (!isAuthenticated) {
      // Preview mode
      const newShift: Shift = { ...shiftData, id: shiftData.date };
      setShifts(prev => [newShift, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      return;
    }
    try {
      const newShift: Shift = { ...shiftData, id: shiftData.date };
      await sheetService.addShift(newShift);
      // Re-fetch to get sorted list
      fetchShifts();
    } catch (err) {
      const message = `Failed to add shift: ${err instanceof Error ? err.message : 'Unknown error'}`
      setError(message);
      console.error(err);
      throw new Error(message);
    }
  };

  const updateShift = async (shift: Shift) => {
    if (!isAuthenticated) {
      // Preview mode
      setShifts(prev => prev.map(s => s.id === shift.id ? shift : s));
      return;
    }
    try {
      await sheetService.updateShift(shift);
      fetchShifts();
    } catch (err) {
      setError('Failed to update shift.');
      console.error(err);
      throw new Error('Failed to update shift.');
    }
  };

  const deleteShift = async (shiftId: string) => {
     if (!isAuthenticated) {
      // Preview mode
      setShifts(prevShifts => prevShifts.filter(s => s.id !== shiftId));
      return;
    }
    try {
      await sheetService.deleteShift(shiftId);
      setShifts(prevShifts => prevShifts.filter(s => s.id !== shiftId));
    } catch (err) {
      setError('Failed to delete shift.');
      console.error(err);
    }
  };

  return { shifts, loading, error, addShift, updateShift, deleteShift, refetch: fetchShifts };
};
