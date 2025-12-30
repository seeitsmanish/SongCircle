import React, { useState, useMemo } from 'react';
import { Plus, ArrowRight, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface ValidationRule {
    id: string;
    label: string;
    test: (value: string) => boolean;

}

export function CreateRoomForm() {
    const { user, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [newRoomName, setNewRoomName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validationRules: ValidationRule[] = [
        {
            id: 'length',
            label: 'Between 3-30 characters',
            test: (value) => value.length >= 3 && value.length <= 30
        },
        {
            id: 'alphanumeric',
            label: 'Only letters, numbers, and hyphens(no trailing or leading or consecutive)',
            test: (value) => /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/.test(value)
        },
        {
            id: 'noSpaces',
            label: 'No spaces allowed',
            test: (value) => !value.includes(' ')
        },
    ];

    const validationResults = useMemo(() => {
        return validationRules.map(rule => ({
            ...rule,
            satisfied: rule.test(newRoomName)
        }));
    }, [newRoomName]);

    const allValidationsPassed = validationResults.every(rule => rule.satisfied);

    const handleCreateRoom = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!isSignedIn || !newRoomName.trim() || !allValidationsPassed || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            const res = await fetch(`${VITE_BACKEND_URL}/api/create-room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newRoomName?.trim()?.toLowerCase(),
                    userId: user.id
                })
            });

            const response = await res.json();
            if (!res.ok) {
                throw new Error(response?.message || 'Failed to create room');
            }

            setNewRoomName('');
            console.log('Room created successfully:', response);
            navigate(`/room/${newRoomName?.trim()?.toLowerCase()}`);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create room');
            console.error('Error creating room:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-background/40 backdrop-blur-sm border border-primary/20 p-6 rounded-lg">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Create New Room
            </h2>

            <form onSubmit={handleCreateRoom} className="space-y-5">
                <div>
                    <input
                        type="text"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="Enter room name..."
                        className="w-full p-4 bg-background/60 border border-primary/20 rounded-lg focus:border-primary/50 focus:outline-none transition-colors"
                    />
                </div>

                <div className="space-y-2 p-4 bg-background/30 rounded-lg border border-primary/10">
                    <p className="text-sm font-medium text-gray-300 mb-3">Room Name Requirements:</p>
                    {validationResults.map((rule) => (
                        <div key={rule.id} className="flex items-center gap-3 text-sm">
                            {newRoomName ? (
                                rule.satisfied ? (
                                    <Check className="w-4 h-4 text-primary/50 flex-shrink-0" />
                                ) : (
                                    <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                                )
                            ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-500 flex-shrink-0" />
                            )}
                            <span className={
                                !newRoomName ? 'text-gray-400' :
                                    rule.satisfied ? 'text-primary/80' : 'text-red-400'
                            }>
                                {rule.label}
                            </span>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!allValidationsPassed || isSubmitting}
                    className="w-full bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed py-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                >
                    {isSubmitting ? 'Creating...' : (
                        <>Create Room <ArrowRight className="w-4 h-4" /></>
                    )}
                </button>
            </form>
        </div>
    );
}