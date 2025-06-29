import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { useRedditAuth } from './hooks/useRedditAuth';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameStatus from './components/GameStatus';
import GameInfo from './components/GameInfo';
import RedditAuth from './components/RedditAuth';
import RedditCallback from './components/RedditCallback';
import UserProfile from './components/UserProfile';
import { ArrowUp, Loader } from 'lucide-react';

const GameApp: React.FC = () => {
  const { isAuthenticated, isLoading, error } = useRedditAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-orange-400 mx-auto mb-4" size={48} />
          <p className="text-gray-300">Loading Karma Kingdom...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-6 rounded-lg max-w-md">
          <h2 className="font-bold mb-2">Authentication Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isAuthenticated && <RedditAuth />}
      <GameProvider>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
          <header className="max-w-lg mx-auto mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-orange-400 flex items-center justify-center gap-2">
              <ArrowUp className="text-orange-500" />
              Karma Kingdom: The Upvote Heist
            </h1>
            <p className="text-gray-300 text-sm mt-2">
              A Reddit-inspired board game prototype
            </p>
          </header>

          <main className="max-w-lg mx-auto space-y-6">
            {isAuthenticated && <UserProfile />}
            <GameStatus />
            <GameBoard />
            <GameControls />
          </main>

          <GameInfo />
        </div>
      </GameProvider>
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<RedditCallback />} />
        <Route path="/" element={<GameApp />} />
      </Routes>
    </Router>
  );
}

export default App;