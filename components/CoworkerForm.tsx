import React, { useState, useEffect } from 'react';
import { Coworker, Position } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import Checkbox from './ui/Checkbox';
import Avatar from './ui/Avatar';
import { useSettings } from '../hooks/useSettings';

interface CoworkerFormProps {
  coworker: Coworker | null;
  onSave: (coworker: Coworker) => Promise<void>;
  onCancel: () => void;
}

type FormState = Omit<Coworker, 'positions'> & { positions: Set<Position> };

const CoworkerForm: React.FC<CoworkerFormProps> = ({ coworker, onSave, onCancel }) => {
  const { positions: availablePositions } = useSettings();
  const [formData, setFormData] = useState<FormState>({
    id: '',
    name: '',
    firstName: '',
    lastName: '',
    positions: new Set(),
    manager: false,
    isUser: false,
    avatarUrl: undefined,
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (coworker) {
      setFormData({
        id: coworker.id,
        name: coworker.name,
        firstName: coworker.firstName,
        lastName: coworker.lastName,
        positions: new Set(coworker.positions),
        manager: coworker.manager,
        isUser: coworker.isUser || false,
        avatarUrl: coworker.avatarUrl,
      });
      setAvatarPreview(coworker.avatarUrl);
    }
  }, [coworker]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked as boolean }));
  }
  
  const handlePositionChange = (position: Position) => {
      setFormData(prev => {
          const newPositions = new Set(prev.positions);
          if (newPositions.has(position)) {
              newPositions.delete(position);
          } else {
              newPositions.add(position);
          }
          return { ...prev, positions: newPositions };
      })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setFormData(prev => ({ ...prev, avatarUrl: base64String }));
            setAvatarPreview(base64String);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.firstName || !formData.lastName) {
        setError('Please fill in all required fields.');
        return;
    }
     if (formData.positions.size === 0) {
        setError('Please select at least one position.');
        return;
    }
    setError('');
    setIsSubmitting(true);
    try {
        await onSave({ ...formData, positions: Array.from(formData.positions) });
    } catch(err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const isFormValid = formData.id && formData.name && formData.firstName && formData.lastName && formData.positions.size > 0;

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6 text-brand-accent">
        {coworker ? 'Edit Coworker' : 'Add New Coworker'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="flex items-center space-x-6 p-4 bg-gray-900/30 rounded-lg">
            <Avatar name={formData.name || '?'} imageUrl={avatarPreview} size="lg" />
            <div>
                <label htmlFor="avatar-upload" className="cursor-pointer font-semibold text-brand-accent hover:text-brand-secondary">
                    Upload Photo
                </label>
                <input id="avatar-upload" type="file" className="hidden" onChange={handleAvatarChange} accept="image/png, image/jpeg, image/gif" />
                <p className="text-xs text-dark-text-secondary mt-1">PNG, JPG, or GIF.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Input
            label="Employee ID"
            name="id"
            value={formData.id}
            onChange={handleChange}
            required
            disabled={!!coworker}
          />
           <Input
            label="Display Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
           <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">Positions</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-800/50 rounded-lg">
                {availablePositions.map(pos => (
                    <Checkbox
                        key={pos}
                        label={pos}
                        name="positions"
                        checked={formData.positions.has(pos)}
                        onChange={() => handlePositionChange(pos)}
                    />
                ))}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">Settings</label>
             <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
                <Checkbox
                    label="Manager capabilities"
                    name="manager"
                    checked={formData.manager}
                    onChange={handleCheckboxChange}
                />
                <Checkbox
                    label="This is me (the primary user of this app)"
                    name="isUser"
                    checked={formData.isUser || false}
                    onChange={handleCheckboxChange}
                />
            </div>
        </div>
        
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <div className="flex justify-end items-center space-x-4 pt-4 border-t border-dark-border">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? 'Saving...' : (coworker ? 'Update Coworker' : 'Save Coworker')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CoworkerForm;