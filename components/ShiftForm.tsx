import React, { useState, useEffect, useMemo, useCallback, useRef, forwardRef } from 'react';
import { Shift, Coworker, CoworkerShift, Location, PrivateParty, PARTY_TYPES, PARTY_LOCATIONS, PARTY_CUT_TYPES, PartyType, PartyLocation, PartyCutType, ChumpGame, Differentials, ConsiderationEvent, TipDifferentialEvent, ChumpGamePlayer, Position } from '../types';
import { calculateDurationHours, calculateTipsPerHour, formatCurrency, formatTimeForDisplay, formatDateForHeader } from '../utils/time';
import { useCoworkers } from '../hooks/useCoworkers';
import { useSettings } from '../hooks/useSettings';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import TimeInput from './ui/TimeInput';
import Combobox from './ui/Combobox';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import SelectCombobox from './ui/SelectCombobox';
import { getLocationColor, getPositionColor } from '../utils/color';
import { 
  XCircleIcon, PlusIcon, InformationCircleIcon, UsersIcon, 
  DocumentTextIcon, GiftIcon, PencilIcon, TrashIcon, 
  CurrencyDollarIcon, BanknotesIcon, SparklesIcon, PlusCircleIcon, ArrowUturnLeftIcon, ClockIcon,
  ChevronDownIcon, StarIcon, ArrowsRightLeftIcon, ListBulletIcon, MinusIcon, ArrowTrendingUpIcon, CalendarDaysIcon
} from './Icons';

