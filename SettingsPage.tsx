import React, { useState } from 'react';
import Card from './components/ui/Card';
import Input from './components/ui/Input';
import Button from './components/ui/Button';
import { useSettings } from './hooks/useSettings';
import { PlusIcon, TrashIcon } from './components/Icons';

type SettingsTab = 'RANGES' | 'ACCOUNT';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('RANGES');
    const { positions, locations, updatePositions, updateLocations } = useSettings();

    const [newPosition, setNewPosition] = useState('');
    const [newLocation, setNewLocation] = useState('');
    
    const handleAddPosition = () => {
        if (newPosition && !positions.includes(newPosition)) {
            updatePositions([...positions, newPosition]);
            setNewPosition('');
        }
    };
    
    const handleDeletePosition = (posToDelete: string) => {
        updatePositions(positions.filter(p => p !== posToDelete));
    };

    const handleAddLocation = () => {
        if (newLocation && !locations.includes(newLocation)) {
            updateLocations([...locations, newLocation]);
            setNewLocation('');
        }
    };

    const handleDeleteLocation = (locToDelete: string) => {
        updateLocations(locations.filter(l => l !== locToDelete));
    };

    const renderRangesContent = () => (
        <div className="space-y-10 animate-fade-in">
            {/* Positions Section */}
            <div>
                <h3 className="text-lg font-semibold text-dark-text">Job Positions</h3>
                <p className="text-sm text-dark-text-secondary mt-1">Manage the list of available job positions for coworkers and shift logging.</p>
                <div className="mt-4 border-t border-dark-border pt-4">
                    <ul className="space-y-2">
                        {positions.map(pos => (
                            <li key={pos} className="flex items-center justify-between p-2 bg-gray-900/40 rounded-md">
                                <span className="text-sm">{pos}</span>
                                <Button variant="icon" size="sm" onClick={() => handleDeletePosition(pos)}><TrashIcon className="w-4 h-4 text-red-500/80 hover:text-red-500"/></Button>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex items-center space-x-2">
                        <Input label="New Position Name" id="new-position" value={newPosition} onChange={e => setNewPosition(e.target.value)} />
                        <Button onClick={handleAddPosition} className="mt-auto"><PlusIcon className="w-5 h-5"/></Button>
                    </div>
                </div>
            </div>

            {/* Locations Section */}
             <div>
                <h3 className="text-lg font-semibold text-dark-text">Work Locations</h3>
                <p className="text-sm text-dark-text-secondary mt-1">Manage the list of work locations available for bartenders.</p>
                <div className="mt-4 border-t border-dark-border pt-4">
                    <ul className="space-y-2">
                        {locations.map(loc => (
                             <li key={loc} className="flex items-center justify-between p-2 bg-gray-900/40 rounded-md">
                                <span className="text-sm capitalize">{loc}</span>
                                <Button variant="icon" size="sm" onClick={() => handleDeleteLocation(loc)}><TrashIcon className="w-4 h-4 text-red-500/80 hover:text-red-500"/></Button>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex items-center space-x-2">
                        <Input label="New Location Name" id="new-location" value={newLocation} onChange={e => setNewLocation(e.target.value.toLowerCase())} />
                        <Button onClick={handleAddLocation} className="mt-auto"><PlusIcon className="w-5 h-5"/></Button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full">
            <header className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-accent tracking-tight">
                    Settings
                </h1>
            </header>
            <main>
                <Card>
                    <div className="border-b border-dark-border mb-6">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('RANGES')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'RANGES' 
                                    ? 'border-brand-accent text-brand-accent' 
                                    : 'border-transparent text-dark-text-secondary hover:text-dark-text hover:border-gray-500'
                                }`}
                            >
                                Ranges
                            </button>
                             <button
                                onClick={() => setActiveTab('ACCOUNT')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'ACCOUNT' 
                                    ? 'border-brand-accent text-brand-accent' 
                                    : 'border-transparent text-dark-text-secondary hover:text-dark-text hover:border-gray-500'
                                }`}
                            >
                                Account
                            </button>
                        </nav>
                    </div>
                    <div>
                        {activeTab === 'RANGES' && renderRangesContent()}
                        {activeTab === 'ACCOUNT' && (
                            <div className="text-center py-10 text-dark-text-secondary">
                                Account settings are not yet available.
                            </div>
                        )}
                    </div>
                </Card>
            </main>
        </div>
    );
};

export default SettingsPage;
