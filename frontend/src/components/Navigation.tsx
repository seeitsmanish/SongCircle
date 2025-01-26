import React from 'react';
import { Link } from 'react-router-dom';
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { Music } from 'lucide-react';

export function Navigation() {
  const { isSignedIn } = useUser();

  return (
    <nav className="bg-background/50 backdrop-blur-sm border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Music className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-white">SongCircle</span>
          </Link>

          <div>
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <button className="bg-primary hover:bg-primary/80 px-4 py-2 rounded">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}