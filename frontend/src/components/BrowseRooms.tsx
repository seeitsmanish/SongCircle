import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Disc2, ArrowRight, Users, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import type { Room } from '../types';
import { RequestBuilder } from '../shared/RequestBuilder';
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ROOMS_PER_PAGE = 5;

export function BrowseRooms() {
    // const { rooms } = useStore();
    const { user, isSignedIn } = useUser();
    const navigate = useNavigate();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
    const [error, setError] = useState<string | null>(null);

    async function fetchRooms(perPage = ROOMS_PER_PAGE, page = 1) {
        setLoading(true);
        setError(null);

        if (!isSignedIn || !user) {
            navigate('/');
            return;
        }
        try {
            const data = await RequestBuilder(`${VITE_BACKEND_URL}/api/rooms?per_page=${perPage}&page=${page}&search=${debouncedSearchQuery}`);

            setRooms(data.rooms || []);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            setError('Failed to fetch rooms');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    useEffect(() => {
        if (!debouncedSearchQuery) {
            setRooms([]);
            return;
        }
        fetchRooms();
    }, [debouncedSearchQuery]);

    return (
        <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-4 md:p-6 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <h2 className="text-lg md:text-xl whitespace-nowrap font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Browse Rooms
                </h2>

                <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search rooms..."
                            className="w-full sm:w-64 p-2 pl-9 bg-background/60 border border-primary/20 rounded-lg focus:border-primary/50 focus:outline-none text-sm"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>

                </div>
            </div>

            <div className="space-y-3">
                {error ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 mx-auto mb-3 text-red-500 rounded-full bg-red-500/10 flex items-center justify-center">
                            <X className="w-6 h-6" />
                        </div>
                        <p className="text-red-400 mb-2">{error}</p>
                        <button
                            onClick={() => fetchRooms(ROOMS_PER_PAGE)}
                            className="text-primary hover:text-primary/80 text-sm"
                        >
                            Try again
                        </button>
                    </div>
                ) : loading ? (
                    <div className="grid gap-3">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-4 bg-background/40 border border-primary/10 rounded-lg animate-pulse"
                            >
                                <div className="w-6 h-6 bg-primary/20 rounded-full flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-primary/20 rounded w-1/4" />
                                    <div className="h-3 bg-primary/10 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : rooms.length > 0 ? (
                    <>
                        <div className="grid gap-3">
                            {rooms.map((room) => (
                                <div
                                    key={room.name}
                                    onClick={() => navigate(`/room/${room.name?.toLowerCase()}`)}
                                    className="flex items-center gap-3 p-4 bg-background/60 border border-primary/20 rounded-lg cursor-pointer hover:bg-primary/10 group transition-colors"
                                >
                                    <Disc2 className="w-6 h-6 text-primary flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{room.name}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span>{room.queue?.length || 0} tracks in queue</span>
                                            {room.currentTrack && (
                                                <span className="text-green-400">• Now playing</span>
                                            )}
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    </>
                ) : debouncedSearchQuery ? (
                    <div className="text-center py-12">
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-400 mb-2">No rooms found matching "{debouncedSearchQuery}"</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-primary hover:text-primary/80 text-sm"
                        >
                            Clear search
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-400 mb-2">Start by searching for rooms</p>
                    </div>
                )}
            </div>
        </div>
    );
}