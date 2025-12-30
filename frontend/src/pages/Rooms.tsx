import { useState } from 'react';
import { CreateRoomForm } from '../components/CreateRoomForm';
import { YourRooms } from '../components/YourRooms';
import { BrowseRooms } from '../components/BrowseRooms';
import { Plus, History, Users, ArrowLeft } from 'lucide-react';

type ViewOption = 'create' | 'your' | 'browse' | null;

export function Rooms() {
  const [selectedView, setSelectedView] = useState<ViewOption>(null);

  const navigationCards = [
    {
      id: 'create' as ViewOption,
      title: 'Create Room',
      description: 'Create your own music room',
      icon: Plus,
      color: 'from-emerald-600/10 to-green-500/10',
      borderColor: 'border-emerald-500/20',
      hoverBorder: 'hover:border-emerald-500/40',
      iconColor: 'text-emerald-500'
    },
    {
      id: 'your' as ViewOption,
      title: 'Your Rooms',
      description: 'View and manage your rooms',


      icon: History,
      color: 'from-blue-600/10 to-indigo-500/10',
      borderColor: 'border-blue-500/20',
      hoverBorder: 'hover:border-blue-500/40',
      iconColor: 'text-blue-500'
    },
    {
      id: 'browse' as ViewOption,
      title: 'Browse Rooms',
      description: 'Discover and join other rooms',
      icon: Users,
      color: 'from-purple-600/10 to-pink-500/10',
      borderColor: 'border-purple-500/20',
      hoverBorder: 'hover:border-purple-500/40',
      iconColor: 'text-purple-500'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-full">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">Music Rooms</h1>
        <p className="text-gray-400 text-lg">Create your own room or join existing ones to share music together</p>
      </div>

      {!selectedView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {navigationCards.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedView(card.id)}
              className={`group relative p-8 rounded-xl border backdrop-blur-sm transition-all duration-300 
                ${card.borderColor} bg-black/20 ${card.hoverBorder} hover:scale-[1.02]`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 rounded-xl" />
              <card.icon className={`w-10 h-10 mb-4 transition-transform duration-300 group-hover:scale-110 ${card.iconColor}`} />
              <h3 className="text-xl font-semibold mb-2 text-gray-200">{card.title}</h3>
              <p className="text-sm text-gray-400">{card.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className='max-w-lg mx-auto'>
          <button
            onClick={() => setSelectedView(null)}
            className="group flex items-center space-x-2 mb-8 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back to options</span>
          </button>

          <div className="max-w-3xl w-fit mx-auto">
            {selectedView === 'create' && <CreateRoomForm />}
            {selectedView === 'your' && <YourRooms />}
            {selectedView === 'browse' && <BrowseRooms />}
          </div>
        </div>
      )}
    </div>
  );
}