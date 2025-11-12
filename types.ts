

export interface CoworkerShift {
  // A unique ID for the row itself, for React keys
  rowId: string;
  // Can be null if it's the main user ("Ian") who might not be in the DB
  coworkerId: string | null;
  // Name is stored directly to simplify things, especially for "Ian"
  name: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: Location | '';
}

export interface PrivateParty {
  id: string;
  name: string;
  type: PartyType;
  cutType: PartyCutType;
  location: PartyLocation;
  time: PartyTime;
  size: number;
  packages: PartyPackages;
}

export interface PartyTime {
  start: string; // HH:MM
  end: string; // HH:MM
  duration: number; // in hours
}

export interface PartyPackages {
  drink: string;
  food: string;
}

export interface ChumpGamePlayer {
  name: string;
  isUser: boolean; // To easily identify the user
}

export interface ChumpGame {
  players: ChumpGamePlayer[];
  pot: number;
  coins?: number;
  cash?: number;
  winnerName: string | null;
}

// --- New Differential Types ---
export interface ConsiderationEvent {
  id: string;
  amount: number;
  person: string;
  reason: string;
  note?: string;
}

export interface TipDifferentialEvent {
  id: string;
  amount: number;
  note?: string;
}

export interface Differentials {
  consideration: {
    total: number;
    events: ConsiderationEvent[];
  };
  tip: {
    total: number;
    events: TipDifferentialEvent[];
  };
  role: {
    hourlyBonus: number;
    flatBonus: number;
  };
  overtime: number;
}

export interface Shift {
  id: string; // Unique ID, typically the date in YYYY-MM-DD format
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  tips?: number;
  duration: number;
  tipsPerHour?: number;
  notes?: string;
  tipOut?: number;
  cashTips?: number;
  creditTips?: number;
  teamOnShift?: Partial<Record<Position, CoworkerShift[]>>;
  parties?: PrivateParty[];
  // Wage related
  hourlyRate?: number;
  wageStartTime?: string;
  wageEndTime?: string;
  wage?: number; // This will be the calculated total of base wage
  // Differential related
  differentials?: Differentials;
  differential?: number; // This will be the calculated total of all differentials
  // Chump related
  chump?: number;
  chumpGame?: ChumpGame;
}

// Positions and Locations are now managed in Settings
export type Position = string;
export type Location = string;


export const PARTY_TYPES = ['wedding', 'corporate', 'birthday', 'holiday', 'other'] as const;
export type PartyType = typeof PARTY_TYPES[number];

export const PARTY_LOCATIONS = ['deck', 'main', 'upstairs', 'full venue'] as const;
export type PartyLocation = typeof PARTY_LOCATIONS[number];

export const PARTY_CUT_TYPES = ['day', 'night', 'event'] as const;
export type PartyCutType = typeof PARTY_CUT_TYPES[number];

export interface Coworker {
  id: string; // Employee ID
  name: string; // General/official name
  firstName: string;
  lastName: string;
  positions: Position[];
  manager: boolean;
  isUser?: boolean; // To identify which coworker is the primary user
  avatarUrl?: string; // For base64 image URL
}