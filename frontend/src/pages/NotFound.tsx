import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[80vh] px-4">
            <div className="text-center">
                <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-transparent to-transparent blur-3xl -z-10" />
                    <Music className="w-24 h-24 mx-auto mb-6 text-primary animate-pulse" />
                    <h1 className="text-8xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        404
                    </h1>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Page Not Found
                </h2>

                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                    Looks like this page went off-beat. Let's get you back to the music.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="bg-primary hover:bg-primary/80 px-8 py-3 rounded-full flex items-center gap-2 font-medium inline-flex transition-all duration-300 transform hover:scale-105"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </button>
            </div>
        </div>
    );
}