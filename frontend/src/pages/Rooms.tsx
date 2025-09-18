import { CreateRoomForm } from '../components/CreateRoomForm';
import { YourRooms } from '../components/YourRooms';
import { BrowseRooms } from '../components/BrowseRooms';

export function Rooms() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Music Rooms</h1>
        <p className="text-gray-400">Create your own room or join existing ones to share music together</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Create Room */}
        <div className="lg:col-span-4 xl:col-span-3">
          <CreateRoomForm />
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Your Rooms - Horizontal Layout */}
          <YourRooms />
          
          {/* Browse All Rooms */}
          <BrowseRooms />
        </div>
      </div>
    </div>
  );
}