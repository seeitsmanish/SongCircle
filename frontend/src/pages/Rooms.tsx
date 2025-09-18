import { CreateRoomForm } from '../components/CreateRoomForm';
import { YourRooms } from '../components/YourRooms';
import { BrowseRooms } from '../components/BrowseRooms';

export function Rooms() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Music Rooms</h1>
        <p className="text-gray-400">Create your own room or join existing ones to share music together</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Create Room & Your Rooms */}
        <div className="xl:col-span-1 space-y-6">
          <CreateRoomForm />
          <YourRooms />
        </div>
        
        {/* Right Column - Browse All Rooms */}
        <div className="xl:col-span-2">
          <BrowseRooms />
        </div>
      </div>
    </div>
  );
}