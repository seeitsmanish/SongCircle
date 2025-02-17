import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Disc2, ArrowRight } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useStore } from '../store/useStore';

const ROOMS_PER_PAGE = 10;

export function YourRooms() {
    const { user } = useUser();
    const { rooms } = useStore();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = React.useState(1);

    const yourRooms = rooms.filter(room => room.createdBy === user?.id);
    const totalPages = Math.ceil(yourRooms.length / ROOMS_PER_PAGE);

    const paginatedRooms = yourRooms.slice(
        (currentPage - 1) * ROOMS_PER_PAGE,
        currentPage * ROOMS_PER_PAGE
    );

    return (
        <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <History className="w-5 h-5" /> Your Rooms
            </h2>
            <div className="space-y-2">
                {paginatedRooms.length > 0 ? (
                    <>
                        {paginatedRooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => navigate(`/room/${room.id}`)}
                                className="flex items-center gap-3 p-3 bg-background/60 border border-primary/20 rounded cursor-pointer hover:bg-primary/10 group"
                            >
                                <Disc2 className="w-5 h-5 text-primary" />
                                <span>{room.name}</span>
                                <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
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
                    <p className="text-gray-400">No rooms created yet</p>
                )}
            </div>
        </div>
    );
}