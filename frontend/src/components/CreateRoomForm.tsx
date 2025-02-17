import React, { useState, useCallback } from 'react';
import { Plus, ArrowRight, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useStore } from '../store/useStore';
import debounce from 'lodash.debounce';

export function CreateRoomForm() {
    const { user, isSignedIn } = useUser();
    const { createRoom } = useStore();
    const navigate = useNavigate();

    const [newRoomName, setNewRoomName] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);

    // Simulate API call to check room name availability
    const checkRoomAvailability = async (name: string) => {
        // In a real app, this would be an API call
        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                // Simple validation: room name should be 3-20 chars, alphanumeric with spaces
                const isValid = /^[a-zA-Z0-9\s]{3,20}$/.test(name);
                resolve(isValid);
            }, 500);
        });
    };

    const debouncedCheck = useCallback(
        debounce(async (name: string) => {
            if (!name) {
                setIsValid(null);
                setIsValidating(false);
                return;
            }

            setIsValidating(true);
            const valid = await checkRoomAvailability(name);
            setIsValid(valid);
            setIsValidating(false);
        }, 500),
        []
    );

    const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewRoomName(value);
        debouncedCheck(value);
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSignedIn || !newRoomName.trim() || !isValid) return;

        const room = createRoom(newRoomName, user.id);
        setNewRoomName('');
        setIsValid(null);
        navigate(`/room/${room.id}`);
    };

    return (
        <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Create Room
            </h2>
            <form onSubmit={handleCreateRoom}>
                <div className="relative">
                    <input
                        type="text"
                        value={newRoomName}
                        onChange={handleRoomNameChange}
                        placeholder="Enter room name (3-20 characters)"
                        className="w-full p-3 pr-10 mb-4 bg-background/60 border border-primary/20 rounded focus:border-primary/50 focus:outline-none"
                    />
                    {newRoomName && (
                        <div className="absolute right-3 top-3">
                            {isValidating ? (
                                <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent" />
                            ) : isValid ? (
                                <Check className="w-5 h-5 text-green-500" />
                            ) : (
                                <X className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={!isValid || isValidating}
                    className="w-full bg-primary hover:bg-primary/80 py-3 rounded-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Create Room <ArrowRight className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}