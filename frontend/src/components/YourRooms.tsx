import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Disc2, ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useStore } from '../store/useStore';

const ROOMS_PER_PAGE = 4;

export function YourRooms() {
  const { user } = useUser();
  const { rooms } = useStore();
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const yourRooms = useMemo(() => 
    rooms.filter(room => room.createdBy === user?.id),
    [rooms, user?.id]
  );

  const filteredRooms = useMemo(() => 
    yourRooms.filter(room =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [yourRooms, searchQuery]
  );

  const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE);
  const paginatedRooms = useMemo(() => 
    filteredRooms.slice(
      (currentPage - 1) * ROOMS_PER_PAGE,
      currentPage * ROOMS_PER_PAGE
    ),
    [filteredRooms, currentPage]
  );

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
          <History className="w-5 h-5" /> Your Rooms ({yourRooms.length})
        </h2>
      
        {yourRooms.length > 0 && (
          <div className="relative sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your rooms..."
              className="w-full p-2 pl-9 bg-background/60 border border-primary/20 rounded-lg focus:border-primary/50 focus:outline-none text-sm"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>

      <div>
        {paginatedRooms.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {paginatedRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => navigate(`/room/${room.id}`)}
                  className="bg-background/60 border border-primary/20 rounded-lg p-4 cursor-pointer hover:bg-primary/10 group transition-all hover:scale-105"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Disc2 className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{room.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{room.queue?.length || 0} tracks</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-background/60 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {currentPage} of {totalPages}
                  </span>
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-background/60 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 mb-2">No rooms found matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-primary hover:text-primary/80 text-sm"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <Disc2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 mb-2">No rooms created yet</p>
            <p className="text-sm text-gray-500">Create your first room above!</p>
          </div>
        )}
      </div>
    </div>
  );
}