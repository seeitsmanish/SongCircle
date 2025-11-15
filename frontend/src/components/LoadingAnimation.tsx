import { Music } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const loadingMessages: string[] = [
    // 🎶 Music-Themed
    "Tuning the instruments...",
    "Warming up the speakers 🔊",
    "Mixing the perfect vibe...",
    "Finding the next banger 🎧",
    "Spinning up your playlist...",
    "Dropping the beat in 3… 2… 1…",
    "Syncing rhythm with your friends...",
    "Turning up the volume of friendship 🎵",
    "Downloading good vibes only...",
    "Getting your SongCircle in harmony...",
    "Equalizing awesomeness...",
    "Queueing the queue 👀",
    "Preparing the stage for your jam session...",
    "Fetching tracks from the cloud (and a bit of heaven ☁️)",

    // 💬 Playful / Social
    "Making sure everyone’s in tune...",
    "Grabbing snacks for the listening party 🍿",
    "Inviting your friends to the circle...",
    "Just one more chorus before we start...",
    "Syncing beats across the universe 🌍",
    "Getting the DJ ready (he overslept again)",

    // 🧠 Fake “Fun Facts”
    "Fun fact: The first song ever hummed was probably out of tune.",
    "Fun fact: 87% of people nod their heads while waiting for a song to load.",
    "Fun fact: Our servers are dancing right now.",
    "Fun fact: Silence is just music waiting to happen.",
    "Fun fact: You’re 5 seconds away from your next earworm."
];

const LoadingAnimation = () => {
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const randIndex = Math.floor(Math.random() * loadingMessages.length);
        setMessage(loadingMessages[randIndex]);
        const intervalId = setInterval(() => {
            const randIndex = Math.floor(Math.random() * loadingMessages.length);
            setMessage(loadingMessages[randIndex]);
        }, 4000);

        return () => clearInterval(intervalId);
    }, [])

    return (
        <div className="fixed inset-0 w-[100dvw] h-[100dvh] overflow-hidden flex flex-col justify-center items-center">
            <div className=''>
                <Music className="w-12 h-12 mx-auto mb-1 text-primary animate-pulse" />
                <p className="ml-4 text-gray-400 text-center">{message}</p>
            </div>
        </div>
    )

}

export default LoadingAnimation;