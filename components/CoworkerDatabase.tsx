import React, { useState } from 'react';
import { Coworker } from '../types';
import { useCoworkers } from '../hooks/useCoworkers';
import { PencilIcon, PlusIcon, TrashIcon, UsersIcon, ShieldCheckIcon } from './Icons';
import Button from './ui/Button';
import CoworkerForm from './CoworkerForm';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import { getPositionColor } from '../utils/color';

const CoworkerDatabase: React.FC = () => {
  const { coworkers, loading, error, addCoworker, updateCoworker, deleteCoworker } = useCoworkers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoworker, setSelectedCoworker] = useState<Coworker | null>(null);

  const handleEdit = (coworker: Coworker) => {
    setSelectedCoworker(coworker);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCoworker(null);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setSelectedCoworker(null);
    setIsFormOpen(false);
  };

  const handleSaveCoworker = async (coworkerData: Coworker) => {
    // If we're setting this coworker as the user, ensure no others are set.
    if (coworkerData.isUser) {
        const currentUser = coworkers.find(c => c.isUser && c.id !== coworkerData.id);
        if (currentUser) {
            // Unset the old user first. Wait for this to complete.
            await updateCoworker({ ...currentUser, isUser: false });
        }
    }

    if (selectedCoworker) {
      await updateCoworker(coworkerData);
    } else {
      await addCoworker(coworkerData);
    }
    // The parent component will throw an error on failure, which the form will catch and display.
    // We only close the form on success.
    setIsFormOpen(false);
    setSelectedCoworker(null);
  };

  if (isFormOpen) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 h-full">
        <CoworkerForm
          coworker={selectedCoworker}
          onSave={handleSaveCoworker}
          onCancel={handleCancelForm}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-dark-border">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-accent tracking-tight">
          Coworker Database
        </h1>
        <Button onClick={handleAddNew}>
          <PlusIcon className="w-5 h-5 mr-0 sm:mr-2" />
          <span className="hidden sm:inline">New Coworker</span>
        </Button>
      </header>

      <main>
        {loading && <p className="text-center text-dark-text-secondary py-10">Loading coworkers...</p>}
        {error && <p className="text-center text-red-400 py-10">{error}</p>}
        
        {!loading && !error && coworkers.length === 0 && (
           <div className="text-center py-16 bg-dark-card rounded-lg">
             <UsersIcon className="mx-auto w-12 h-12 text-dark-text-secondary" />
             <h2 className="mt-4 text-xl font-semibold text-dark-text">No Coworkers Found</h2>
             <p className="text-dark-text-secondary mt-2">Click "New Coworker" to add your first entry.</p>
           </div>
        )}

        {!loading && !error && coworkers.length > 0 && (
           <div className="bg-dark-card shadow-lg rounded-lg overflow-hidden">
             {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Positions</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">ID</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {coworkers.map((cw) => (
                    <tr key={cw.id} className="border-b border-dark-border last:border-b-0 hover:bg-zinc-700/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <Avatar name={cw.name} imageUrl={cw.avatarUrl} size="md" />
                            <div className="ml-4">
                                <div className="text-sm font-medium text-dark-text flex items-center">
                                    {cw.name}
                                    {cw.manager && <ShieldCheckIcon className="w-4 h-4 text-brand-accent ml-2"><title>Manager</title></ShieldCheckIcon>}
                                    {cw.isUser && <Badge className="ml-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">You</Badge>}
                                </div>
                                <div className="text-sm text-dark-text-secondary">{cw.firstName} {cw.lastName}</div>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {cw.positions.map(pos => <Badge key={pos} className={getPositionColor(pos)}>{pos}</Badge>)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-dark-text-secondary">{cw.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button onClick={() => handleEdit(cw)} variant="icon" size="sm" aria-label="Edit coworker"><PencilIcon className="w-4 h-4" /></Button>
                        <Button onClick={() => deleteCoworker(cw.id)} variant="icon" size="sm" aria-label="Delete coworker"><TrashIcon className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
             {/* Mobile Cards */}
            <div className="md:hidden">
              <ul>
                {coworkers.map((cw) => (
                  <li key={cw.id} className="p-4 border-b border-dark-border last:border-b-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Avatar name={cw.name} imageUrl={cw.avatarUrl} size="md" />
                            <div className="ml-4">
                                <div className="text-sm font-medium text-dark-text flex items-center">
                                  {cw.name}
                                  {cw.manager && <ShieldCheckIcon className="w-4 h-4 text-brand-accent ml-2"><title>Manager</title></ShieldCheckIcon>}
                                  {cw.isUser && <Badge className="ml-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">You</Badge>}
                                </div>
                                <div className="text-sm text-dark-text-secondary">{cw.firstName} {cw.lastName}</div>
                            </div>
                        </div>
                        <div className="flex space-x-1">
                            <Button onClick={() => handleEdit(cw)} variant="icon" size="sm" aria-label="Edit coworker"><PencilIcon className="w-4 h-4" /></Button>
                            <Button onClick={() => deleteCoworker(cw.id)} variant="icon" size="sm" aria-label="Delete coworker"><TrashIcon className="w-4 h-4" /></Button>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1">
                        {cw.positions.map(pos => <Badge key={pos} className={getPositionColor(pos)}>{pos}</Badge>)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default CoworkerDatabase;