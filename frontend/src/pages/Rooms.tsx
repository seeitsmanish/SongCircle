import { CreateRoomForm } from '../components/CreateRoomForm';
import { YourRooms } from '../components/YourRooms';
import { BrowseRooms } from '../components/BrowseRooms';

export function Rooms() {

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <CreateRoomForm />
          <YourRooms />
        </div>
        <div className="lg:col-span-2">
          <BrowseRooms />
        </div>
      </div>
    </div>
  );
}