import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Disc2, ArrowRight, ChevronLeft, ChevronRight, Filter, X, Users } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import type { Room } from '../types';
import { RequestBuilder } from '../shared/RequestBuilder';
import { AxiosError } from 'axios';
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ROOMS_PER_PAGE = 4;

export function YourRooms() {
    const { user, isSignedIn } = useUser();
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: ROOMS_PER_PAGE,
        nextPage: false,
        prevPage: false,
        total: 0,
    })
    const navigate = useNavigate();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
    const [sortBy, setSortBy] = useState<'recent' | 'name' | 'queue'>('name');

    async function fetchRooms(perPage = ROOMS_PER_PAGE, page = 1) {
        setLoading(true);
        setError(null);

        if (!isSignedIn || !user) {
            // If not signed in, redirect to home/login
            navigate('/');
            return;
        }
        try {
            const data = await RequestBuilder(`${VITE_BACKEND_URL}/api/rooms?per_page=${perPage}&page=${page}&search=${debouncedSearchQuery}&for_user=true`);
            setRooms(data.rooms || []);
            setPagination(data.pagination);
        } catch (err) {
            console.log(err);
            if (err instanceof AxiosError) {
                setError(err.response?.data.message || 'Failed to fetch your rooms');
            } else {
                setError('Failed to fetch your rooms');
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
            setPagination((p) => ({ ...p, page: 1 }));
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        fetchRooms(ROOMS_PER_PAGE, pagination.page);
    }, [debouncedSearchQuery, pagination.page, sortBy]);

    return (
        <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-4 md:p-6 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <h2 className="text-lg md:text-xl whitespace-nowrap font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Your Rooms ({pagination.total})
                </h2>

                <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search your rooms by slug..."
                            className="w-full sm:w-64 p-2 pl-9 bg-background/60 border border-primary/20 rounded-lg focus:border-primary/50 focus:outline-none text-sm"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>

                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'queue')}
                            className="w-full sm:w-auto p-2 pl-8 pr-8 bg-background/60 border border-primary/20 rounded-lg focus:border-primary/50 focus:outline-none text-sm appearance-none cursor-pointer"
                        >
                            <option value="recent">Most Recent</option>
                            <option value="name">Name A-Z</option>
                            <option value="queue">Most Active</option>
                        </select>
                        <Filter className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
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
                        <button onClick={() => fetchRooms(ROOMS_PER_PAGE, pagination.page)} className="text-primary hover:text-primary/80 text-sm">
                            Try again
                        </button>
                    </div>
                ) : loading ? (
                    <div className="grid gap-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-background/40 border border-primary/10 rounded-lg animate-pulse">
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
                                            {room.currentTrack && <span className="text-green-400">• Now playing</span>}
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                            <button
                                onClick={() => {
                                    if (pagination.prevPage)
                                        setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
                                }}
                                disabled={pagination.prevPage === false}
                                className="flex items-center gap-1 px-3 py-2 text-sm bg-background/60 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </button>

                            <button
                                onClick={() => {
                                    if (pagination.nextPage)
                                        setPagination((p) => ({ ...p, page: p.page + 1 }))
                                }}
                                disabled={pagination.nextPage === false}
                                className="flex items-center gap-1 px-3 py-2 text-sm bg-background/60 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-400 mb-2">You haven't created any public rooms yet</p>
                        <p className="text-sm text-gray-500">Create a room to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
