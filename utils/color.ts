import { Position, Location } from '../types';

// Tailwind-friendly colors for default avatars
const avatarColors = [
    'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
    'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-fuchsia-500', 'bg-teal-500', 'bg-cyan-500',
];

/**
 * Generates a consistent background color class from a string (e.g., a name).
 * @param name - The string to hash into a color index.
 * @returns A Tailwind CSS background color class string.
 */
export const getAvatarColor = (name: string): string => {
    if (!name) return avatarColors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % avatarColors.length);
    return avatarColors[index];
};


// Color mapping for position badges
const positionColorMap: Record<string, string> = {
    Bartender: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
    Server: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    Door: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
    Expo: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    Hostess: 'bg-purple-500/10 text-purple-300 border border-purple-500/20',
    Busser: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
};

/**
 * Gets the corresponding Tailwind CSS classes for a given position.
 * @param position - The coworker's position.
 * @returns A string of Tailwind classes for styling the badge.
 */
export const getPositionColor = (position: Position): string => {
    return positionColorMap[position] || positionColorMap.Busser;
};


// Color mapping for location badges
const locationColorMap: Record<string, string> = {
    deck: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
    main: 'bg-teal-500/10 text-teal-300 border border-teal-500/20',
    upstairs: 'bg-violet-500/10 text-violet-300 border border-violet-500/20',
};

/**
 * Gets the corresponding Tailwind CSS classes for a given location.
 * @param location - The location.
 * @returns A string of Tailwind classes for styling the badge.
 */
export const getLocationColor = (location: Location | ''): string => {
    return location ? locationColorMap[location] : '';
};