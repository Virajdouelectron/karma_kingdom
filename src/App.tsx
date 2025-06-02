import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameStatus from './components/GameStatus';
import GameInfo from './components/GameInfo';
import RedditAuth from './components/RedditAuth';
import RedditCallback from './components/RedditCallback';
import { ArrowUp } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const token = localStorage.getItem('redditAccessToken');
      if (token) {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/callback" element={<RedditCallback />} />
        <Route path="/" element={
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
                  <GameStatus />
                  <GameBoard />
                  <GameControls />
                </main>

                <GameInfo />
              </div>
            </GameProvider>
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;