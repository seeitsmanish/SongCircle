import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Disc2, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

const ROOMS_PER_PAGE = 8;

export function BrowseRooms() {
    const { rooms } = useStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE);
    const paginatedRooms = filteredRooms.slice(
        (currentPage - 1) * ROOMS_PER_PAGE,
        currentPage * ROOMS_PER_PAGE
    );

    return (
        <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-6 rounded-lg">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold">Browse Rooms</h2>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                        placeholder="Search rooms..."
                        className="w-full p-2 pl-10 bg-background/60 border border-primary/20 rounded focus:border-primary/50 focus:outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
            </div>

            <div className="grid gap-3">
                {paginatedRooms.length > 0 ? (
                    <>
                        {paginatedRooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => navigate(`/room/${room.id}`)}
                                className="flex items-center gap-3 p-4 bg-background/60 border border-primary/20 rounded cursor-pointer hover:bg-primary/10 group"
                            >
                                <Disc2 className="w-6 h-6 text-primary" />
                                <div>
                                    <h3 className="font-medium">{room.name}</h3>
                                    <p className="text-sm text-gray-400">
                                        {room.queue.length} tracks in queue
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded ${currentPage === page
                                                ? 'bg-primary text-white'
                                                : 'bg-background/60 hover:bg-primary/10'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-gray-400 text-center py-8">No rooms found</p>
                )}
            </div>
        </div>
    );
}