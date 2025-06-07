# Karma Kingdom: The Upvote Heist

A Reddit-inspired board game prototype with secure OAuth2 integration.

## Features

- **Secure Reddit OAuth2 Authentication**: Complete OAuth2 flow with proper token management
- **Reddit API Integration**: Fetches real user data and karma
- **Turn-based Gameplay**: Strategic board game with karma collection
- **Special Abilities**: Unlock powers based on karma thresholds
- **AI Opponents**: Compete against intelligent bots
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Reddit App Registration

1. Visit [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Fill in the form:
   - **Name**: Karma Kingdom
   - **App type**: Web app
   - **Description**: A Reddit-inspired board game
   - **About URL**: (optional)
   - **Redirect URI**: `http://localhost:5173/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

4. Click "Create app"
5. Copy your **Client ID** (the string under your app name)

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Reddit app credentials:
   ```env
   VITE_REDDIT_CLIENT_ID=your_reddit_client_id_here
   VITE_REDDIT_REDIRECT_URI=http://localhost:5173/auth/callback
   VITE_APP_URL=http://localhost:5173
   ```

### 3. Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Production Deployment

For production deployment:

1. Update your Reddit app's redirect URI to your production domain
2. Update `.env` variables for production:
   ```env
   VITE_REDDIT_REDIRECT_URI=https://yourdomain.com/auth/callback
   VITE_APP_URL=https://yourdomain.com
   ```

## Security Features

- **OAuth2 Flow**: Secure authorization code flow with PKCE-like state verification
- **Token Management**: Automatic token refresh and secure storage
- **Rate Limiting**: Built-in rate limiting for Reddit API calls
- **Error Handling**: Comprehensive error handling and user feedback
- **CSRF Protection**: State parameter validation prevents CSRF attacks

## API Endpoints Used

- `GET /api/v1/me` - Get current user information
- `POST /api/v1/access_token` - Token exchange and refresh
- `POST /api/v1/revoke_token` - Token revocation

## Required Reddit API Scopes

- `identity` - Access to user account information
- `read` - Read access to posts and comments
- `submit` - Submit posts and comments
- `vote` - Vote on posts and comments

## Architecture

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **Routing**: React Router
- **Authentication**: Custom OAuth2 service
- **Icons**: Lucide React

## Game Rules

1. **Objective**: Collect the most karma by moving around the board
2. **Movement**: Move to adjacent tiles (including diagonals)
3. **Tile Types**:
   - **Event Tiles**: Collect karma when landing
   - **Steal Tiles**: Opportunity to steal from other players
   - **Safe Tiles**: Protected from karma theft
   - **Start Tiles**: Player starting positions

4. **Special Abilities** (unlocked by karma thresholds):
   - **Double Move** (50 karma): Make two moves in one turn
   - **Teleport** (100 karma): Move to any tile on the board
   - **Steal** (200 karma): Take karma directly from another player

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details