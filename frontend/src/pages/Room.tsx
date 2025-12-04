import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Plus } from 'lucide-react';
import LoadingAnimation from '../components/LoadingAnimation';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { useParams } from 'react-router-dom';
const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
export type RoomProps = {
}

const Room = () => {
  const { name } = useParams();
  const [videoUrl, setVideoUrl] = useState('');
  const [currentRoom, setCurrentRoom] = useState({
    name: name,
    currentTrack: {
      url: null,
    },
    queue: [],
  })

  const { socketRef, loading, joinRoom } = useSocketConnection(`${VITE_SOCKET_URL}/ws/room/${name}`);

  useEffect(() => {
    if (socketRef?.current) {
      joinRoom();
    }
  }, [socketRef.current])

  const handleAddToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    try {
      const url = new URL(videoUrl);
      const videoId = url.searchParams.get('v');

      if (!videoId) {
        alert('Please enter a valid YouTube URL');
        return;
      }

      // addToQueue(id!, {
      //   id: videoId,
      //   title: 'YouTube Video', // We could fetch the actual title using YouTube API
      //   artist: 'Unknown',
      //   duration: 0,
      //   thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      //   url: videoUrl
      // });

      setVideoUrl('');
    } catch (error) {
      alert('Please enter a valid YouTube URL');
    }

    if (loading) {
      return <LoadingAnimation />;
    }

    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-6 rounded-lg mb-8">
              <h1 className="text-2xl font-bold mb-4">{currentRoom.name}</h1>

              <form onSubmit={handleAddToQueue} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Paste YouTube URL..."
                    className="flex-1 p-3 bg-background/60 border border-primary/20 rounded focus:border-primary/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/80 px-4 rounded flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>
              </form>

              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {currentRoom.currentTrack ? (
                  <ReactPlayer
                    url={currentRoom.currentTrack.url}
                    width="100%"
                    height="100%"
                    controls
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No track playing
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Queue</h2>
            {currentRoom.queue.length > 0 ? (
              <div className="space-y-4">
                {currentRoom.queue.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center space-x-3 p-2 hover:bg-primary/10 rounded border border-primary/10"
                  >
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{track.title}</h3>
                      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Queue is empty</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  export default Room;