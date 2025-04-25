# QBS Voice Assistant Requirements
## Version 1.0.0 - April 2023

## Core Technologies
- NodeJS >= 18.0.0
- TypeScript >= 5.0.0
- React >= 18.2.0

## Frontend Dependencies
- react-dom = 18.2.0
- @tanstack/react-query
- react-hook-form
- tailwindcss
- lucide-react
- wouter (for routing)
- zod (for validation)
- shadcn/ui components
- framer-motion
- axios

## Backend Dependencies
- express
- drizzle-orm
- @neondatabase/serverless
- postgresql >= 15.0

## Voice Assistant Features
- Web Speech Recognition API
- Web Speech Synthesis API

## Browser Compatibility
- Google Chrome (recommended)
- Microsoft Edge
- Firefox (partial support)

## Notes
- Microphone access is required for voice recognition
- Internet connection is required for QBS API access
- The application works best on desktop browsers with microphone permissions

## Voice Commands Supported
- "show user list" - Displays all users in the QBS system
- "check inventory for [product]" - Checks inventory for specific products
- "show orders" - Lists all open orders
- "show contact list" - Displays all contacts in the system
- "show supplier list" - Lists all suppliers

## Voice Settings
- Voice is configured to be softer and more natural
- Pitch: 0.9 (slightly lower)
- Rate: 0.95 (slightly slower)
- Volume: 0.85 (slightly quieter)
- Attempts to use female voices or alternative non-default voices when available

## Installation
All dependencies are managed through the package.json file. The application can be started with:
```
npm run dev
```

## Project Structure
- client/ - React frontend
- server/ - Express backend
- shared/ - Shared types and schemas