import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

const GameInfo: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <>
      <button 
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        onClick={() => setShowInfo(true)}
      >
        <Info size={20} />
      </button>
      
      {showInfo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Karma Kingdom: How To Play</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowInfo(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <section>
                <h3 className="font-semibold text-gray-800 mb-2">Game Objective</h3>
                <p className="text-gray-600">
                  Collect the most karma by strategically moving around the board, landing on event tiles, and using special abilities to outmaneuver your opponents.
                </p>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-800 mb-2">Tile Types</h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-300 rounded-sm inline-block"></span>
                    <span><b>Event Tiles:</b> Collect karma when you land on these tiles.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-300 rounded-sm inline-block"></span>
                    <span><b>Steal Tiles:</b> Activate stealing opportunities when landing here.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-300 rounded-sm inline-block"></span>
                    <span><b>Safe Tiles:</b> Protected spaces where karma cannot be stolen.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-300 rounded-sm inline-block"></span>
                    <span><b>Start Tiles:</b> Player starting positions.</span>
                  </li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-800 mb-2">Special Abilities</h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-2">
                  <li><b>Double Move:</b> Make two moves in one turn. Unlocks at 50 karma.</li>
                  <li><b>Teleport:</b> Move to any tile on the board. Unlocks at 100 karma.</li>
                  <li><b>Steal:</b> Take karma directly from another player. Unlocks at 200 karma.</li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-800 mb-2">Game Cycle</h3>
                <p className="text-gray-600">
                  The game runs in weekly cycles. At the end of each week, the player with the most karma wins, and a new game board is generated.
                </p>
              </section>
              
              <div className="text-xs text-gray-400 mt-4 pt-4 border-t">
                <p>This is a simplified prototype of the game. The full version would include Reddit integration, blockchain features, and more!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameInfo;