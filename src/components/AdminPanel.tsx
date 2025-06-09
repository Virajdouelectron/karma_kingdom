import React, { useState, useEffect } from 'react';
import { Settings, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { updateRedditConfig, getActiveRedditConfig } from '../services/supabaseClient';
import { redditAuth } from '../services/redditAuth';

const AdminPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCurrentConfig();
    }
  }, [isOpen]);

  const loadCurrentConfig = async () => {
    try {
      const config = await getActiveRedditConfig();
      if (config) {
        setClientId(config.client_id);
        setRedirectUri(config.redirect_uri);
      } else {
        // Set default redirect URI
        setRedirectUri(window.location.origin + '/auth/callback');
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleSave = async () => {
    if (!clientId.trim()) {
      setMessage({ type: 'error', text: 'Client ID is required' });
      return;
    }

    if (!redirectUri.trim()) {
      setMessage({ type: 'error', text: 'Redirect URI is required' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const configId = await updateRedditConfig(
        clientId.trim(),
        clientSecret.trim() || undefined,
        redirectUri.trim()
      );

      if (configId) {
        // Refresh the Reddit auth service configuration
        await redditAuth.refreshConfig();
        
        setMessage({ type: 'success', text: 'Reddit OAuth configuration updated successfully!' });
        
        // Clear the form after a delay
        setTimeout(() => {
          setClientSecret('');
          setMessage(null);
        }, 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update configuration' });
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      setMessage({ type: 'error', text: 'Failed to update configuration' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full shadow-lg transition-colors z-40"
        title="Admin Settings"
      >
        <Settings size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Reddit OAuth Configuration</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reddit Client ID *
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-orange-500 focus:outline-none"
              placeholder="Enter Reddit app client ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reddit Client Secret (Optional)
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-orange-500 focus:outline-none"
                placeholder="Enter Reddit app client secret"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Redirect URI *
            </label>
            <input
              type="url"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-orange-500 focus:outline-none"
              placeholder="https://yourdomain.com/auth/callback"
            />
          </div>

          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-500/20 border border-green-500 text-green-200' 
                : 'bg-red-500/20 border border-red-500 text-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:bg-orange-800 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Save size={16} />
              )}
              Save Configuration
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-700">
            <p className="mb-2"><strong>Setup Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Visit <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">Reddit Apps</a></li>
              <li>Create a new "web app"</li>
              <li>Set the redirect URI to the value above</li>
              <li>Copy the client ID and paste it here</li>
              <li>Save the configuration</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;