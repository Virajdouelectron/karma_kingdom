import React, { useState, useEffect } from 'react';
import { Settings, Save, Eye, EyeOff, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { updateRedditConfig, getActiveRedditConfig } from '../services/supabaseClient';
import { redditAuth } from '../services/redditAuth';

const AdminPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState('oRHe6dkduxlHnAT8PEh2AQ');
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
        // Set default redirect URI based on current environment
        const currentUrl = window.location.origin;
        setRedirectUri(currentUrl + '/auth/callback');
        // Keep the pre-filled client ID
        setClientId('oRHe6dkduxlHnAT8PEh2AQ');
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      // Set default redirect URI based on current environment
      const currentUrl = window.location.origin;
      setRedirectUri(currentUrl + '/auth/callback');
      // Keep the pre-filled client ID
      setClientId('oRHe6dkduxlHnAT8PEh2AQ');
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
        
        setMessage({ type: 'success', text: 'Reddit OAuth configuration updated successfully! You can now close this panel and try logging in.' });
        
        // Clear the client secret after saving
        setTimeout(() => {
          setClientSecret('');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update configuration' });
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      setMessage({ type: 'error', text: `Failed to update configuration: ${error instanceof Error ? error.message : 'Unknown error'}` });
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
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
            <p className="text-xs text-blue-400 mt-1">
              Current: {clientId || 'Not set'}
            </p>
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
            <p className="text-xs text-gray-400 mt-1">
              Current domain: {window.location.origin}
            </p>
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
            <p className="mb-3"><strong>Setup Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Visit{' '}
                <a 
                  href="https://www.reddit.com/prefs/apps" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-300 hover:underline inline-flex items-center gap-1"
                >
                  Reddit Apps <ExternalLink size={12} />
                </a>
              </li>
              <li>Click "Create App" or "Create Another App"</li>
              <li>Choose "web app" as the app type</li>
              <li>Set the redirect URI to: <code className="bg-gray-700 px-1 rounded text-orange-300">{redirectUri}</code></li>
              <li>Copy the client ID (string under your app name)</li>
              <li>Paste the client ID above and save</li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
              <p className="text-blue-300 text-xs">
                <strong>Important:</strong> Make sure your Reddit app's redirect URI exactly matches the one shown above, including the protocol (https://).
              </p>
            </div>
            
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <p className="text-yellow-300 text-xs">
                <strong>For Production:</strong> You need to update your Reddit app's redirect URI to use the deployed domain: <code className="bg-gray-700 px-1 rounded">{window.location.origin}/auth/callback</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;