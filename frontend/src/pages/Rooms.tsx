import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Search, Plus, History, Disc2, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Rooms() {
  const { user, isSignedIn } = useUser();
  const { rooms, createRoom } = useStore();
  const navigate = useNavigate();
  const [newRoomName, setNewRoomName] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !newRoomName.trim()) return;
    const room = createRoom(newRoomName, user.id);
    setNewRoomName('');
    navigate(`/room/${room.id}`);
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const joinedRooms = rooms.filter(room => room.createdBy === user?.id);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create Room Section */}
        <div className="lg:col-span-1">
          <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Create Room
            </h2>
            <form onSubmit={handleCreateRoom}>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full p-3 mb-4 bg-background/60 border border-primary/20 rounded focus:border-primary/50 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
              >
                Create Room <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Recently Joined */}
          <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5" /> Your Rooms
            </h2>
            <div className="space-y-2">
              {joinedRooms.length > 0 ? (
                joinedRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => navigate(`/room/${room.id}`)}
                    className="flex items-center gap-3 p-3 bg-background/60 border border-primary/20 rounded cursor-pointer hover:bg-primary/10 group"
                  >
                    <Disc2 className="w-5 h-5 text-primary" />
                    <span>{room.name}</span>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No rooms created yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Browse Rooms Section */}
        <div className="lg:col-span-2">
          <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-6 rounded-lg">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold">Browse Rooms</h2>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rooms..."
                  className="w-full p-2 pl-10 bg-background/60 border border-primary/20 rounded focus:border-primary/50 focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="grid gap-3">
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
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
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No rooms found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}