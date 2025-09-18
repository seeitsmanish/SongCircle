import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Disc2, ArrowRight, Users, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useUser } from '@clerk/clerk-react';

const ROOMS_PER_PAGE = 6;

export function BrowseRooms() {
  const { rooms } = useStore();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'queue' | 'recent'>('recent');

  const allRooms = useMemo(() => 
    rooms.filter(room => room.createdBy !== user?.id), // Exclude user's own rooms
    [rooms, user?.id]
  );

  const filteredAndSortedRooms = useMemo(() => {
    let filtered = allRooms.filter(room =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort rooms
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'queue':
          return (b.queue?.length || 0) - (a.queue?.length || 0);
        case 'recent':
        default:
          return b.id.localeCompare(a.id); // Assuming newer IDs are lexicographically larger
      }
    });

    return filtered;
  }, [allRooms, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedRooms.length / ROOMS_PER_PAGE);
  const paginatedRooms = useMemo(() => 
    filteredAndSortedRooms.slice(
      (currentPage - 1) * ROOMS_PER_PAGE,
      currentPage * ROOMS_PER_PAGE
    ),
    [filteredAndSortedRooms, currentPage]
  );

  // Reset to first page when search or sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-4 md:p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" /> 
          Browse All Rooms ({allRooms.length})
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
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'queue' | 'recent')}
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
        {paginatedRooms.length > 0 ? (
          <>
            <div className="grid gap-3">
              {paginatedRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => navigate(`/room/${room.id}`)}
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
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-background/60 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="hidden sm:inline text-xs text-gray-500">
                    ({filteredAndSortedRooms.length} rooms)
                  </span>
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-background/60 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
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
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 mb-2">No public rooms available</p>
            <p className="text-sm text-gray-500">Be the first to create a room!</p>
          </div>
        )}
      </div>
    </div>
  );
}