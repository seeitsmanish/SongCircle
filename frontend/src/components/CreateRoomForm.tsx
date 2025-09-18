import React, { useState, useCallback } from 'react';
import { Plus, ArrowRight, Check, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useStore } from '../store/useStore';
import debounce from 'lodash.debounce';

interface ValidationRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
  satisfied: boolean;
}

export function CreateRoomForm() {
  const { user, isSignedIn } = useUser();
  const { createRoom, rooms } = useStore();
  const navigate = useNavigate();

  const [newRoomName, setNewRoomName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [showValidations, setShowValidations] = useState(false);

  const validationRules: ValidationRule[] = [
    {
      id: 'length',
      label: 'Between 3-30 characters',
      test: (value) => value.length >= 3 && value.length <= 30,
      satisfied: newRoomName.length >= 3 && newRoomName.length <= 30
    },
    {
      id: 'alphanumeric',
      label: 'Only letters, numbers, and spaces',
      test: (value) => /^[a-zA-Z0-9\s]+$/.test(value),
      satisfied: /^[a-zA-Z0-9\s]+$/.test(newRoomName)
    },
    {
      id: 'noLeadingTrailing',
      label: 'No leading or trailing spaces',
      test: (value) => value === value.trim(),
      satisfied: newRoomName === newRoomName.trim()
    },
    {
      id: 'noMultipleSpaces',
      label: 'No consecutive spaces',
      test: (value) => !/\s{2,}/.test(value),
      satisfied: !/\s{2,}/.test(newRoomName)
    }
  ];

  const allValidationsPassed = validationRules.every(rule => rule.satisfied);

  const checkRoomAvailability = useCallback(
    debounce(async (name: string) => {
      if (!name || !allValidationsPassed) {
        setIsAvailable(null);
        setIsValidating(false);
        return;
      }

      setIsValidating(true);
      
      // Simulate API call - in real app, this would check against backend
      setTimeout(() => {
        const exists = rooms.some(room => 
          room.name.toLowerCase() === name.toLowerCase()
        );
        setIsAvailable(!exists);
        setIsValidating(false);
      }, 500);
    }, 500),
    [rooms, allValidationsPassed]
  );

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewRoomName(value);
    setShowValidations(value.length > 0);
    
    if (value.length > 0) {
      checkRoomAvailability(value);
    } else {
      setIsAvailable(null);
      setIsValidating(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !newRoomName.trim() || !allValidationsPassed || !isAvailable) return;

    const room = createRoom(newRoomName.trim(), user.id);
    setNewRoomName('');
    setShowValidations(false);
    setIsAvailable(null);
    navigate(`/room/${room.id}`);
  };

  const canSubmit = allValidationsPassed && isAvailable && !isValidating;

  return (
    <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-6 rounded-lg sticky top-6">
      <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5" /> Create New Room
      </h2>
      
      <form onSubmit={handleCreateRoom} className="space-y-5">
        <div className="relative">
          <input
            type="text"
            value={newRoomName}
            onChange={handleRoomNameChange}
            placeholder="Enter room name..."
            className="w-full p-4 pr-12 bg-background/60 border border-primary/20 rounded-lg focus:border-primary/50 focus:outline-none transition-colors text-base"
          />
          
          <div className="absolute right-4 top-4">
            {isValidating ? (
              <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent" />
            ) : newRoomName && allValidationsPassed ? (
              isAvailable ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : isAvailable === false ? (
                <X className="w-5 h-5 text-red-500" />
              ) : null
            ) : newRoomName ? (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            ) : null}
          </div>
        </div>

        {showValidations && (
          <div className="space-y-3 p-4 bg-background/30 rounded-lg border border-primary/10">
            <p className="text-sm font-medium text-gray-300 mb-3">Requirements:</p>
            {validationRules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-3 text-sm">
                {rule.satisfied ? (
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <span className={rule.satisfied ? 'text-green-400' : 'text-red-400'}>
                  {rule.label}
                </span>
              </div>
            ))}
            
            {allValidationsPassed && (
              <div className="flex items-center gap-3 text-sm pt-3 mt-3 border-t border-primary/10">
                {isValidating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent flex-shrink-0" />
                    <span className="text-gray-400">Checking availability...</span>
                  </>
                ) : isAvailable ? (
                  <>
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-green-400">Room name is available</span>
                  </>
                ) : isAvailable === false ? (
                  <>
                    <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-red-400">Room name already exists</span>
                  </>
                ) : null}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed py-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-base"
        >
          Create Room <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}