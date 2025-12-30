import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player/youtube';
import { AlertTriangleIcon, Loader2, Plus, Music, ArrowLeft } from 'lucide-react';
import LoadingAnimation from '../components/LoadingAnimation';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { useParams, useNavigate } from 'react-router-dom';
import useSnackbar from '../hooks/useSnackbar';
import { RequestBuilder } from '../shared/RequestBuilder';
import Modal from '../components/Modal';
const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export type RoomProps = {
}

const Room = () => {
  const { name = "" } = useParams();
  const navigate = useNavigate();
  const {
    videoUrl,
    setVideoUrl,
    loading,
    currentRoom,
    socketRef,
    joinRoom,
    addToQueue,
    playNextInQueue,
    retryModalState,
    closeRetryModal,
    handleRetryConnection,
  } = useSocketConnection(`${VITE_SOCKET_URL}/ws/room/${name}`, name);
  const { showError } = useSnackbar();
  const [loadingAddToQueue, setLoadingAddToQueue] = useState(false);

  function formatNameForTitle(name: string) {
    return name.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  useEffect(() => {
    if (!name) {
      navigate('/');
    } else {
      const title = formatNameForTitle(name);
      document.title = `${title} - SongCircle`;
    }
  }, [name, navigate])

  useEffect(() => {
    if (socketRef?.current) {
      joinRoom();
    }
  }, [socketRef.current])

  const fetchMetaData = async (url: string) => {
    try {
      const response = await RequestBuilder(`${VITE_BACKEND_URL}/api/metadata?url=${url}`);
      if (!response.ok) {
        throw new Error(response?.message || 'Failed to fetch details of video. Please try again.');
      }
      return response;
    } catch (error) {
      console.log('Error fetching metadata:', error);
      throw error;
    }
  }

  const handleAddToQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    try {
      new URL(videoUrl);
    } catch {
      showError('Enter a valid URL!');
      return;
    }

    try {
      setLoadingAddToQueue(true);
      const response = await fetchMetaData(videoUrl);
      const { data } = response;
      addToQueue(data);
      setVideoUrl('');
    } catch (error) {
      console.log('Error in handleAddToQueue:', error);
      if (error instanceof Error)
        showError(error?.message);
      else showError('An unexpected error occurred while adding to queue.');
    } finally {
      setLoadingAddToQueue(false);
    }
  }

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      {
        retryModalState.show && (
          <Modal
            title='Connection Lost'
            message='The connection to the server was lost. Would you like to retry connecting to the room?'
            onClose={closeRetryModal}
            onSubmit={handleRetryConnection}
            submitText={'Refresh'}
            closeText='Cancel'
            icon={<AlertTriangleIcon className='w-8 h-8 text-primary' />}
          />
        )
      }
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-4 sm:mb-6 text-primary hover:text-primary/80 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm sm:text-base">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background/30 backdrop-blur-md border border-primary/20 p-4 sm:p-5 md:p-8 rounded-lg sm:rounded-xl shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="h-1 w-6 sm:w-8 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-widest">Room</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent line-clamp-2">{currentRoom.name}</h1>

              <form onSubmit={handleAddToQueue} className="mt-4 sm:mt-5 md:mt-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="flex-1 relative group">
                    <input
                      disabled={loadingAddToQueue || !currentRoom?.isAdminPresent}
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder={currentRoom?.isAdminPresent ? "Paste a YouTube URL..." : "Waiting for admin to join..."}
                      className="w-full p-3 sm:p-4 text-sm sm:text-base bg-background/80 border border-primary/30 rounded-lg focus:border-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    disabled={loadingAddToQueue || !currentRoom?.isAdminPresent}
                    type="submit"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-6 py-3 sm:py-4 rounded-lg flex items-center justify-center sm:justify-start gap-2 font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {
                      loadingAddToQueue ? (
                        <Loader2 className='animate-spin w-5 h-5' />
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span>Add</span>
                        </>
                      )
                    }
                  </button>
                </div>
              </form>

              {currentRoom?.isAdmin && (
                <div className="aspect-video bg-gradient-to-br from-black via-gray-900 to-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 mt-4 sm:mt-5 md:mt-6">
                  {currentRoom.currentTrack ? (
                    <>
                      <ReactPlayer
                        // key={currentRoom.currentTrack.id}
                        url={currentRoom.currentTrack.url}
                        width="100%"
                        height="100%"
                        controls={true}
                        playing={true}
                        onEnded={() => {
                          playNextInQueue();
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3 text-xs sm:text-sm">
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
                      <div className="text-center p-4">
                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 md:w-20 md:h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mb-1 sm:mb-2 md:mb-4">
                          <Music className="w-5 sm:w-7 md:w-10 h-5 sm:h-7 md:h-10 text-primary/60" />
                        </div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2">No track playing</h3>
                        <p className="text-xs sm:text-sm text-gray-400 max-w-xs">Waiting for the next song in the queue to start</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {currentRoom.currentTrack && (
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background/30 backdrop-blur-md border border-primary/20 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-xl ring-1 ring-white/5">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className="relative group flex-shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-lg sm:rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition"></div>
                    <img
                      src={currentRoom.currentTrack.thumbnail}
                      alt={currentRoom.currentTrack.title}
                      className="relative w-20 sm:w-24 md:w-28 h-20 sm:h-24 md:h-28 rounded-lg object-cover shadow-xl"
                    />
                  </div>
                  <div className="flex-1 pt-0 sm:pt-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="h-0.5 w-3 sm:w-4 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
                      <p className="text-xs text-primary/80 font-bold uppercase tracking-widest">Now Playing</p>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight mb-1 sm:mb-2 line-clamp-2">{currentRoom.currentTrack.title}</h3>
                    <p className="text-sm sm:text-base text-gray-300 font-medium truncate">{currentRoom.currentTrack.artist}</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">Added by <span className="text-primary font-semibold">{currentRoom.currentTrack.addedBy}</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-b from-primary/10 to-background/30 backdrop-blur-md border border-primary/20 p-4 sm:p-5 md:p-8 rounded-lg sm:rounded-xl shadow-lg ring-1 ring-white/5 h-fit lg:sticky lg:top-4 md:top-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="h-1 w-6 sm:w-8 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Queue</h2>
              <span className="ml-auto text-xs font-semibold text-primary/80 bg-primary/20 px-2 py-1 rounded-full">{currentRoom.queue.length}</span>
            </div>
            {currentRoom.queue.length > 0 && currentRoom?.isAdminPresent ? (
              <div className="space-y-2 sm:space-y-3">
                {currentRoom.queue.map((track, index) => (
                  <div
                    key={track.id}
                    className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-primary/10 to-transparent hover:from-primary/20 hover:to-primary/10 rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-200 cursor-pointer"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-10 sm:w-14 h-10 sm:h-14 rounded-md object-cover shadow-md group-hover:shadow-lg transition-shadow"
                      />
                      <span className="absolute -top-2 -right-2 w-4 sm:w-5 h-4 sm:h-5 bg-primary/80 text-white text-xs font-bold rounded-full flex items-center justify-center text-[10px] sm:text-xs">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate group-hover:text-primary transition-colors text-sm sm:text-base">{track.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{track.artist}</p>
                      <p className="text-xs text-gray-500 mt-0.5">by <span className="text-primary/70 font-medium">{track.addedBy}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentRoom?.isAdminPresent ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 bg-primary/10 rounded-full mb-2 sm:mb-3">
                  <div className="w-6 sm:w-7 h-6 sm:h-7 border border-dashed border-primary/40 rounded-full"></div>
                </div>
                <p className="text-gray-400 font-medium text-sm sm:text-base">Queue is empty</p>
                <p className="text-xs text-gray-500 mt-1">Add songs to get started</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 bg-yellow-500/20 rounded-full mb-2 sm:mb-3">
                  <div className="w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-yellow-600/80 font-semibold text-sm sm:text-base">Waiting for admin to join</p>
                <p className="text-xs text-gray-500 mt-1">Room will be active once admin connects</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;