// Sub-component for the party form, rendered in a modal
const PartyFormModal: React.FC<{
  party: PrivateParty | null;
  shiftDate: string;
  onSave: (party: PrivateParty) => void;
  onCancel: () => void;
}> = ({ party, shiftDate, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: party?.id || `party-${Date.now()}`,
    name: party?.name || '',
    type: party?.type || 'other',
    cutType: party?.cutType || 'event',
    location: party?.location || 'main',
    startTime: party?.time.start || '',
    endTime: party?.time.end || '',
    size: party?.size.toString() || '',
    drinkPackage: party?.packages.drink || '',
    foodPackage: party?.packages.food || '',
  });
  const [error, setError] = useState('');

  const duration = useMemo(() => calculateDurationHours(shiftDate, formData.startTime, formData.endTime), [shiftDate, formData.startTime, formData.endTime]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTimeChange = (name: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.size || duration <= 0) {
      setError('Please fill in Name, Size, and valid times.');
      return;
    }
    setError('');
    onSave({
      id: formData.id,
      name: formData.name,
      type: formData.type as PartyType,
      cutType: formData.cutType as PartyCutType,
      location: formData.location as PartyLocation,
      time: { start: formData.startTime, end: formData.endTime, duration },
      size: parseInt(formData.size, 10),
      packages: { drink: formData.drinkPackage, food: formData.foodPackage },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-2xl !p-0">
        <div className="p-6 border-b border-dark-border">
          <h3 className="text-xl font-bold text-brand-accent">{party ? 'Edit Party' : 'Add Party'}</h3>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input label="Party Name" name="name" value={formData.name} onChange={handleChange} required />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectCombobox label="Type" items={PARTY_TYPES} selected={formData.type} onSelect={val => setFormData(p => ({...p, type: val as PartyType}))} />
            <SelectCombobox label="Location" items={PARTY_LOCATIONS} selected={formData.location} onSelect={val => setFormData(p => ({...p, location: val as PartyLocation}))} />
            <Input label="Number of Guests" type="number" name="size" value={formData.size} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <TimeInput label="Start Time" value={formData.startTime} onChange={(val) => handleTimeChange('startTime', val)} context="start" required />
             <TimeInput label="End Time" value={formData.endTime} onChange={(val) => handleTimeChange('endTime', val)} context="end" pairedValue={formData.startTime} required />
             <SelectCombobox label="Tip Cut Type" items={PARTY_CUT_TYPES} selected={formData.cutType} onSelect={val => setFormData(p => ({...p, cutType: val as PartyCutType}))} />
          </div>
          <div>
            <p className="text-center text-sm text-dark-text-secondary">Duration: <span className="font-semibold text-brand-accent">{duration.toFixed(2)} hours</span></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input label="Drink Package (Optional)" name="drinkPackage" value={formData.drinkPackage} onChange={handleChange} />
             <Input label="Food Package (Optional)" name="foodPackage" value={formData.foodPackage} onChange={handleChange} />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
        <div className="flex justify-end items-center space-x-4 p-4 border-t border-dark-border bg-zinc-900/30">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={handleSave}>
            {party ? 'Update Party' : 'Add Party'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Modal for adding/editing a Consideration Event
const ConsiderationEventModal: React.FC<{
  event: ConsiderationEvent | null,
  onSave: (event: ConsiderationEvent) => void,
  onCancel: () => void,
}> = ({ event, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        id: event?.id || `c-event-${Date.now()}`,
        amount: event?.amount.toString() || '',
        person: event?.person || '',
        reason: event?.reason || '',
        note: event?.note || '',
    });

    const handleSave = () => {
        if (!formData.amount || !formData.person || !formData.reason) return;
        onSave({ ...formData, amount: parseFloat(formData.amount) || 0 });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-lg">
                <h3 className="text-lg font-bold text-brand-accent mb-4">{event ? 'Edit' : 'Add'} Consideration Event</h3>
                <div className="space-y-4">
                    <Input label="Amount" type="number" step="0.01" value={formData.amount} onChange={e => setFormData(p => ({...p, amount: e.target.value}))} prefix="$" placeholder="e.g., -20 for paying out" required />
                    <Input label="Person" value={formData.person} onChange={e => setFormData(p => ({...p, person: e.target.value}))} required />
                    <Input label="Reason" value={formData.reason} onChange={e => setFormData(p => ({...p, reason: e.target.value}))} required />
                    <Input label="Note (Optional)" value={formData.note} onChange={e => setFormData(p => ({...p, note: e.target.value}))} />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="button" onClick={handleSave}>{event ? 'Update' : 'Add'}</Button>
                </div>
            </Card>
        </div>
    );
}

// Modal for adding/editing a Tip Differential Event
const TipDifferentialEventModal: React.FC<{
  event: TipDifferentialEvent | null,
  onSave: (event: TipDifferentialEvent) => void,
  onCancel: () => void,
}> = ({ event, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        id: event?.id || `t-event-${Date.now()}`,
        amount: event?.amount.toString() || '',
        note: event?.note || '',
    });

    const handleSave = () => {
        if (!formData.amount) return;
        onSave({ ...formData, amount: parseFloat(formData.amount) || 0 });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-lg">
                <h3 className="text-lg font-bold text-brand-accent mb-4">{event ? 'Edit' : 'Add'} Tip Differential Event</h3>
                <div className="space-y-4">
                    <Input label="Amount" type="number" step="0.01" value={formData.amount} onChange={e => setFormData(p => ({...p, amount: e.target.value}))} prefix="$" required />
                    <Input label="Note (Optional)" value={formData.note} onChange={e => setFormData(p => ({...p, note: e.target.value}))} />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="button" onClick={handleSave}>{event ? 'Update' : 'Add'}</Button>
                </div>
            </Card>
        </div>
    );
}

interface HeaderData {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  tips?: number;
  tipsPerHour?: number;
}
interface ShiftFormProps {
  shift: Shift | null;
  onSave: (shift: Omit<Shift, 'id'> | Shift) => Promise<void>;
  onCancel: () => void;
  error?: string | null;
  onDataChange: (data: HeaderData) => void;
}

const defaultDifferentials = (): Differentials => ({
  consideration: { total: 0, events: [] },
  tip: { total: 0, events: [] },
  role: { hourlyBonus: 0, flatBonus: 0 },
  overtime: 0,
});


type FormData = Omit<Shift, 'id' | 'duration' | 'tipsPerHour'>;

type Section = 'core' | 'tips' | 'wage' | 'consideration' | 'tipDifferential' | 'roleDifferential' | 'overtime' | 'chump' | 'workers' | 'parties' | 'notes';

type PositionViewMode = 'edit' | 'view' | 'collapsed';

const ShiftForm = forwardRef<HTMLFormElement, ShiftFormProps>(({ shift, onSave, onCancel, error: apiError, onDataChange }, ref) => {
  const { coworkers } = useCoworkers();
  const { positions, locations } = useSettings();
  const user = useMemo(() => coworkers.find(c => c.isUser), [coworkers]);
  const userName = user?.name || 'Ian'; // Fallback if user isn't set
  
  const [activeSection, setActiveSection] = useState<Section>('core');
  const [isDifferentialGroupOpen, setIsDifferentialGroupOpen] = useState(false);
  const [isEarningsGroupOpen, setIsEarningsGroupOpen] = useState(true);
  
  const [positionViewModes, setPositionViewModes] = useState<Partial<Record<Position, PositionViewMode>>>({});
  const [positionWorkerCounts, setPositionWorkerCounts] = useState<Partial<Record<Position, number>>>({});

  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    tips: undefined,
    tipOut: undefined,
    cashTips: undefined,
    creditTips: undefined,
    notes: '',
    teamOnShift: {},
    parties: [],
    hourlyRate: undefined,
    wageStartTime: '',
    wageEndTime: '',
    wage: undefined,
    differentials: defaultDifferentials(),
    differential: undefined,
    chump: undefined,
    chumpGame: undefined,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditingDate, setIsEditingDate] = useState(false);
  
  const workerInputRefs = useRef<Record<string, (HTMLInputElement | null)[]>>({});

  // Modals
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<PrivateParty | null>(null);
  const [isConsiderationModalOpen, setIsConsiderationModalOpen] = useState(false);
  const [editingConsideration, setEditingConsideration] = useState<ConsiderationEvent | null>(null);
  const [isTipDiffModalOpen, setIsTipDiffModalOpen] = useState(false);
  const [editingTipDiff, setEditingTipDiff] = useState<TipDifferentialEvent | null>(null);

  // Input Modes
  const [considerationInputMode, setConsiderationInputMode] = useState<'total' | 'events'>('total');
  const [tipDiffInputMode, setTipDiffInputMode] = useState<'total' | 'events'>('total');
  const [chumpInputMode, setChumpInputMode] = useState<'total' | 'breakdown'>('total');

  useEffect(() => {
    if (shift) {
      setFormData({
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        tips: shift.tips,
        tipOut: shift.tipOut,
        cashTips: shift.cashTips,
        creditTips: shift.creditTips,
        notes: shift.notes || '',
        teamOnShift: shift.teamOnShift || {},
        parties: shift.parties || [],
        hourlyRate: shift.hourlyRate ?? 5.00,
        wageStartTime: shift.wageStartTime || shift.startTime,
        wageEndTime: shift.wageEndTime || shift.endTime,
        wage: shift.wage,
        differentials: shift.differentials || defaultDifferentials(),
        differential: shift.differential,
        chump: shift.chump,
        chumpGame: shift.chumpGame,
      });
      setIsEditingDate(false);

      // Initialize view modes for existing groups
      const initialViewModes: Partial<Record<Position, PositionViewMode>> = {};
      const initialCounts: Partial<Record<Position, number>> = {};
      for (const pos in shift.teamOnShift || {}) {
          initialViewModes[pos as Position] = 'view';
          initialCounts[pos as Position] = shift.teamOnShift![pos as Position]!.length;
      }
      setPositionViewModes(initialViewModes);
      setPositionWorkerCounts(initialCounts);

      if (shift.chumpGame) {
        if (shift.chumpGame.coins != null || shift.chumpGame.cash != null) {
          setChumpInputMode('breakdown');
        } else {
          setChumpInputMode('total');
        }
      }
      
      const differentials = shift.differentials || defaultDifferentials();
      if (differentials.consideration.events.length > 0) setConsiderationInputMode('events');
      if (differentials.tip.events.length > 0) setTipDiffInputMode('events');
    } else {
      // Set defaults for a new shift
      setFormData(prev => ({ ...prev, hourlyRate: 5.00, teamOnShift: { 'Bartender': [] } }));
      setPositionViewModes({ 'Bartender': 'edit' });
      setIsEditingDate(true);
    }
  }, [shift]);
  
  // Two-way sync for total tips
  useEffect(() => {
    const cash = formData.cashTips || 0;
    const credit = formData.creditTips || 0;
    const currentTotal = formData.tips || 0;
    const newTotal = cash + credit;
    if ((cash > 0 || credit > 0) && newTotal !== currentTotal) {
      setFormData(prev => ({...prev, tips: newTotal }));
    }
  }, [formData.cashTips, formData.creditTips]);

  // DERIVED VALUES & CALCULATIONS
  const duration = useMemo(() => calculateDurationHours(formData.date, formData.startTime, formData.endTime), [formData.date, formData.startTime, formData.endTime]);
  const tipsPerHour = useMemo(() => calculateTipsPerHour(formData.tips, duration), [formData.tips, duration]);
  const wageDuration = useMemo(() => calculateDurationHours(formData.date, formData.wageStartTime || formData.startTime, formData.wageEndTime || formData.endTime), [formData.date, formData.wageStartTime, formData.startTime, formData.wageEndTime, formData.endTime]);
  const baseWage = useMemo(() => (formData.hourlyRate || 0) * wageDuration, [formData.hourlyRate, wageDuration]);

  const totalConsideration = useMemo(() => {
    const diffs = formData.differentials || defaultDifferentials();
    return considerationInputMode === 'events' ? diffs.consideration.events.reduce((sum, e) => sum + e.amount, 0) : diffs.consideration.total;
  }, [formData.differentials, considerationInputMode]);

  const totalTipDifferential = useMemo(() => {
    const diffs = formData.differentials || defaultDifferentials();
    return tipDiffInputMode === 'events' ? diffs.tip.events.reduce((sum, e) => sum + e.amount, 0) : diffs.tip.total;
  }, [formData.differentials, tipDiffInputMode]);
  
  const roleDifferentialBonus = useMemo(() => {
    const diffs = formData.differentials || defaultDifferentials();
    const hourly = (diffs.role.hourlyBonus || 0) * wageDuration;
    const flat = diffs.role.flatBonus || 0;
    return hourly + flat;
  }, [formData.differentials, wageDuration]);
  
  const totalDifferential = useMemo(() => {
    const overtime = formData.differentials?.overtime || 0;
    return totalConsideration + totalTipDifferential + roleDifferentialBonus + overtime;
  }, [totalConsideration, totalTipDifferential, roleDifferentialBonus, formData.differentials?.overtime]);


  const chumpPot = useMemo(() => {
    if (!formData.chumpGame) return 0;
    if (chumpInputMode === 'breakdown') {
      return (formData.chumpGame.coins || 0) + (formData.chumpGame.cash || 0);
    }
    return formData.chumpGame.pot || 0;
  }, [formData.chumpGame, chumpInputMode]);

  const totalEarnings = useMemo(() => {
    const netTips = (formData.tips || 0) - (formData.tipOut || 0);
    return netTips + baseWage + totalDifferential + (formData.chump || 0);
  }, [formData.tips, formData.tipOut, baseWage, totalDifferential, formData.chump]);

  const allWorkers = useMemo(() => {
    return Object.values(formData.teamOnShift || {}).flat();
  }, [formData.teamOnShift]);

  // Send data up to the parent for the sticky header
  useEffect(() => {
    onDataChange({
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration,
      tips: formData.tips,
      tipsPerHour,
    });
  }, [formData.date, formData.startTime, formData.endTime, duration, formData.tips, tipsPerHour, onDataChange]);
  

  // EVENT HANDLERS
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' && value === '' ? undefined : value }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
  }

  const handleDifferentialChange = (category: keyof Differentials, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      differentials: {
        ...(prev.differentials || defaultDifferentials()),
        [category]: typeof prev.differentials![category] === 'object' 
          ? {
              ...(prev.differentials![category] as object),
              [field]: value,
            }
          : value
      }
    }));
  };

  const handleChumpGameChange = (field: keyof ChumpGame, value: any) => {
    setFormData(prev => ({
      ...prev,
      chumpGame: {
        ...(prev.chumpGame || { players: [], pot: 0, winnerName: null }),
        [field]: value
      }
    }));
  };
  
  const handleTimeChange = (name: 'startTime' | 'endTime' | 'wageStartTime' | 'wageEndTime', value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
  
  // --- WORKERS SECTION HANDLERS ---
  const handleLaunchWorkerGroup = (position: Position) => {
      const count = positionWorkerCounts[position] || 1;
      const newWorkers = Array.from({ length: count }, (_, i) => ({
          rowId: `team-${position}-${Date.now()}-${i}`,
          coworkerId: null, name: '',
          startTime: formData.startTime, endTime: formData.endTime,
          location: position === 'Bartender' ? 'main' : ''
      }));
      setFormData(prev => ({
          ...prev,
          teamOnShift: { ...(prev.teamOnShift || {}), [position]: newWorkers }
      }));
      setPositionViewModes(prev => ({...prev, [position]: 'edit'}));
  };
  
  const handleSetPositionViewMode = (position: Position, mode: PositionViewMode) => {
      setPositionViewModes(prev => ({...prev, [position]: mode}));
  };

  const handleAddWorkerToGroup = (position: Position) => {
    const newMember: CoworkerShift = {
        rowId: `team-${Date.now()}`,
        coworkerId: null,
        name: '',
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: position === 'Bartender' ? 'main' : ''
    };
    setFormData(prev => {
        const group = prev.teamOnShift?.[position] || [];
        return {
            ...prev,
            teamOnShift: {
                ...prev.teamOnShift,
                [position]: [...group, newMember]
            }
        }
    });
  };
  
  const handleUpdateWorkerInGroup = (position: Position, index: number, updatedMember: Partial<CoworkerShift>) => {
    setFormData(prev => {
        const group = prev.teamOnShift?.[position] || [];
        const newGroup = group.map((m, i) => i === index ? { ...m, ...updatedMember } : m);
        return {
            ...prev,
            teamOnShift: {
                ...prev.teamOnShift,
                [position]: newGroup
            }
        }
    });
  };
  
  const handleRemoveWorkerFromGroup = (position: Position, index: number) => {
    setFormData(prev => {
        const group = prev.teamOnShift?.[position] || [];
        const newGroup = group.filter((_, i) => i !== index);
        return {
            ...prev,
            teamOnShift: {
                ...prev.teamOnShift,
                [position]: newGroup
            }
        }
    });
  };

  const handleWorkerKeyDown = (e: React.KeyboardEvent, position: Position, index: number) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      const group = formData.teamOnShift?.[position] || [];
      if (index === group.length - 1) { // Last worker in the group
        e.preventDefault();
        handleAddWorkerToGroup(position);
      }
    }
  };
  
  // --- OTHER HANDLERS ---
  const handleSaveParty = (party: PrivateParty) => {
    setFormData(prev => {
      const existing = prev.parties?.find(p => p.id === party.id);
      const parties = existing
        ? prev.parties!.map(p => p.id === party.id ? party : p)
        : [...(prev.parties || []), party];
      return { ...prev, parties };
    });
    setIsPartyModalOpen(false);
    setEditingParty(null);
  };

  const handleSaveConsideration = (event: ConsiderationEvent) => {
    handleDifferentialChange('consideration', 'events', 
      (formData.differentials?.consideration.events || []).find(e => e.id === event.id)
      ? (formData.differentials?.consideration.events || []).map(e => e.id === event.id ? event : e)
      : [...(formData.differentials?.consideration.events || []), event]
    );
    setIsConsiderationModalOpen(false);
    setEditingConsideration(null);
  };
  
  const handleSaveTipDiff = (event: TipDifferentialEvent) => {
    handleDifferentialChange('tip', 'events', 
      (formData.differentials?.tip.events || []).find(e => e.id === event.id)
      ? (formData.differentials?.tip.events || []).map(e => e.id === event.id ? event : e)
      : [...(formData.differentials?.tip.events || []).filter(e => e.id !== event.id), event]
    );
    setIsTipDiffModalOpen(false);
    setEditingTipDiff(null);
  };
  
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.core = 'Date is required.';
    if (!formData.startTime) newErrors.core = 'Start time is required.';
    if (!formData.endTime) newErrors.core = 'End time is required.';
    if (duration <= 0) newErrors.core = 'End time must be after start time.';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setActiveSection(Object.keys(newErrors)[0] as Section);
    }
    return Object.keys(newErrors).length === 0;
  }, [formData, duration]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const finalShift: Omit<Shift, 'id'> = {
      ...formData,
      duration,
      tipsPerHour: formData.tips != null ? calculateTipsPerHour(formData.tips, duration) : undefined,
      wage: baseWage,
      differential: totalDifferential,
      chump: formData.chumpGame?.winnerName === userName ? chumpPot : 0,
    };

    if (shift) {
      await onSave({ ...finalShift, id: shift.id });
    } else {
      await onSave(finalShift);
    }
  };

  // Autopopulate user in team on shift for new shifts
  useEffect(() => {
    if (!shift && user && Object.keys(formData.teamOnShift || {}).length === 1 && formData.teamOnShift?.['Bartender']?.length === 0) {
        const userPosition = user.positions.includes('Bartender') ? 'Bartender' : (user.positions[0] || 'Bartender');
        const newUserEntry = {
            rowId: 'user-row',
            coworkerId: user.id,
            name: user.name,
            startTime: formData.startTime,
            endTime: formData.endTime,
            location: userPosition === 'Bartender' ? 'main' : '' as Location | ''
        };

        setFormData(prev => ({
            ...prev,
            teamOnShift: {
                ...(prev.teamOnShift || {}),
                [userPosition]: [newUserEntry]
            }
        }));
        setPositionViewModes(prev => ({ ...prev, [userPosition]: 'edit' }));
    }
  }, [shift, user, formData.startTime, formData.endTime]);


  // Sync user's times with main shift times
  useEffect(() => {
    setFormData(prev => {
      const newTeamOnShift = { ...prev.teamOnShift };
      for (const pos in newTeamOnShift) {
        const group = newTeamOnShift[pos as Position]!;
        newTeamOnShift[pos as Position] = group.map(member => 
          member.rowId === 'user-row' ? {...member, startTime: prev.startTime, endTime: prev.endTime } : member
        );
      }
      return { ...prev, teamOnShift: newTeamOnShift };
    });
  }, [formData.startTime, formData.endTime]);
  
  // Autopopulate user in chump game
  useEffect(() => {
    if (userName && !(formData.chumpGame?.players || []).some(p => p.isUser)) {
       handleChumpGameChange('players', [
         ...(formData.chumpGame?.players || []).filter(p => !p.isUser), // remove any old user
         { name: userName, isUser: true }
       ]);
    }
  }, [userName, formData.chumpGame?.players]);

  const SectionHeader = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="pb-4 border-b border-dark-border mb-6 flex justify-between items-end">
        <h2 className="text-xl font-bold text-dark-text">{title}</h2>
        <div className="text-sm text-dark-text-secondary">{children}</div>
    </div>
  );
  
  const InputContainer = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="p-6 border-b border-dark-border last:border-b-0">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-text-secondary mb-3">{title}</h3>
        {children}
    </div>
  );


  const renderSectionContent = () => {
    const { dayOfWeek, formattedDate } = formatDateForHeader(formData.date);

    switch(activeSection) {
      case 'core': return (
        <div>
          <SectionHeader title="Core Info">
             {errors.core && <p className="text-red-400 text-sm text-center">{errors.core}</p>}
          </SectionHeader>
          
           <div className="relative mb-6">
            <label htmlFor="date-input" className="sr-only">Date</label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <CalendarDaysIcon className="w-5 h-5 text-dark-text-secondary" />
            </div>
            {isEditingDate ? (
                <input 
                    type="date" 
                    id="date-input"
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange}
                    onBlur={() => setIsEditingDate(false)}
                    autoFocus
                    className="w-full bg-transparent text-lg font-semibold pl-10 py-2 focus:outline-none"
                />
            ) : (
                <button type="button" onClick={() => setIsEditingDate(true)} className="w-full text-left pl-10 py-2 group">
                    <p className="text-xs text-dark-text-secondary group-hover:text-brand-accent">{dayOfWeek}</p>
                    <p className="text-lg font-semibold text-dark-text group-hover:text-brand-accent -mt-1">{formattedDate}</p>
                </button>
            )}
           </div>

          <Card className="!p-0">
            <InputContainer title="Time">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <TimeInput label="Start" value={formData.startTime} onChange={val => handleTimeChange('startTime', val)} context="start" required />
                  <TimeInput label="End" value={formData.endTime} onChange={val => handleTimeChange('endTime', val)} context="end" pairedValue={formData.startTime} required />
              </div>
              <p className="text-right text-sm text-dark-text-secondary mt-2">
                Shift Duration: <span className="font-semibold text-dark-text">{duration.toFixed(2)} hours</span>
              </p>
            </InputContainer>
            <InputContainer title="Tips">
              <Input label="" type="number" step="0.01" name="tips" value={formData.tips ?? ''} onChange={handleNumericChange} prefix="$" placeholder="0.00" className="text-base py-3"/>
            </InputContainer>
          </Card>
        </div>
      );
      case 'tips': return (
        <div>
           <SectionHeader title="Tip Details">
              Net Tips: <span className="font-bold text-emerald-400">{formatCurrency((formData.tips || 0) - (formData.tipOut || 0))}</span>
           </SectionHeader>
           <Card className="!p-0">
             <InputContainer title="Breakdown">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Cash" type="number" step="0.01" name="cashTips" value={formData.cashTips ?? ''} onChange={handleNumericChange} prefix="$" className="text-base py-3" />
                    <Input label="Credit Card" type="number" step="0.01" name="creditTips" value={formData.creditTips ?? ''} onChange={handleNumericChange} prefix="$" className="text-base py-3" />
                </div>
                 <p className="text-sm text-dark-text-secondary mt-4">Total Tips: <span className="font-semibold text-dark-text">{formatCurrency(formData.tips || 0)}</span></p>
             </InputContainer>
             <InputContainer title="Tip Out">
                <Input label="To Support Staff" type="number" step="0.01" name="tipOut" value={formData.tipOut ?? ''} onChange={handleNumericChange} prefix="$" className="text-base py-3" />
             </InputContainer>
           </Card>
        </div>
      );
       case 'wage': return (
        <div>
          <SectionHeader title="Wage">
            Base Wage: <span className="font-bold text-emerald-400">{formatCurrency(baseWage)}</span>
          </SectionHeader>
          <Card className="!p-0">
            <InputContainer title="Time">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <TimeInput label="Start" value={formData.wageStartTime || formData.startTime} onChange={val => handleTimeChange('wageStartTime', val)} context="start" />
                 <TimeInput label="End" value={formData.wageEndTime || formData.endTime} onChange={val => handleTimeChange('wageEndTime', val)} context="end" pairedValue={formData.wageStartTime || formData.startTime} />
               </div>
                <p className="text-right text-sm text-dark-text-secondary mt-2">Wage Duration: <span className="font-semibold text-dark-text">{wageDuration.toFixed(2)} hours</span></p>
            </InputContainer>
            <InputContainer title="Hourly Rate">
                <Input label="" type="number" step="0.01" name="hourlyRate" value={formData.hourlyRate ?? ''} onChange={handleNumericChange} prefix="$" placeholder="0.00" className="text-base py-3"/>
            </InputContainer>
            <div className="p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-text-secondary mb-3">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-text-secondary">Wage Duration:</span>
                    <span className="font-mono text-dark-text">{wageDuration.toFixed(2)} hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-dark-text-secondary">Hourly Rate:</span>
                    <span className="font-mono text-dark-text">× {formatCurrency(formData.hourlyRate || 0)} /hour</span>
                  </div>
                </div>
                <div className="border-t border-dark-border mt-3 pt-3 flex justify-between items-baseline">
                  <span className="font-semibold text-dark-text">Base Wage</span>
                  <span className="font-bold text-xl text-emerald-400">{formatCurrency(baseWage)}</span>
                </div>
            </div>
          </Card>
        </div>
      );
      case 'consideration': return (
        <div>
          <SectionHeader title="Consideration">
            Total: <span className="font-bold text-emerald-400">{formatCurrency(totalConsideration)}</span>
          </SectionHeader>
          <Card>
             <div className="flex justify-between items-center mb-2">
                 <h4 className="font-semibold text-brand-accent">Consideration</h4>
                 <Button type="button" variant="icon" size="sm" onClick={() => setConsiderationInputMode(p => p === 'total' ? 'events' : 'total')}><ArrowUturnLeftIcon className="w-4 h-4" /> Switch Input</Button>
             </div>
             {considerationInputMode === 'total' ? (
                <Input type="number" step="0.01" label="Total Consideration" prefix="$" value={formData.differentials?.consideration.total ?? ''} onChange={e => handleDifferentialChange('consideration', 'total', e.target.value === '' ? 0 : parseFloat(e.target.value))} />
             ) : (
                <div>
                   <Button size="sm" type="button" onClick={() => setIsConsiderationModalOpen(true)} className="w-full mb-2"><PlusIcon className="w-4 h-4 mr-2" /> Add Consideration Event</Button>
                   <div className="space-y-2">
                     {(formData.differentials?.consideration.events || []).map(event => (
                       <div key={event.id} className="text-xs bg-dark-border p-2 rounded flex justify-between items-center">
                         <div>
                            <p>{event.person}: <span className="font-semibold">{formatCurrency(event.amount)}</span></p>
                            <p className="text-dark-text-secondary">{event.reason}</p>
                         </div>
                         <div className="space-x-1">
                           <Button type="button" variant="icon" size="sm" onClick={() => {setEditingConsideration(event); setIsConsiderationModalOpen(true);}}><PencilIcon className="w-3 h-3"/></Button>
                           <Button type="button" variant="icon" size="sm" onClick={() => handleDifferentialChange('consideration', 'events', formData.differentials?.consideration.events.filter(e => e.id !== event.id))}><TrashIcon className="w-3 h-3"/></Button>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
             )}
          </Card>
        </div>
      );
      case 'tipDifferential': return (
         <div>
          <SectionHeader title="Tip Differential">
            Total: <span className="font-bold text-emerald-400">{formatCurrency(totalTipDifferential)}</span>
          </SectionHeader>
           <Card>
             <div className="flex justify-between items-center mb-2">
                 <h4 className="font-semibold text-brand-accent">Tip Differential</h4>
                 <Button type="button" variant="icon" size="sm" onClick={() => setTipDiffInputMode(p => p === 'total' ? 'events' : 'total')}><ArrowUturnLeftIcon className="w-4 h-4" /> Switch Input</Button>
             </div>
             {tipDiffInputMode === 'total' ? (
                <Input type="number" step="0.01" label="Total Tip Differential" prefix="$" value={formData.differentials?.tip.total ?? ''} onChange={e => handleDifferentialChange('tip', 'total', e.target.value === '' ? 0 : parseFloat(e.target.value))} />
             ) : (
                <div>
                   <Button size="sm" type="button" onClick={() => setIsTipDiffModalOpen(true)} className="w-full mb-2"><PlusIcon className="w-4 h-4 mr-2" /> Add Tip Differential Event</Button>
                   {(formData.differentials?.tip.events || []).map(event => (
                       <div key={event.id} className="text-xs bg-dark-border p-2 rounded flex justify-between items-center">
                          <p>{event.note || 'Event'}: <span className="font-semibold">{formatCurrency(event.amount)}</span></p>
                          <div className="space-x-1">
                           <Button type="button" variant="icon" size="sm" onClick={() => {setEditingTipDiff(event); setIsTipDiffModalOpen(true);}}><PencilIcon className="w-3 h-3"/></Button>
                           <Button type="button" variant="icon" size="sm" onClick={() => handleDifferentialChange('tip', 'events', formData.differentials?.tip.events.filter(e => e.id !== event.id))}><TrashIcon className="w-3 h-3"/></Button>
                         </div>
                       </div>
                   ))}
                </div>
             )}
          </Card>
        </div>
      );
      case 'roleDifferential': return (
        <div>
          <SectionHeader title="Role Differential">
            Total: <span className="font-bold text-emerald-400">{formatCurrency(roleDifferentialBonus)}</span>
          </SectionHeader>
          <Card>
            <h4 className="font-semibold text-brand-accent mb-2">Role Differential</h4>
            <div className="space-y-2">
              <Button type="button" size="sm" className="w-full" onClick={() => handleDifferentialChange('role', 'hourlyBonus', 6)}>Add Closing Manager ($6/hr) Preset</Button>
              <div className="grid grid-cols-2 gap-4">
                 <Input type="number" step="0.01" label="Hourly Bonus" prefix="$" value={formData.differentials?.role.hourlyBonus ?? ''} onChange={e => handleDifferentialChange('role', 'hourlyBonus', e.target.value === '' ? 0 : parseFloat(e.target.value))} />
                 <Input type="number" step="0.01" label="Flat Bonus" prefix="$" value={formData.differentials?.role.flatBonus ?? ''} onChange={e => handleDifferentialChange('role', 'flatBonus', e.target.value === '' ? 0 : parseFloat(e.target.value))} />
              </div>
            </div>
          </Card>
        </div>
      );
      case 'overtime': return (
        <div>
           <SectionHeader title="Overtime">
             Total: <span className="font-bold text-emerald-400">{formatCurrency(formData.differentials?.overtime || 0)}</span>
           </SectionHeader>
           <Card>
              <Input label="Overtime Pay" type="number" step="0.01" value={formData.differentials?.overtime ?? ''} onChange={e => handleDifferentialChange('overtime', '', e.target.value === '' ? 0 : parseFloat(e.target.value))} prefix="$" />
           </Card>
        </div>
      );
      case 'chump': return (
        <div>
          <SectionHeader title="Chump Change Game" />
           <Card className="!p-0">
             <InputContainer title="Players">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                 {[...allWorkers, {rowId: 'user-self', name: userName}].filter((v,i,a)=>a.findIndex(t=>(t.name === v.name))===i) // Unique players
                 .map(member => (
                    <Button type="button" size="sm" variant={formData.chumpGame?.players.some(p => p.name === member.name) ? 'primary' : 'secondary'} key={member.rowId} onClick={() => {
                      const isPlaying = formData.chumpGame?.players.some(p => p.name === member.name);
                      const newPlayers = isPlaying 
                        ? (formData.chumpGame?.players || []).filter(p => p.name !== member.name)
                        : [...(formData.chumpGame?.players || []), { name: member.name, isUser: member.name === userName }];
                      handleChumpGameChange('players', newPlayers);
                    }}>
                      {member.name}
                    </Button>
                 ))}
               </div>
             </InputContainer>
            <InputContainer title="The Pot">
                <div className="flex justify-end items-center -mt-4 mb-2">
                    <Button type="button" variant="icon" size="sm" onClick={() => setChumpInputMode(p => p === 'total' ? 'breakdown' : 'total')}><ArrowUturnLeftIcon className="w-4 h-4" /> Switch Input</Button>
                </div>
                {chumpInputMode === 'total' ? (
                    <Input label="" type="number" step="0.01" prefix="$" value={formData.chumpGame?.pot ?? ''} onChange={e => handleChumpGameChange('pot', e.target.value === '' ? 0 : parseFloat(e.target.value))} />
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Coins" type="number" step="0.01" prefix="$" value={formData.chumpGame?.coins ?? ''} onChange={e => handleChumpGameChange('coins', e.target.value === '' ? 0 : parseFloat(e.target.value))} />
                        <Input label="Cash" type="number" step="0.01" prefix="$" value={formData.chumpGame?.cash ?? ''} onChange={e => handleChumpGameChange('cash', e.target.value === '' ? 0 : parseFloat(e.target.value))} />
                    </div>
                )}
                 <p className="text-right text-sm mt-2">Total Pot: <span className="font-semibold">{formatCurrency(chumpPot)}</span></p>
           </InputContainer>
            <InputContainer title="Winner">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(formData.chumpGame?.players || []).map(player => (
                        <Button type="button" size="sm" key={player.name} variant={formData.chumpGame?.winnerName === player.name ? 'primary' : 'secondary'} onClick={() => handleChumpGameChange('winnerName', player.name)}>
                            {player.name}
                        </Button>
                    ))}
                </div>
            </InputContainer>
           </Card>
        </div>
      );
      case 'workers': {
          const bartenderTable = formData.teamOnShift?.['Bartender'];
          const otherPositions = positions.filter(p => p !== 'Bartender');
          
          return (
             <div className="space-y-8">
                <SectionHeader title="Workers"/>
                
                <Card>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-dark-text-secondary mb-3">Quick Add</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {otherPositions.map(pos => {
                            const count = positionWorkerCounts[pos] || 0;
                            const hasTable = !!formData.teamOnShift?.[pos];
                            return (
                                <div key={pos} className={`p-3 rounded-lg flex flex-col items-center justify-center text-center ${getPositionColor(pos)}`}>
                                    <h4 className="font-bold text-sm">{pos}</h4>
                                    <div className="flex items-center my-2">
                                        <Button type="button" variant="icon" size="sm" onClick={() => setPositionWorkerCounts(p => ({...p, [pos]: Math.max(0, (p[pos] || 0) - 1)}))}><MinusIcon className="w-4 h-4"/></Button>
                                        <Input label="" type="number" value={count} onChange={e => setPositionWorkerCounts(p => ({...p, [pos]: parseInt(e.target.value, 10) || 0}))} className="w-12 text-center !p-1 mx-1"/>
                                        <Button type="button" variant="icon" size="sm" onClick={() => setPositionWorkerCounts(p => ({...p, [pos]: (p[pos] || 0) + 1}))}><PlusIcon className="w-4 h-4"/></Button>
                                    </div>
                                    <Button type="button" size="sm" variant="secondary" onClick={() => handleLaunchWorkerGroup(pos)} disabled={hasTable || count === 0}>
                                        {hasTable ? 'Table Added' : 'Add Details'}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                 </Card>

                {Object.entries(formData.teamOnShift || {}).map(([position, workers]) => {
                const pos = position as Position;
                const mode = positionViewModes[pos] || 'view';
                const totalHours = workers.reduce((acc, worker) => acc + calculateDurationHours(formData.date, worker.startTime, worker.endTime), 0);
                
                if (mode === 'collapsed') {
                    return (
                        <Card key={pos} className="!p-3">
                           <div className="flex items-center justify-between">
                                <div onClick={() => handleSetPositionViewMode(pos, 'view')} className="cursor-pointer">
                                    <h3 className="font-bold text-lg">{pos}</h3>
                                    <p className="text-xs text-dark-text-secondary">{workers.length} worker(s), {totalHours.toFixed(2)} total hours</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button type="button" variant="icon" size="sm" onClick={() => handleSetPositionViewMode(pos, 'view')}><PencilIcon className="w-4 h-4" /></Button>
                                </div>
                           </div>
                        </Card>
                    )
                }
                
                return (
                  <Card key={pos}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-lg">{pos}</h3>
                            <p className="text-xs text-dark-text-secondary">{workers.length} worker(s), {totalHours.toFixed(2)} total hours</p>
                        </div>
                        <div className="flex items-center space-x-1">
                            {mode === 'edit' && <Button type="button" variant="icon" size="sm" onClick={() => handleSetPositionViewMode(pos, 'view')}><ListBulletIcon className="w-4 h-4" /></Button>}
                            {mode === 'view' && <Button type="button" variant="icon" size="sm" onClick={() => handleSetPositionViewMode(pos, 'edit')}><PencilIcon className="w-4 h-4" /></Button>}
                            <Button type="button" variant="icon" size="sm" onClick={() => handleSetPositionViewMode(pos, 'collapsed')}><ChevronDownIcon className="w-5 h-5" /></Button>
                        </div>
                    </div>

                    {mode === 'edit' && (
                        <div>
                            {workers.map((member, index) => (
                               <div key={member.rowId} className={`grid ${pos === 'Bartender' ? 'grid-cols-[3fr,2fr,2fr,2fr,auto]' : 'grid-cols-[3fr,2fr,2fr,auto]'} gap-x-2 items-start mt-2`}>
                                    <Combobox
                                        label="Worker"
                                        items={coworkers.filter(c => c.positions.includes(pos))}
                                        selected={coworkers.find(c => c.id === member.coworkerId) || null}
                                        onSelect={(coworker) => handleUpdateWorkerInGroup(pos, index, { name: coworker.name, coworkerId: coworker.id })}
                                        onManualChange={(value) => handleUpdateWorkerInGroup(pos, index, { name: value, coworkerId: null })}
                                        initialValue={member.name}
                                        disabled={member.rowId === 'user-row'}
                                    />
                                    <TimeInput label="" value={member.startTime} onChange={val => handleUpdateWorkerInGroup(pos, index, { startTime: val })} />
                                    <TimeInput label="" value={member.endTime} onChange={val => handleUpdateWorkerInGroup(pos, index, { endTime: val })} />
                                    {pos === 'Bartender' ? (
                                        <SelectCombobox 
                                            label="" 
                                            items={locations} 
                                            selected={member.location} 
                                            onSelect={(val) => handleUpdateWorkerInGroup(pos, index, { location: val as Location })}
                                            onKeyDown={(e) => handleWorkerKeyDown(e, pos, index)}
                                        />
                                    ) : (
                                       // This empty div keeps the grid alignment correct when there's no location
                                       <div onKeyDown={(e) => handleWorkerKeyDown(e as any, pos, index)} tabIndex={-1}></div>
                                    )}
                                    <Button type="button" variant="icon" onClick={() => handleRemoveWorkerFromGroup(pos, index)} className="mt-1" disabled={member.rowId === 'user-row'}>
                                        <XCircleIcon className="w-5 h-5" />
                                    </Button>
                               </div>
                            ))}
                             <Button type="button" variant="secondary" onClick={() => handleAddWorkerToGroup(pos)} className="w-full mt-4">
                                <PlusIcon className="w-5 h-5 mr-2" /> Add {pos}
                            </Button>
                        </div>
                    )}

                    {mode === 'view' && (
                        <div className="space-y-2">
                          {workers.map(member => {
                             const memberHours = calculateDurationHours(formData.date, member.startTime, member.endTime);
                             return (
                                <div key={member.rowId} className="p-2 bg-zinc-900/50 rounded-lg flex justify-between items-center">
                                    <div className="flex items-center">
                                        <Avatar name={member.name} imageUrl={coworkers.find(c => c.id === member.coworkerId)?.avatarUrl} size="md" />
                                        <p className="font-semibold ml-3">{member.name}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      {pos === 'Bartender' && member.location && <Badge className={getLocationColor(member.location)}>{member.location}</Badge>}
                                      <div className="text-right">
                                        <p className="text-sm font-mono">{formatTimeForDisplay(member.startTime)} - {formatTimeForDisplay(member.endTime)}</p>
                                        <p className="text-xs text-dark-text-secondary">{memberHours.toFixed(2)} hrs</p>
                                      </div>
                                    </div>
                                </div>
                             )
                          })}
                        </div>
                    )}
                  </Card>
                )
              })}
            </div>
          );
      }
      case 'parties': return (
        <div>
            <SectionHeader title="Private Parties" />
            <Card>
              <div className="space-y-3">
                {(formData.parties || []).length > 0 ? (
                  formData.parties!.map(p => (
                    <div key={p.id} className="p-3 bg-zinc-900/50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{p.name} <span className="text-xs font-normal text-dark-text-secondary">({p.size} guests)</span></p>
                        <p className="text-xs text-dark-text-secondary">{p.type} @ {p.location} ({p.time.start} - {p.time.end})</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button type="button" variant="icon" size="sm" onClick={() => {setEditingParty(p); setIsPartyModalOpen(true)}}><PencilIcon className="w-4 h-4" /></Button>
                        <Button type="button" variant="icon" size="sm" onClick={() => setFormData(prev => ({...prev, parties: prev.parties!.filter(party => party.id !== p.id)}))}><TrashIcon className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-dark-text-secondary py-4">No private parties logged for this shift.</p>
                )}
              </div>
               <Button type="button" variant="secondary" onClick={() => {setEditingParty(null); setIsPartyModalOpen(true);}} className="w-full mt-4">
                 <PlusIcon className="w-5 h-5 mr-2" /> Add Private Party
               </Button>
            </Card>
        </div>
      );
      case 'notes': return (
        <div>
            <SectionHeader title="Shift Notes" />
            <Card>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={12}
                className="w-full bg-dark-card border border-dark-border rounded-md shadow-sm p-3 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                placeholder="Add any notes about the shift..."
              ></textarea>
            </Card>
        </div>
      );
      default: return <Card><p className="text-center">Select a section from the sidebar to edit shift details.</p></Card>;
    }
  };
  
  const navItems = [
    { id: 'core', label: 'Core Info', icon: ClockIcon },
    { id: 'workers', label: 'Workers', icon: UsersIcon },
    { id: 'parties', label: 'Private Parties', icon: GiftIcon },
    { id: 'notes', label: 'Notes', icon: DocumentTextIcon },
  ];

  const earningsNavItems = [
    { id: 'tips', label: 'Tips', icon: BanknotesIcon, value: (formData.tips || 0) - (formData.tipOut || 0) },
    { id: 'wage', label: 'Wage', icon: CurrencyDollarIcon, value: baseWage },
    { id: 'chump', label: 'Chump', icon: SparklesIcon, value: formData.chumpGame?.winnerName === userName ? chumpPot : 0 },
  ];

  const differentialNavItems = [
    { id: 'overtime', label: 'Overtime', icon: ClockIcon, value: formData.differentials?.overtime || 0 },
    { id: 'roleDifferential', label: 'Role', icon: StarIcon, value: roleDifferentialBonus },
    { id: 'tipDifferential', label: 'Tip', icon: PlusCircleIcon, value: totalTipDifferential },
    { id: 'consideration', label: 'Consideration', icon: ArrowsRightLeftIcon, value: totalConsideration },
  ];

  const isDifferentialSectionActive = ['consideration', 'tipDifferential', 'roleDifferential', 'overtime'].includes(activeSection);

  return (
    <form ref={ref} onSubmit={handleSubmit} noValidate className="animate-fade-in">
      
      {apiError && <p className="text-red-400 text-sm text-center mb-4 bg-red-900/20 p-3 rounded-md">{apiError}</p>}

      <div className="flex flex-col md:flex-row md:space-x-8">
        {/* Left Sidebar */}
        <aside className="md:w-1/4 lg:w-1/5 mb-6 md:mb-0">
          <div className="sticky top-28 bg-dark-card rounded-lg p-3">
            <div className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id as Section)}
                  className={`w-full flex items-center p-2 rounded-md text-left transition-colors duration-150 text-sm ${
                    activeSection === item.id
                      ? 'bg-brand-secondary text-white'
                      : 'text-dark-text-secondary hover:bg-dark-border hover:text-dark-text'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {Object.keys(errors).includes(item.id) && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-dark-border">
              <div>
                <button
                  type="button"
                  onClick={() => setIsEarningsGroupOpen(prev => !prev)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors duration-150 text-sm font-semibold
                    ${isEarningsGroupOpen ? 'text-dark-text' : 'text-dark-text-secondary hover:bg-dark-border hover:text-dark-text'}
                  `}
                >
                  <span className="text-xs uppercase tracking-wider">Earnings</span>
                  <div className="flex items-center">
                    {!isEarningsGroupOpen && (
                      <span className="font-mono text-xs font-bold text-emerald-400">{formatCurrency(totalEarnings)}</span>
                    )}
                    <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform duration-200 ${isEarningsGroupOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {isEarningsGroupOpen && (
                  <div className="pt-2 space-y-1">
                    {earningsNavItems.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSection(item.id as Section)}
                        className={`w-full flex items-center p-2 rounded-md text-left transition-colors duration-150 text-sm ${
                          activeSection === item.id
                            ? 'bg-brand-secondary text-white'
                            : 'text-dark-text-secondary hover:bg-dark-border hover:text-dark-text'
                        }`}
                      >
                         <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                         <span className="flex-grow">{item.label}</span>
                         <span className={`font-mono text-xs ml-2 ${activeSection === item.id ? 'text-white' : 'text-emerald-400'}`}>{formatCurrency(item.value)}</span>
                      </button>
                    ))}

                    {/* Differential Collapsible Group */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setIsDifferentialGroupOpen(prev => !prev)}
                        className={`w-full flex items-center p-2 rounded-md text-left transition-colors duration-150 text-sm ${
                          isDifferentialSectionActive
                            ? 'bg-brand-secondary text-white'
                            : 'text-dark-text-secondary hover:bg-dark-border hover:text-dark-text'
                        }`}
                      >
                        <PlusCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="flex-grow">Differential</span>
                        <div className="flex items-center ml-2">
                           {!isDifferentialGroupOpen && <span className={`font-mono text-xs ${isDifferentialSectionActive ? 'text-white' : 'text-emerald-400'}`}>{formatCurrency(totalDifferential)}</span>}
                          <ChevronDownIcon className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform duration-200 ${isDifferentialGroupOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {isDifferentialGroupOpen && (
                        <div className="pl-4 mt-1 space-y-1">
                          {differentialNavItems.map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setActiveSection(item.id as Section)}
                              className={`w-full flex items-center p-2 rounded-md text-left transition-colors duration-150 text-sm ${
                                activeSection === item.id
                                  ? 'bg-brand-accent text-white'
                                  : 'text-dark-text-secondary hover:bg-dark-border hover:text-dark-text'
                              }`}
                            >
                               <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                               <span className="flex-grow">{item.label}</span>
                               <span className={`font-mono text-xs ml-2 ${activeSection === item.id ? 'text-white' : 'text-emerald-400'}`}>{formatCurrency(item.value)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-right px-3 border-t border-dark-border pt-2">
                      <p className="text-xs text-dark-text-secondary">Total Earnings</p>
                      <p className="font-bold text-lg text-emerald-400">{formatCurrency(totalEarnings)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:w-3/4 lg:w-4/5">
          <div className="animate-fade-in">
            {renderSectionContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      {isPartyModalOpen && <PartyFormModal party={editingParty} shiftDate={formData.date} onSave={handleSaveParty} onCancel={() => setIsPartyModalOpen(false)} />}
      {isConsiderationModalOpen && <ConsiderationEventModal event={editingConsideration} onSave={handleSaveConsideration} onCancel={() => {setIsConsiderationModalOpen(false); setEditingConsideration(null);}} />}
      {isTipDiffModalOpen && <TipDifferentialEventModal event={editingTipDiff} onSave={handleSaveTipDiff} onCancel={() => {setIsTipDiffModalOpen(false); setEditingTipDiff(null);}} />}
    </form>
  );
});
ShiftForm.displayName = 'ShiftForm';

export default ShiftForm;