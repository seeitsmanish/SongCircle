import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Music, ArrowRight, Users, Radio, Speaker } from 'lucide-react';

export function Home() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const { openSignIn } = useClerk();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-24 pt-16">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl -z-10" />
          <Music className="w-20 h-20 mx-auto mb-6 text-primary animate-pulse" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Let Your Fans Choose the Beat
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Empower your audience to curate your music stream. Connect with fans like never before.
          </p>
          <div className="flex justify-center gap-4">
            {isSignedIn ? (
              <button
                onClick={() => navigate('/rooms')}
                className="bg-primary hover:bg-primary/80 px-8 py-3 rounded-full flex items-center gap-2 font-medium"
              >
                Browse Rooms <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => openSignIn()}
                className="bg-primary hover:bg-primary/80 px-8 py-3 rounded-full flex items-center gap-2 font-medium"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-24">
        <h2 className="text-2xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-8 rounded-lg text-center group hover:border-primary/40 transition-colors">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">Fan Interaction</h3>
            <p className="text-gray-400">Let fans choose the music and shape your stream's soundtrack.</p>
          </div>
          <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-8 rounded-lg text-center group hover:border-primary/40 transition-colors">
            <Radio className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">Live Streaming</h3>
            <p className="text-gray-400">Stream with real-time input from your audience.</p>
          </div>
          <div className="bg-background/40 backdrop-blur-sm border border-primary/20 p-8 rounded-lg text-center group hover:border-primary/40 transition-colors">
            <Speaker className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">High-Quality Audio</h3>
            <p className="text-gray-400">Crystal clear sound quality for the best experience.</p>
          </div>
        </div>
      </div>
    </div>
  );
}