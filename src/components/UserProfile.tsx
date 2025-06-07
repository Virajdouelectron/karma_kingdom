import React from 'react';
import { LogOut, User, Trophy, Calendar } from 'lucide-react';
import { useRedditAuth } from '../hooks/useRedditAuth';

const UserProfile: React.FC = () => {
  const { user, logout, isLoading } = useRedditAuth();

  if (!user) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
            {user.icon_img ? (
              <img 
                src={user.icon_img.replace(/&amp;/g, '&')} 
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="text-gray-400" size={24} />
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-white font-semibold">u/{user.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Trophy size={14} className="text-orange-400" />
                {user.total_karma.toLocaleString()} karma
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Since {formatDate(user.created_utc)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:bg-red-800 disabled:cursor-not-allowed"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;